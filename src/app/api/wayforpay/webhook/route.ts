import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/app/minicourse/supabase';

const MERCHANT_ACCOUNT = (process.env.WAYFORPAY_MERCHANT_ACCOUNT || '').trim();
const MERCHANT_SECRET_KEY = (process.env.WAYFORPAY_SECRET_KEY || '').trim();
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

export async function POST(req: Request) {
  try {
    if (!MERCHANT_ACCOUNT || !MERCHANT_SECRET_KEY) {
      console.error("WayForPay credentials are not configured on the server.");
      return NextResponse.json({ success: false, error: 'Payment gateway configuration missing' }, { status: 500 });
    }
    const url = new URL(req.url);
    const urlOrderId = url.searchParams.get('orderId');
    const targetSheet = url.searchParams.get('targetSheet') || 'Заявки на практикум';
    const rawBody = await req.text();

    // Support URL-encoded form data or JSON
    let data: any = {};
    try {
      data = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      data = Object.fromEntries(params.entries());
    }

    const phone = url.searchParams.get('phone') || data.phone || data.clientPhone || data.client_phone || '';
    const telegram = url.searchParams.get('telegram') || '';

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
      
      // Update paid status in Supabase minicourse database
      if (supabase) {
        try {
          const tgClean = (telegram || '').replace(/^@/, '').trim().toLowerCase();
          const phoneClean = (phone || '').trim().replace(/\D/g, '');

          if (tgClean || phoneClean) {
            let query = supabase.from('minicourse_users').update({
              is_paid: true,
              payment_status: 'paid',
              access_opened_at: new Date().toISOString()
            });

            if (tgClean && phoneClean) {
              query = query.or(`phone.eq.${phoneClean},telegram.ilike.${tgClean}`);
            } else if (tgClean) {
              query = query.ilike('telegram', tgClean);
            } else if (phoneClean) {
              query = query.eq('phone', phoneClean);
            }

            const { data: updatedUsers, error: dbErr } = await query.select();
            if (dbErr) {
              console.error("Failed to mark minicourse student paid in Supabase:", dbErr);
            } else {
              console.log("Successfully marked minicourse student as paid:", updatedUsers);
            }

            // Дополнительно отправляем статус оплаты в Единую Сквозную Аналитику B&W Analytics
            await fetch('https://victoria-mc.vercel.app/api/v1/leads/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                project_slug: 'sofia',
                api_key: 'bw_analytics_sofia_key_112233',
                lead: {
                  phone: phoneClean || null,
                  telegram: tgClean || null,
                  amount: data.amount ? Number(data.amount) : 0,
                  status: 'closed_won',
                  order_id: orderId
                },
                marketing: {
                  utm_source: data.utm_source || null,
                  utm_medium: data.utm_medium || null,
                  utm_campaign: data.utm_campaign || null
                }
              })
            }).catch(err => console.error("Failed to sync payment callback with B&W Analytics:", err));
          }
        } catch (dbErr) {
          console.error("Database error in wayforpay webhook paid sync:", dbErr);
        }
      }
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
            targetSheet: targetSheet,
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
