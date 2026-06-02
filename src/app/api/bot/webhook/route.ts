import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function POST(req: Request) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Telegram Bot Token is not configured' }, { status: 500 });
    }

    const payload = await req.json();

    // Check if this is a standard text message
    if (!payload.message || !payload.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = payload.message.chat.id;
    const text = payload.message.text.trim();
    const username = payload.message.from.username || '';
    const firstName = payload.message.from.first_name || 'Учасник';

    // Check for the start command: /start pay_[phone_or_order]
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      const startParam = parts.length > 1 ? parts[1] : '';

      if (startParam.startsWith('pay_')) {
        const token = startParam.substring(4); // Extract value after 'pay_'
        
        if (supabase) {
          // Look up user by phone or orderReference
          let query = supabase.from('minicourse_users').select('*');
          
          const isPhone = /^\d+$/.test(token);
          if (isPhone) {
            query = query.eq('phone', token);
          } else {
            // Otherwise, we search for orderId in leads to match user or query payment reference
            const { data: leadData } = await supabase
              .from('leads')
              .select('phone, telegram')
              .eq('order_id', token)
              .maybeSingle();

            if (leadData && leadData.phone) {
              query = query.eq('phone', leadData.phone);
            } else {
              // Fallback lookup
              query = query.ilike('telegram', token);
            }
          }

          const { data: user, error: fetchErr } = await query.maybeSingle();

          if (fetchErr) {
            console.error('[Bot Webhook] Error fetching student profile:', fetchErr);
          }

          if (user) {
            // Update telegram username and telegram_chat_id in database
            const { error: updateErr } = await supabase
              .from('minicourse_users')
              .update({
                telegram: username || user.telegram,
                telegram_chat_id: chatId
              })
              .eq('id', user.id);

            if (updateErr) {
              console.error('[Bot Webhook] Error updating student Telegram details:', updateErr);
            }

            // Send successful activation notification message
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
            const welcomeText = `🚀 *Вітаємо, ${firstName}! Ваш бот-компаньйон успішно активовано!* 🎉\n\nЯ буду надсилати вам нагадування про лекції, сповіщення про перевірку ДЗ від куратора та коментарі Софії.\n\nЗаходьте до вашого особистого кабінету та починайте навчання! 👇`;
            
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: welcomeText,
                parse_mode: 'Markdown',
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: '👉 Увійти в кабінет міні-курсу',
                        url: `${siteUrl}/minicourse`
                      }
                    ]
                  ]
                }
              })
            });

            return NextResponse.json({ ok: true });
          }
        }
      }

      // Default welcome fallback if start param doesn't match or user not found
      const defaultWelcome = `Привіт, ${firstName}! 👋\n\nЯ твій персональний помічник на міні-курсі Софії.\n\nЯкщо ви вже оплатили участь, будь ласка, переходьте на сайт для входу у ваш кабінет:`;
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
      
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: defaultWelcome,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🌐 Відкрити кабінет',
                  url: `${siteUrl}/minicourse`
                }
              ]
            ]
          }
        })
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Bot Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
