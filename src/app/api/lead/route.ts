import { NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/app/minicourse/supabase';

// Google Sheets Webhook URL from environment variables
const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

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

    const finalCurrency = isTest ? 'UAH' : (inputCurrency || 'USD');

    const detectedOrigin = new URL(req.url).origin;
    const baseSiteUrl = clientOrigin || process.env.NEXT_PUBLIC_SITE_URL || detectedOrigin;
    const siteUrl = baseSiteUrl.includes('localhost') ? baseSiteUrl : baseSiteUrl.replace('http://', 'https://');

    // Free Registration Flow Bypass
    const isFree = Number(price) === 0 || tariff === 'Безкоштовно' || tariff === 'Інтенсив';
    if (isFree) {
      const orderReference = `ORDER_FREE_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      const sheetName = targetSheet || 'Заявки на інтенсив';
      const phoneClean = (phone || '').trim().replace(/\D/g, '');
      const tgClean = (telegram || '').replace(/^@/, '').trim().toLowerCase();

      // 1. Supabase minicourse_users
      if (supabase) {
        try {
          let query = supabase.from('minicourse_users').select('id, device_uuids');
          if (phoneClean && tgClean) {
            query = query.or(`phone.eq.${phoneClean},telegram.eq.${tgClean}`);
          } else if (phoneClean) {
            query = query.eq('phone', phoneClean);
          } else if (tgClean) {
            query = query.eq('telegram', tgClean);
          } else {
            query = query.eq('id', '00000000-0000-0000-0000-000000000000');
          }

          const { data: existingUser } = await query
            .order('created_at', { ascending: false })
            .limit(1)
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
                is_paid: true,
                payment_status: 'paid',
                device_uuids: deviceUuid ? [deviceUuid] : [],
                status: 'active',
                access_opened_at: new Date().toISOString()
              });
          } else {
            const currentUuids = existingUser.device_uuids || [];
            const updatePayload: any = {
              is_paid: true,
              payment_status: 'paid',
              access_opened_at: new Date().toISOString()
            };
            if (deviceUuid && !currentUuids.includes(deviceUuid)) {
              updatePayload.device_uuids = [...currentUuids, deviceUuid];
            }
            await supabase
              .from('minicourse_users')
              .update(updatePayload)
              .eq('id', existingUser.id);
          }
        } catch (dbErr) {
          console.error("Failed to register free student in Supabase:", dbErr);
        }
      }

      // 2. Background logging
      const visitorId = analytics?.visitorId;
      const inputJourney = analytics?.journey?.join(' -> ') || '';
      
      after(async () => {
        // Supabase leads
        if (supabase) {
          try {
            let existingLead = null;
            if (phoneClean || tgClean) {
              let queryFilter = '';
              if (phoneClean) queryFilter += `phone.eq.${phoneClean}`;
              if (tgClean) queryFilter += (queryFilter ? ',' : '') + `telegram.eq.${tgClean}`;

              const { data } = await supabase
                .from('leads')
                .select('*')
                .or(queryFilter)
                .maybeSingle();
              existingLead = data;
            }

            if (!existingLead && visitorId && isUuid(visitorId)) {
              const { data } = await supabase
                .from('leads')
                .select('*')
                .eq('visitor_uuid', visitorId)
                .maybeSingle();
              existingLead = data;
            }

            const leadPayload = {
              name: name || 'Учасник',
              phone: phoneClean || null,
              telegram: tgClean || null,
              amount: 0,
              status: 'approved',
              is_free: true,
              order_id: orderReference,
              target_sheet: sheetName,
              utm_source: analytics?.lastUtms?.utm_source || utms?.utm_source || null,
              utm_medium: analytics?.lastUtms?.utm_medium || utms?.utm_medium || null,
              utm_campaign: analytics?.lastUtms?.utm_campaign || utms?.utm_campaign || null,
              utm_content: analytics?.lastUtms?.utm_content || utms?.utm_content || null,
              utm_term: analytics?.lastUtms?.utm_term || utms?.utm_term || null,
              visitor_uuid: visitorId && isUuid(visitorId) ? visitorId : undefined
            };

            if (existingLead) {
              const existingJourney = existingLead.query || '';
              let updatedJourney = existingJourney;
              if (inputJourney && !existingJourney.includes(inputJourney)) {
                updatedJourney = existingJourney ? `${existingJourney} | ${inputJourney}` : inputJourney;
              }

              await supabase
                .from('leads')
                .update({
                  ...leadPayload,
                  query: updatedJourney
                })
                .eq('id', existingLead.id);
            } else {
              await supabase
                .from('leads')
                .insert({
                  ...leadPayload,
                  query: inputJourney
                });
            }
          } catch (leadErr) {
            console.error("Failed to sync free lead to Supabase leads:", leadErr);
          }
        }

        // B&W Analytics Gateway
        try {
          await fetch('https://victoria-mc.vercel.app/api/v1/leads/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_slug: 'sofia',
              api_key: 'bw_analytics_sofia_key_112233',
              lead: {
                name: name || 'Учасник',
                phone: phoneClean || null,
                telegram: tgClean || null,
                amount: 0,
                status: 'closed_won',
                order_id: orderReference
              },
              marketing: {
                utm_source: analytics?.lastUtms?.utm_source || utms?.utm_source || null,
                utm_medium: analytics?.lastUtms?.utm_medium || utms?.utm_medium || null,
                utm_campaign: analytics?.lastUtms?.utm_campaign || utms?.utm_campaign || null,
                utm_content: analytics?.lastUtms?.utm_content || utms?.utm_content || null,
                utm_term: analytics?.lastUtms?.utm_term || utms?.utm_term || null,
                visitor_uuid: visitorId && isUuid(visitorId) ? visitorId : undefined,
                page_path: analytics?.pagePath || '/intensive',
                page_url: analytics?.pageUrl || null
              },
              metadata: {
                tariff: tariff,
                target_sheet: sheetName,
                currency: finalCurrency
              }
            })
          }).catch(err => console.error("Failed to forward free lead to B&W Analytics Gateway:", err));
        } catch (err) {
          console.error("Failed to forward free lead to B&W Analytics:", err);
        }

        // Google Sheets
        if (GOOGLE_SHEET_WEBHOOK_URL) {
          try {
            await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'create_lead',
                targetSheet: sheetName,
                name,
                phone,
                telegram,
                tariff,
                price: 0,
                currency: 'USD',
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

            // Mark as Paid immediately in Sheets
            await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'update_status',
                targetSheet: sheetName,
                orderId: orderReference,
                status: 'Оплачено'
              })
            });
          } catch (err) {
            console.error("Failed to send free lead to Google Sheets:", err);
          }
        }
      });

      return NextResponse.json({
        success: true,
        isFree: true,
        orderId: orderReference
      });
    }

    // WayForPay merchant account 'sofi_finsight' is registered under the domain 'sofifinsight.vercel.app'
    const merchantDomainName = 'sofifinsight.vercel.app';

    const MERCHANT_ACCOUNT = (process.env.WAYFORPAY_MERCHANT_ACCOUNT || '').trim();
    const MERCHANT_SECRET_KEY = (process.env.WAYFORPAY_SECRET_KEY || '').trim();

    if (!MERCHANT_ACCOUNT || !MERCHANT_SECRET_KEY) {
      return NextResponse.json({ success: false, error: 'WayForPay credentials are not configured on the server.' }, { status: 500 });
    }

    const sheetName = targetSheet || 'Заявки на практикум';

    // Register/update the student in the database as unpaid ('pending')
    if (supabase && (tariff === 'Практикум' || tariff === 'PRO' || tariff === 'VIP')) {
      try {
        const tgClean = (telegram || '').replace(/^@/, '').trim().toLowerCase();
        const phoneClean = (phone || '').trim().replace(/\D/g, '');

        // Check if user already exists
        let query = supabase
          .from('minicourse_users')
          .select('id, device_uuids');

        if (phoneClean && tgClean) {
          query = query.or(`phone.eq.${phoneClean},telegram.eq.${tgClean}`);
        } else if (phoneClean) {
          query = query.eq('phone', phoneClean);
        } else if (tgClean) {
          query = query.eq('telegram', tgClean);
        } else {
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }

        const { data: existingUser } = await query
          .order('created_at', { ascending: false })
          .limit(1)
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

    // Sync to Supabase leads table with smart customer journey tracking & aggregation in the background
    after(async () => {
      if (supabase) {
        try {
          const tgClean = (telegram || '').replace(/^@/, '').trim().toLowerCase();
          const phoneClean = (phone || '').trim().replace(/\D/g, '');
          const visitorId = analytics?.visitorId;
          const inputJourney = analytics?.journey?.join(' -> ') || '';

          let existingLead = null;

          // 1. First try to find by phone or telegram
          if (phoneClean || tgClean) {
            let queryFilter = '';
            if (phoneClean) queryFilter += `phone.eq.${phoneClean}`;
            if (tgClean) queryFilter += (queryFilter ? ',' : '') + `telegram.eq.${tgClean}`;

            const { data } = await supabase
              .from('leads')
              .select('*')
              .or(queryFilter)
              .maybeSingle();
            existingLead = data;
          }

          // 2. If not found by phone/TG, try by visitorId (UUID)
          if (!existingLead && visitorId && isUuid(visitorId)) {
            const { data } = await supabase
              .from('leads')
              .select('*')
              .eq('visitor_uuid', visitorId)
              .maybeSingle();
            existingLead = data;
          }

          const leadPayload = {
            name: name || 'Учасник',
            phone: phoneClean || null,
            telegram: tgClean || null,
            amount: Number(price) || 0,
            status: 'pending',
            is_free: false,
            order_id: orderReference,
            target_sheet: sheetName,
            utm_source: analytics?.lastUtms?.utm_source || utms?.utm_source || null,
            utm_medium: analytics?.lastUtms?.utm_medium || utms?.utm_medium || null,
            utm_campaign: analytics?.lastUtms?.utm_campaign || utms?.utm_campaign || null,
            utm_content: analytics?.lastUtms?.utm_content || utms?.utm_content || null,
            utm_term: analytics?.lastUtms?.utm_term || utms?.utm_term || null,
            visitor_uuid: visitorId && isUuid(visitorId) ? visitorId : undefined
          };

          if (existingLead) {
            // Merge journey
            const existingJourney = existingLead.query || '';
            let updatedJourney = existingJourney;
            if (inputJourney && !existingJourney.includes(inputJourney)) {
              updatedJourney = existingJourney ? `${existingJourney} | ${inputJourney}` : inputJourney;
            }

            await supabase
              .from('leads')
              .update({
                ...leadPayload,
                query: updatedJourney
              })
              .eq('id', existingLead.id);
          } else {
            await supabase
              .from('leads')
              .insert({
                ...leadPayload,
                query: inputJourney
              });
          }

          // Дополнительно отправляем лид в Единую Сквозную Аналитику B&W Analytics
          await fetch('https://victoria-mc.vercel.app/api/v1/leads/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_slug: 'sofia',
              api_key: 'bw_analytics_sofia_key_112233',
              lead: {
                name: name || 'Учасник',
                phone: phoneClean || null,
                telegram: tgClean || null,
                amount: Number(price) || 0,
                status: 'pending',
                order_id: orderReference
              },
              marketing: {
                utm_source: analytics?.lastUtms?.utm_source || utms?.utm_source || null,
                utm_medium: analytics?.lastUtms?.utm_medium || utms?.utm_medium || null,
                utm_campaign: analytics?.lastUtms?.utm_campaign || utms?.utm_campaign || null,
                utm_content: analytics?.lastUtms?.utm_content || utms?.utm_content || null,
                utm_term: analytics?.lastUtms?.utm_term || utms?.utm_term || null,
                visitor_uuid: visitorId && isUuid(visitorId) ? visitorId : undefined,
                page_path: analytics?.pagePath || '/',
                page_url: analytics?.pageUrl || null,
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
              },
              metadata: {
                tariff: tariff,
                target_sheet: sheetName,
                currency: finalCurrency
              }
            })
          }).catch(err => console.error("Failed to forward lead to B&W Analytics Gateway:", err));

        } catch (leadErr) {
          console.error("Failed to sync lead to Supabase leads table in background:", leadErr);
        }
      }
    });

    // Support for 1 UAH test payment or custom currency
    let currency = inputCurrency || 'USD';
    let amount = Number(price) % 1 === 0 ? Number(price).toString() : Number(price).toFixed(2);
    let productName = `Практикум: Тариф ${tariff}`;

    if (isTest) {
      currency = 'UAH';
      amount = '1';
      productName = `[TEST] ${productName}`;
    }

    // 1. Send to Google Sheets (if URL configured)
    if (GOOGLE_SHEET_WEBHOOK_URL) {
      const payload = {
        action: 'create_lead',
        targetSheet: sheetName, // Identifier for Apps Script
        name,
        phone,
        telegram,
        tariff,
        price, // Pass current price for reference
        currency,
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
      };

      if (tariff?.includes('Діагностика')) {
        // Google Sheets integration is cut out for diagnostics leads (only DB and Pixel)
      } else {
        // Run synchronously to check for duplicate/pre-existing payment status (other pages)
        try {
          const sheetResponse = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
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
    }

    // 2. Prepare WayForPay Signature
    const isUpgrade = body.isUpgrade;
    const upgradeAmount = body.upgradeAmount;

    let finalAmount = amount;
    let finalProductName = productName;

    // Use clean English name for Diagnostics product to avoid Cyrillic encoding signature mismatches
    if (tariff?.includes('Діагностика')) {
      const offerNum = tariff.includes('2') ? '2' : (tariff.includes('3') ? '3' : '1');
      finalProductName = `Financial Diagnostics Offer ${offerNum}`;
    }

    if (isUpgrade && upgradeAmount) {
      finalAmount = Number(upgradeAmount) % 1 === 0 ? Number(upgradeAmount).toString() : Number(upgradeAmount).toFixed(2);
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
        clientPaymentMethods: "card;googlePay;applePay",
        returnUrl: `${siteUrl}/api/wayforpay/return?order=${orderReference}&tariff=${encodeURIComponent(tariff)}`,
        approveUrl: `${siteUrl}/api/wayforpay/return?order=${orderReference}&tariff=${encodeURIComponent(tariff)}`,
        declineUrl: `${siteUrl}/api/wayforpay/return?order=${orderReference}&tariff=${encodeURIComponent(tariff)}`,
        serviceUrl: `${siteUrl}/api/wayforpay/webhook`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
