import { NextResponse } from 'next/server';
import { getProgress, updateProgress, getProfile } from '@/app/minicourse/supabase';
import { sendTelegramNotification } from '@/app/minicourse/bot';
import { Receiver } from '@upstash/qstash';

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('upstash-signature');
    const rawBody = await req.text();

    const isDev = process.env.NODE_ENV === 'development';
    const hasKeys = process.env.QSTASH_CURRENT_SIGNING_KEY && process.env.QSTASH_CURRENT_SIGNING_KEY !== 'mock_current_signing_key';

    // 1. Signature validation
    if (hasKeys && !isDev) {
      if (!signature) {
        return NextResponse.json({ success: false, error: 'Missing upstash-signature header' }, { status: 401 });
      }
      
      const isValid = await receiver.verify({
        signature,
        body: rawBody,
      });

      if (!isValid) {
        return NextResponse.json({ success: false, error: 'Invalid signature verification' }, { status: 401 });
      }
    } else {
      console.log('[QStash Verification] Signature verification skipped in mock/development mode.');
    }

    // 2. Parse request payload
    const { userId, lessonId } = JSON.parse(rawBody);
    if (!userId || !lessonId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters in webhook body' }, { status: 400 });
    }

    const lessonNum = Number(lessonId) as 1 | 2 | 3;

    // 3. Fetch progress to verify current status
    const progress = await getProgress(userId);
    if (!progress || !progress.lessons || !progress.lessons[lessonNum]) {
      return NextResponse.json({ success: false, error: 'Progression not found' }, { status: 404 });
    }

    const lesson = progress.lessons[lessonNum];

    // If homework has already been submitted or is approved, cancel reminder execution
    if (lesson.hwSubmitted || lesson.hwStatus === 'accepted' || lesson.hwStatus === 'pending') {
      console.log(`[QStash Webhook] Student ${userId} has already submitted or cleared Lesson ${lessonNum}. Cancelling notification.`);
      
      await updateProgress(userId, lessonNum, {
        qstashMsgId: null,
        notificationStatus: 'cancelled'
      });
      
      return NextResponse.json({ success: true, message: 'Notification cancelled: Homework already submitted' });
    }

    // 4. Send the Telegram notification
    const student = await getProfile(userId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }

    if (student.telegram_chat_id) {
      const sent = await sendTelegramNotification(
        student.telegram_chat_id,
        'reminder',
        {
          userName: student.name,
          lessonId: lessonNum
        }
      );

      if (!sent) {
        // Return 500 error so QStash retries notification delivery automatically
        console.error(`[QStash Webhook] Telegram API failed to deliver message to user ${userId}. Triggering retry.`);
        return NextResponse.json({ success: false, error: 'Telegram message delivery failed' }, { status: 500 });
      }
    } else {
      console.warn(`[QStash Webhook] User ${userId} has no telegram_chat_id linked. Skipping notification.`);
    }

    // 5. Update database notification status to sent
    await updateProgress(userId, lessonNum, {
      qstashMsgId: null,
      notificationStatus: 'sent'
    });

    return NextResponse.json({ success: true, message: 'Notification sent successfully' });
  } catch (error: any) {
    console.error('[QStash Webhook Delivery Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
