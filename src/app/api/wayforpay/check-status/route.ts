import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/app/minicourse/supabase';

const MERCHANT_ACCOUNT = (process.env.WAYFORPAY_MERCHANT_ACCOUNT || '').trim();
const MERCHANT_SECRET_KEY = (process.env.WAYFORPAY_SECRET_KEY || '').trim();

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
        const tgClean = (telegram || '').trim().replace(/^@/, '').toLowerCase();
        const phoneClean = (phone || '').trim().replace(/\D/g, '');

        if (tgClean || phoneClean) {
          let query = supabase.from('minicourse_users').update({
            is_paid: true,
            payment_status: 'paid'
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
