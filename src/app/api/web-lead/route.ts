import { NextResponse, after } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, telegram, utms, analytics } = body;

    // Execute heavy API logging in the background, allowing the client to redirect instantly!
    after(async () => {
      // 1. Log to Google Sheets
      if (GOOGLE_SHEET_WEBHOOK_URL) {
        try {
          await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'create_lead',
              targetSheet: 'Лиды Вебинар', // Identifier for Apps Script
              name,
              phone,
              telegram,
              tariff: 'Безкоштовно',
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
        } catch (err) {
          console.error("Failed to send lead to Google Sheets in background:", err);
        }
      }

      // 2. Dual-Write to Supabase leads table
      if (supabase) {
        try {
          const tgClean = (telegram || '').replace(/^@/, '').trim().toLowerCase();
          const phoneClean = (phone || '').trim().replace(/\D/g, '');
          const visitorId = analytics?.visitorId;
          const inputJourney = analytics?.journey?.join(' -> ') || '';
          
          let existingLead = null;
          
          // A. Find by phone or telegram first
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

          // B. Try by visitorId (UUID)
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
            status: 'pending',
            is_free: true,
            target_sheet: 'Лиды Вебинар',
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

          // Forward webinar lead to B&W Analytics Gateway
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
                status: 'pending'
              },
              marketing: {
                utm_source: analytics?.lastUtms?.utm_source || utms?.utm_source || null,
                utm_medium: analytics?.lastUtms?.utm_medium || utms?.utm_medium || null,
                utm_campaign: analytics?.lastUtms?.utm_campaign || utms?.utm_campaign || null,
                utm_content: analytics?.lastUtms?.utm_content || utms?.utm_content || null,
                utm_term: analytics?.lastUtms?.utm_term || utms?.utm_term || null,
                visitor_uuid: visitorId && isUuid(visitorId) ? visitorId : undefined,
                page_path: analytics?.pagePath || '/',
                page_url: analytics?.pageUrl || null
              },
              metadata: {
                tariff: 'Безкоштовно',
                target_sheet: 'Лиды Вебинар'
              }
            })
          }).catch(err => console.error("Failed to forward webinar lead to B&W Analytics Gateway:", err));

        } catch (leadErr) {
          console.error("Failed to sync lead to Supabase leads table in web-lead background:", leadErr);
        }
      }
    });

    return NextResponse.json({ success: true, redirectUrl: 'https://telegram.me/+omVaRnq7pqVjNzNi' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
