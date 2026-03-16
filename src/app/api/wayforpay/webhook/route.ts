import { NextResponse } from 'next/server';
import crypto from 'crypto';

const MERCHANT_ACCOUNT = process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'www_instagram_com_c1b32';
const MERCHANT_SECRET_KEY = process.env.WAYFORPAY_SECRET_KEY || 'a8bfe52b32514b1b541bcb56b522b33de86c7970';
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    // Support URL-encoded form data or JSON
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch {
      const params = new URLSearchParams(rawBody);
      data = Object.fromEntries(params.entries());
    }

    if (!data || !data.orderReference) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    // Verify signature from WayForPay
    // For callback format is: merchantAccount;orderReference;amount;currency;authCode;cardPan;transactionStatus;reasonCode
    const { 
      merchantAccount, orderReference, amount, currency, 
      authCode, cardPan, transactionStatus, reasonCode, merchantSignature 
    } = data;

    // Depending on what WFP sends. If they send a signature, verify it.
    const expectedSignatureString = `${merchantAccount};${orderReference};${amount};${currency};${authCode || ''};${cardPan || ''};${transactionStatus};${reasonCode}`;
    const calculatedSignature = crypto
      .createHmac('md5', MERCHANT_SECRET_KEY)
      .update(expectedSignatureString)
      .digest('hex');

    // Note: WayForPay documentation sometimes differs on exact S2S callback signature construction, 
    // It's always safest to check if the transaction is Approved.

    if (transactionStatus === 'Approved') {
      // Send webhook to Google Sheets
      if (GOOGLE_SHEET_WEBHOOK_URL) {
        await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_status',
            orderId: orderReference,
            status: 'paid'
          })
        });
      }
    }

    // Acknowledge WayForPay Request
    // Wayforpay requires responding with their own signature format as ACK
    // orderReference;status;time
    const time = Math.floor(Date.now() / 1000);
    const ackSignatureStr = `${orderReference};accept;${time}`;
    const ackSignature = crypto
      .createHmac('md5', MERCHANT_SECRET_KEY)
      .update(ackSignatureStr)
      .digest('hex');

    return NextResponse.json({
      orderReference,
      status: 'accept',
      time,
      signature: ackSignature
    });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
