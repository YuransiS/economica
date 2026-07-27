import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/app/minicourse/supabase';

function cleanPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    cleaned = "38" + cleaned;
  }
  if (cleaned.length === 11 && cleaned.startsWith("80")) {
    cleaned = "38" + cleaned.substring(1);
  }
  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency: reqCurrency, 
      tariffName, 
      customerName, 
      customerPhone,
      visitor_id
    } = body;

    const host = request.headers.get('host') || 'localhost:3002';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const currentDomain = `${protocol}://${host}`;

    const merchantAccount = (process.env.WAYFORPAY_MERCHANT_ACCOUNT || 'sofi_finsight').trim();
    const merchantSecretKey = (process.env.WAYFORPAY_SECRET_KEY || '2d93b171ba9b11c6cf71a123c556221eb73cdb0e').trim();
    const merchantDomainName = 'sofifinsight.vercel.app';

    const orderReference = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderDate = Math.floor(Date.now() / 1000).toString();
    const currency = reqCurrency || 'USD';

    const productPriceStr = amount.toString();
    const productNameStr = `Mini-Course: ${tariffName}`;
    const productCountStr = "1";

    const signatureString = `${merchantAccount};${merchantDomainName};${orderReference};${orderDate};${productPriceStr};${currency};${productNameStr};${productCountStr};${productPriceStr}`;

    const merchantSignature = crypto
      .createHmac('md5', merchantSecretKey)
      .update(signatureString)
      .digest('hex');

    const paymentData = {
      merchantAccount,
      merchantDomainName,
      merchantSignature,
      orderReference,
      orderDate,
      amount: parseFloat(amount),
      currency,
      productName: [productNameStr],
      productCount: [1],
      productPrice: [parseFloat(amount)],
      clientName: customerName,
      clientPhone: customerPhone,
      serviceUrl: `${currentDomain}/api/wayforpay/webhook`,
      returnUrl: `${currentDomain}/api/wayforpay/return?order=${orderReference}&tariff=${encodeURIComponent(tariffName)}`,
    };

    // Database Actions (Supabase)
    if (supabase) {
      const cleanedPhone = customerPhone ? cleanPhone(customerPhone) : '';
      const tgClean = ''; // No Telegram field in central admin form, but can be extracted if needed

      // 1. Ingest student in minicourse_users
      try {
        const emailPlaceholder = `${cleanedPhone || Math.random().toString(36).substring(2, 9)}@economica.edu`;
        
        let { data: existingUser } = await supabase
          .from('minicourse_users')
          .select('id')
          .eq('phone', cleanedPhone)
          .maybeSingle();

        if (!existingUser) {
          await supabase.from('minicourse_users').insert({
            name: customerName || 'Учасник',
            email: emailPlaceholder,
            phone: cleanedPhone || null,
            role: 'student',
            is_paid: false,
            payment_status: 'pending',
            status: 'active'
          });
        }
      } catch (dbErr) {
        console.error("Failed to pre-register student in Supabase minicourse_users:", dbErr);
      }

      // 2. Ingest lead in local leads table
      let resolvedUuid = visitor_id || null;
      if (cleanedPhone) {
        try {
          const { data: existingLeads } = await supabase
            .from('leads')
            .select('visitor_uuid')
            .eq('phone', cleanedPhone)
            .not('visitor_uuid', 'is', null)
            .order('created_at', { ascending: true })
            .limit(1);

          if (existingLeads && existingLeads.length > 0) {
            resolvedUuid = existingLeads[0].visitor_uuid;
          }
        } catch (e) {
          console.error("Stitch lookup error:", e);
        }
      }

      if (!resolvedUuid) resolvedUuid = crypto.randomUUID();

      const dbPayload = {
        name: customerName || 'Учасник',
        phone: cleanedPhone || customerPhone || null,
        amount: Number(amount) || 0,
        status: 'pending',
        is_free: false,
        order_id: orderReference,
        target_sheet: 'Заявки на практикум',
        visitor_uuid: resolvedUuid,
        page_path: '/checkout',
        page_url: `${currentDomain}/checkout`
      };

      try {
        await supabase.from('leads').insert(dbPayload);
      } catch (leadErr) {
        console.error("Failed to insert lead locally:", leadErr);
      }

      // 3. Forward to B&W Analytics Gateway asynchronously
      try {
        fetch('https://bnw-prod.vercel.app/api/v1/leads/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_slug: 'sofia',
            api_key: 'bw_analytics_sofia_key_112233',
            lead: {
              name: customerName || 'Учасник',
              phone: cleanedPhone || customerPhone || null,
              amount: Number(amount) || 0,
              status: 'pending',
              order_id: orderReference
            },
            marketing: {
              visitor_uuid: resolvedUuid,
              page_path: '/checkout',
              page_url: `${currentDomain}/checkout`
            },
            metadata: {
              tariff: tariffName,
              target_sheet: 'Заявки на практикум',
              currency: currency || 'USD'
            }
          })
        }).catch(gateErr => console.error("Analytics gateway sync error:", gateErr));
      } catch (err) {
        console.error("Failed to launch background analytics sync:", err);
      }

    }

    return NextResponse.json({ ...paymentData, visitor_uuid: visitor_id });
  } catch (error: any) {
    console.error('WFP Create Payment Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
