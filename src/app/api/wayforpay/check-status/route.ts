import { NextResponse } from 'next/server';
import crypto from 'crypto';

const MERCHANT_ACCOUNT = process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'sofi_finsight';
const MERCHANT_SECRET_KEY = process.env.WAYFORPAY_SECRET_KEY || '2d93b171ba9b11c6cf71a123c556221eb73cdb0e';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderReference = searchParams.get('orderId');

    if (!orderReference) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }

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
    
    // WayForPay returns transactionStatus: 'Approved', 'Declined', etc.
    return NextResponse.json({ 
      success: true, 
      status: data.transactionStatus || 'Unknown',
      reason: data.reason || ''
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
