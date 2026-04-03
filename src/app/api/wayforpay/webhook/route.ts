import { NextResponse } from 'next/server';
import crypto from 'crypto';

const MERCHANT_ACCOUNT = process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'www_instagram_com_c1b32';
const MERCHANT_SECRET_KEY = (process.env.WAYFORPAY_SECRET_KEY || 'a8bfe52b32514b1b541bcb56b522b33de86c7970').trim();
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const urlOrderId = url.searchParams.get('orderId');
    const rawBody = await req.text();

    // Support URL-encoded form data or JSON
    let data: any = {};
    try {
      data = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      data = Object.fromEntries(params.entries());
    }

    // WayForPay keys can sometimes be case-sensitive or different
    const status = (data.transactionStatus || data.transaction_status || data.status || '') + '';
    let orderId = urlOrderId || data.orderReference || data.order_reference || '';
    orderId = (orderId + '').trim();

    if (!orderId) {
      console.warn("Webhook missing orderId:", { urlOrderId, body: data });
      return NextResponse.json({ success: false, message: 'Missing order reference' }, { status: 400 });
    }

    // Map statuses
    let finalStatus = 'Невідомий';
    const sLower = status.toLowerCase();
    
    if (sLower === 'approved' || sLower === 'settled') {
      finalStatus = 'Оплачено';
    } else if (sLower === 'declined') {
      finalStatus = 'Відхилено';
    } else if (sLower) {
      finalStatus = `WFP: ${status}`;
    }

    // Send webhook to Google Sheets (always log for debugging)
    if (GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_status',
            targetSheet: 'Заявки на практикум',
            orderId: orderId,
            status: finalStatus
          })
        });
      } catch (fetchErr) {
        console.error("Google Sheets update failed:", fetchErr);
      }
    }

    // Acknowledge WayForPay Request
    // It's important to use the orderId from the payload
    const time = Math.floor(Date.now() / 1000);
    const ackSignatureStr = `${orderId};accept;${time}`;
    const ackSignature = crypto
      .createHmac('md5', MERCHANT_SECRET_KEY)
      .update(ackSignatureStr)
      .digest('hex');

    return NextResponse.json({
      orderReference: orderId,
      status: 'accept',
      time,
      signature: ackSignature
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
