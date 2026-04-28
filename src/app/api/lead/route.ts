import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Replace with your actual merchant credentials or map to process.env
const MERCHANT_ACCOUNT = process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'sofi_finsight';
const MERCHANT_SECRET_KEY = process.env.WAYFORPAY_SECRET_KEY || '2d93b171ba9b11c6cf71a123c556221eb73cdb0e';
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

export async function POST(req: Request) {
  try {
    const origin = new URL(req.url).origin.replace('http://', 'https://');
    const MERCHANT_DOMAIN_NAME = process.env.NEXT_PUBLIC_SITE_URL?.replace('http://', 'https://') || origin;
    const MERCHANT_ACCOUNT = (process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'sofi_finsight').trim();
    const MERCHANT_SECRET_KEY = (process.env.WAYFORPAY_SECRET_KEY || '2d93b171ba9b11c6cf71a123c556221eb73cdb0e').trim();
    const body = await req.json();
    const { name, phone, telegram, tariff, price, utms, isTest, targetSheet, currency: inputCurrency } = body;
    const sheetName = targetSheet || 'Заявки на практикум';

    // Generate a unique order ID
    const orderReference = `ORDER_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const orderDate = Math.floor(Date.now() / 1000); // Unix timestamp

    // Support for 1 UAH test payment or custom currency
    let currency = inputCurrency || 'USD';
    let amount = Number(price).toFixed(2);
    let productName = `Практикум: Тариф ${tariff}`;

    if (isTest) {
      currency = 'UAH';
      amount = '1.00';
      productName = `[TEST] ${productName}`;
    }

    // 1. Send to Google Sheets (if URL configured)
    if (GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_lead',
            targetSheet: sheetName, // Identifier for Apps Script
            name,
            phone,
            telegram,
            tariff,
            orderId: orderReference,
            utm_source: utms?.utm_source,
            utm_medium: utms?.utm_medium,
            utm_campaign: utms?.utm_campaign,
            utm_content: utms?.utm_content,
            utm_term: utms?.utm_term,
          })
        });
      } catch (err) {
        console.error("Failed to send lead to Google Sheets:", err);
      }
    }

    // 2. Prepare WayForPay Signature
    const productCount = "1";
    const productPrice = amount;

    const signatureString = `${MERCHANT_ACCOUNT};${MERCHANT_DOMAIN_NAME};${orderReference};${orderDate};${amount};${currency};${productName};${productCount};${productPrice}`;

    const signature = crypto
      .createHmac('md5', MERCHANT_SECRET_KEY)
      .update(signatureString)
      .digest('hex');

    // Return all data needed for the frontend to submit a form to the WayForPay portal
    return NextResponse.json({
      success: true,
      data: {
        merchantAccount: MERCHANT_ACCOUNT,
        merchantDomainName: MERCHANT_DOMAIN_NAME,
        orderReference,
        orderDate,
        amount,
        currency,
        productName: [productName],
        productCount: [productCount],
        productPrice: [productPrice],
        clientName: name,
        clientPhone: phone,
        merchantSignature: signature,
        returnUrl: `${MERCHANT_DOMAIN_NAME}/checking-payment/${orderReference}?tariff=${tariff}`,
        approveUrl: `${MERCHANT_DOMAIN_NAME}/checking-payment/${orderReference}?tariff=${tariff}`,
        declineUrl: `${MERCHANT_DOMAIN_NAME}/checking-payment/${orderReference}?tariff=${tariff}`,
        serviceUrl: `${MERCHANT_DOMAIN_NAME}/api/wayforpay/webhook?orderId=${orderReference}&targetSheet=${encodeURIComponent(sheetName)}` // For the S2S callback with fallback param
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
