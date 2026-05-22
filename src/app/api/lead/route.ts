import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/app/minicourse/supabase';

// Replace with your actual merchant credentials or map to process.env
const MERCHANT_ACCOUNT = process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'sofi_finsight';
const MERCHANT_SECRET_KEY = process.env.WAYFORPAY_SECRET_KEY || '2d93b171ba9b11c6cf71a123c556221eb73cdb0e';
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      phone, 
      telegram, 
      tariff, 
      price, 
      utms, 
      analytics, 
      isTest, 
      targetSheet, 
      currency: inputCurrency, 
      deviceUuid,
      clientDomain,
      clientOrigin
    } = body;

    const detectedOrigin = new URL(req.url).origin;
    const baseSiteUrl = clientOrigin || process.env.NEXT_PUBLIC_SITE_URL || detectedOrigin;
    const siteUrl = baseSiteUrl.includes('localhost') ? baseSiteUrl : baseSiteUrl.replace('http://', 'https://');

    let merchantDomainName = '';
    if (clientDomain) {
      merchantDomainName = clientDomain;
    } else {
      try {
        merchantDomainName = new URL(siteUrl).hostname;
      } catch {
        merchantDomainName = 'localhost';
      }
    }

    const MERCHANT_ACCOUNT = (process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'sofi_finsight').trim();
    const MERCHANT_SECRET_KEY = (process.env.WAYFORPAY_SECRET_KEY || '2d93b171ba9b11c6cf71a123c556221eb73cdb0e').trim();
    const sheetName = targetSheet || 'Заявки на практикум';

    // Register/update the student in the database as unpaid ('pending')
    if (supabase && (tariff === 'Практикум' || tariff === 'PRO' || tariff === 'VIP')) {
      try {
        const tgClean = (telegram || '').trim().replace(/^@/, '').toLowerCase();
        const phoneClean = (phone || '').trim().replace(/\D/g, '');
        
        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('minicourse_users')
          .select('id, device_uuids')
          .or(`phone.eq.${phoneClean},telegram.eq.${tgClean}`)
          .maybeSingle();

        if (!existingUser) {
          const emailPlaceholder = `${tgClean || phoneClean || Math.random().toString(36).substr(2, 9)}@economica.edu`;
          await supabase
            .from('minicourse_users')
            .insert({
              name: name || 'Учасник',
              email: emailPlaceholder,
              telegram: tgClean || null,
              phone: phoneClean || null,
              role: 'student',
              is_paid: false,
              payment_status: 'pending',
              device_uuids: deviceUuid ? [deviceUuid] : [],
              status: 'active'
            });
        } else {
          // If they exist, make sure their device UUID is recorded
          const currentUuids = existingUser.device_uuids || [];
          if (deviceUuid && !currentUuids.includes(deviceUuid)) {
            await supabase
              .from('minicourse_users')
              .update({
                device_uuids: [...currentUuids, deviceUuid]
              })
              .eq('id', existingUser.id);
          }
        }
      } catch (dbErr) {
        console.error("Failed to pre-register student in Supabase:", dbErr);
      }
    }

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
    let alreadyPaidData = null;
    if (GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        const sheetResponse = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_lead',
            targetSheet: sheetName, // Identifier for Apps Script
            name,
            phone,
            telegram,
            tariff,
            price, // Pass current price for reference
            orderId: orderReference,
            visitorId: analytics?.visitorId,
            journey: analytics?.journey?.join(' -> '),
            utm_source: analytics?.lastUtms?.utm_source || utms?.utm_source,
            utm_medium: analytics?.lastUtms?.utm_medium || utms?.utm_medium,
            utm_campaign: analytics?.lastUtms?.utm_campaign || utms?.utm_campaign,
            utm_content: analytics?.lastUtms?.utm_content || utms?.utm_content,
            utm_term: analytics?.lastUtms?.utm_term || utms?.utm_term,
            first_utm_source: analytics?.firstUtms?.utm_source,
            first_utm_medium: analytics?.firstUtms?.utm_medium,
            first_utm_campaign: analytics?.firstUtms?.utm_campaign,
          })
        });

        const sheetResult = await sheetResponse.json();
        if (sheetResult.status === 'already_paid' && !body.isUpgrade) {
          return NextResponse.json({
            success: true,
            alreadyPaid: true,
            paidTariff: sheetResult.paidTariff,
            paidAmount: sheetResult.paidAmount
          });
        }
      } catch (err) {
        console.error("Failed to send lead to Google Sheets:", err);
      }
    }

    // 2. Prepare WayForPay Signature
    const isUpgrade = body.isUpgrade;
    const upgradeAmount = body.upgradeAmount;
    
    let finalAmount = amount;
    let finalProductName = productName;

    if (isUpgrade && upgradeAmount) {
      finalAmount = Number(upgradeAmount).toFixed(2);
      finalProductName = `Апгрейд: ${body.paidTariff} -> ${tariff}`;
    }

    const productCount = "1";
    const productPrice = finalAmount;

    const signatureString = `${MERCHANT_ACCOUNT};${merchantDomainName};${orderReference};${orderDate};${finalAmount};${currency};${finalProductName};${productCount};${productPrice}`;

    const signature = crypto
      .createHmac('md5', MERCHANT_SECRET_KEY)
      .update(signatureString)
      .digest('hex');

    // Return all data needed for the frontend to submit a form to the WayForPay portal
    return NextResponse.json({
      success: true,
      data: {
        merchantAccount: MERCHANT_ACCOUNT,
        merchantDomainName: merchantDomainName,
        orderReference,
        orderDate,
        amount: finalAmount,
        currency,
        productName: [finalProductName],
        productCount: [productCount],
        productPrice: [productPrice],
        clientName: name,
        clientPhone: phone,
        merchantSignature: signature,
        returnUrl: `${siteUrl}/api/wayforpay/return?order=${orderReference}&tariff=${tariff}`,
        approveUrl: `${siteUrl}/api/wayforpay/return?order=${orderReference}&tariff=${tariff}`,
        declineUrl: `${siteUrl}/api/wayforpay/return?order=${orderReference}&tariff=${tariff}`,
        serviceUrl: `${siteUrl}/api/wayforpay/webhook?orderId=${orderReference}&phone=${encodeURIComponent(phone || '')}&telegram=${encodeURIComponent(telegram || '')}&targetSheet=${encodeURIComponent(sheetName)}` // For the S2S callback with fallback param
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
