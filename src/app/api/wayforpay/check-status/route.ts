import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/app/minicourse/supabase';

const MERCHANT_ACCOUNT = (process.env.WAYFORPAY_MERCHANT_ACCOUNT || '').trim();
const MERCHANT_SECRET_KEY = (process.env.WAYFORPAY_SECRET_KEY || '').trim();
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

export async function GET(req: Request) {
  try {
    if (!MERCHANT_ACCOUNT || !MERCHANT_SECRET_KEY) {
      return NextResponse.json({ success: false, error: 'Payment gateway configuration missing' }, { status: 500 });
    }
    const { searchParams } = new URL(req.url);
    const orderReference = searchParams.get('orderId');
    const phone = searchParams.get('phone');
    const telegram = searchParams.get('telegram');

    if (!orderReference) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }

    // 1. Request official transaction status from WayForPay
    const signatureString = `${MERCHANT_ACCOUNT.trim()};${orderReference}`;
    const signature = crypto
      .createHmac('md5', MERCHANT_SECRET_KEY.trim())
      .update(signatureString)
      .digest('hex');

    const response = await fetch('https://api.wayforpay.com/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactionType: 'CHECK_STATUS',
        merchantAccount: MERCHANT_ACCOUNT.trim(),
        orderReference: orderReference,
        merchantSignature: signature,
        apiVersion: 1
      })
    });

    const data = await response.json();
    const status = data.transactionStatus || 'Unknown';

    // 2. Direct database update: mark user as paid in Supabase ONLY if status is Approved!
    if (status.toLowerCase() === 'approved' && supabase) {
      try {
        // A. Update status in leads table
        const { error: leadDbErr } = await supabase
          .from('leads')
          .update({ status: 'approved' })
          .eq('order_id', orderReference);

        if (leadDbErr) {
          console.error("Failed to update lead status in Supabase leads table via check-status:", leadDbErr);
        } else {
          console.log(`Successfully updated lead status to approved for order ${orderReference} in Supabase via check-status`);
        }

        // B. Update minicourse_users access
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
            console.error("Failed to mark minicourse student paid in check-status:", dbErr);
          } else {
            console.log("Successfully marked minicourse student as paid via check-status:", updatedUsers);
          }
        }

        // Fetch lead information to sync status updates
        const { data: lead } = await supabase
          .from('leads')
          .select('*')
          .eq('order_id', orderReference)
          .maybeSingle();

        if (lead) {
          // Update status in the CRM leads table
          const { error: leadUpdateErr } = await supabase
            .from('leads')
            .update({ status: 'approved' })
            .eq('id', lead.id);
          if (leadUpdateErr) {
            console.error("Failed to update lead status in Supabase:", leadUpdateErr);
          }
        }

        // Send status update webhook to Google Sheets
        const targetSheet = lead?.target_sheet || 'Заявки на практикум';
        if (GOOGLE_SHEET_WEBHOOK_URL && targetSheet !== 'Заявки на діагностику') {
          try {
            await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update_status',
                targetSheet: targetSheet,
                orderId: orderReference,
                status: 'Оплачено'
              })
            });
          } catch (sheetErr) {
            console.error("Google Sheets update failed in check-status:", sheetErr);
          }
        }

        // Sync payment registration to B&W Analytics
        try {
          const amountVal = data.amount ? Number(data.amount) : (lead?.amount ? Number(lead.amount) : 9);
          await fetch('https://victoria-mc.vercel.app/api/v1/leads/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_slug: 'sofia',
              api_key: 'bw_analytics_sofia_key_112233',
              lead: {
                phone: phoneClean || lead?.phone || null,
                telegram: tgClean || lead?.telegram || null,
                amount: amountVal,
                status: 'closed_won',
                order_id: orderReference
              },
              marketing: {
                utm_source: lead?.utm_source || null,
                utm_medium: lead?.utm_medium || null,
                utm_campaign: lead?.utm_campaign || null
              }
            })
          });
        } catch (analyticsErr) {
          console.error("Failed to sync payment callback with B&W Analytics in check-status:", analyticsErr);
        }

      } catch (dbErr) {
        console.error("Database error in check-status paid sync:", dbErr);
      }
    }
    
    // Return verified status to trigger frontend logic (auto-login on 'Approved', failure redirect otherwise)
    return NextResponse.json({ 
      success: true, 
      status: status,
      reason: data.reason || ''
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
