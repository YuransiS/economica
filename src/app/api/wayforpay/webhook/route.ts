import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/app/minicourse/supabase';

const MERCHANT_ACCOUNT = (process.env.WAYFORPAY_MERCHANT_ACCOUNT || '').trim();
const MERCHANT_SECRET_KEY = (process.env.WAYFORPAY_SECRET_KEY || '').trim();


export async function POST(req: Request) {
  try {
    if (!MERCHANT_ACCOUNT || !MERCHANT_SECRET_KEY) {
      console.error("WayForPay credentials are not configured on the server.");
      return NextResponse.json({ success: false, error: 'Payment gateway configuration missing' }, { status: 500 });
    }
    const url = new URL(req.url);
    const urlOrderId = url.searchParams.get('orderId');
    let targetSheet = url.searchParams.get('targetSheet') || '';
    const rawBody = await req.text();

    // Support URL-encoded form data or JSON
    let data: any = {};
    try {
      data = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      data = Object.fromEntries(params.entries());
    }

    let phone = url.searchParams.get('phone') || data.phone || data.clientPhone || data.client_phone || '';
    let telegram = url.searchParams.get('telegram') || '';

    // WayForPay keys can sometimes be case-sensitive or different
    const status = (data.transactionStatus || data.transaction_status || data.status || '') + '';
    let orderId = urlOrderId || data.orderReference || data.order_reference || '';
    orderId = (orderId + '').trim();

    if (!orderId) {
      console.warn("Webhook missing orderId:", { urlOrderId, body: data });
      return NextResponse.json({ success: false, message: 'Missing order reference' }, { status: 400 });
    }

    // Database fallback for missing phone, telegram or targetSheet
    if (supabase && (!phone || !telegram || !targetSheet)) {
      try {
        const { data: dbLead } = await supabase
          .from('leads')
          .select('phone, telegram, target_sheet')
          .eq('order_id', orderId)
          .maybeSingle();

        if (dbLead) {
          if (!phone) phone = dbLead.phone || '';
          if (!telegram) telegram = dbLead.telegram || '';
          if (!targetSheet) targetSheet = dbLead.target_sheet || '';
        }
      } catch (dbLeadErr) {
        console.error("Failed to fetch lead fallback details in webhook:", dbLeadErr);
      }
    }

    if (!targetSheet) {
      targetSheet = 'Заявки на практикум';
    }

    // Map statuses
    let finalStatus = 'Невідомий';
    let dbStatus = 'pending';
    const sLower = status.toLowerCase();
    
    if (sLower === 'approved' || sLower === 'settled') {
      finalStatus = 'Оплачено';
      dbStatus = 'approved';
    } else if (sLower === 'declined') {
      finalStatus = 'Відхилено';
      dbStatus = 'declined';
    } else if (sLower === 'expired') {
      finalStatus = 'Минув термін';
      dbStatus = 'expired';
    } else if (sLower) {
      finalStatus = `WFP: ${status}`;
      dbStatus = `failed: ${status}`;
    }

    // Update status in Supabase minicourse database
    if (supabase) {
      try {
        // 1. Update status in leads table
        const { error: leadDbErr } = await supabase
          .from('leads')
          .update({ status: dbStatus })
          .eq('order_id', orderId);

        if (leadDbErr) {
          console.error("Failed to update lead status in Supabase leads table:", leadDbErr);
        } else {
          console.log(`Successfully updated lead status to ${dbStatus} for order ${orderId} in Supabase`);
        }

        const tgClean = (telegram || '').replace(/^@/, '').trim().toLowerCase();
        const phoneClean = (phone || '').trim().replace(/\D/g, '');

        // 2. Update minicourse_users access on successful payment
        if ((sLower === 'approved' || sLower === 'settled') && (tgClean || phoneClean)) {
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
        }

        // 3. Sync payment status with central B&W Analytics asynchronously
        const gatewayStatus = (sLower === 'approved' || sLower === 'settled') ? 'closed_won' : (sLower === 'declined' || sLower === 'expired' ? 'declined' : 'pending');
        fetch('https://bnw-prod.vercel.app/api/v1/leads/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_slug: 'sofia',
            api_key: 'bw_analytics_sofia_key_112233',
            lead: {
              phone: phoneClean || null,
              telegram: tgClean || null,
              amount: data.amount ? Number(data.amount) : 0,
              status: gatewayStatus,
              order_id: orderId
            },
            marketing: {
              utm_source: data.utm_source || null,
              utm_medium: data.utm_medium || null,
              utm_campaign: data.utm_campaign || null
            },
            metadata: {
              currency: data.currency || 'USD'
            }
          })
        }).catch(err => console.error("Failed to sync payment callback with B&W Analytics:", err));

      } catch (dbErr) {
        console.error("Database error in wayforpay webhook sync:", dbErr);
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
