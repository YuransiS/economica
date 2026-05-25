import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

const isUuid = (val: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitorId, path, utms } = body;

    // 1. Log to Google Sheets
    if (GOOGLE_SHEET_WEBHOOK_URL) {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_traffic',
          visitorId,
          path,
          utm_source: utms?.utm_source,
          utm_medium: utms?.utm_medium,
          utm_campaign: utms?.utm_campaign,
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      });
    }

    // 2. Dual-Write to Supabase leads table
    if (supabase && visitorId && isUuid(visitorId)) {
      try {
        const pathInfo = path || '';
        const { data: existingLead } = await supabase
          .from('leads')
          .select('id, query')
          .eq('visitor_uuid', visitorId)
          .maybeSingle();

        if (existingLead) {
          const existingJourney = existingLead.query || '';
          let updatedJourney = existingJourney;
          const journeyPiece = pathInfo + (utms?.utm_source ? ` (utm: ${utms.utm_source})` : '');
          if (journeyPiece && !existingJourney.includes(journeyPiece)) {
            updatedJourney = existingJourney ? `${existingJourney} | ${journeyPiece}` : journeyPiece;
          }
          await supabase
            .from('leads')
            .update({
              query: updatedJourney,
              utm_source: utms?.utm_source || undefined,
              utm_medium: utms?.utm_medium || undefined,
              utm_campaign: utms?.utm_campaign || undefined,
              utm_content: utms?.utm_content || undefined,
              utm_term: utms?.utm_term || undefined
            })
            .eq('id', existingLead.id);
        } else {
          const journeyPiece = pathInfo + (utms?.utm_source ? ` (utm: ${utms.utm_source})` : '');
          await supabase
            .from('leads')
            .insert({
              name: 'Анонім',
              visitor_uuid: visitorId,
              query: journeyPiece,
              is_free: true,
              status: 'anonymous',
              utm_source: utms?.utm_source || null,
              utm_medium: utms?.utm_medium || null,
              utm_campaign: utms?.utm_campaign || null,
              utm_content: utms?.utm_content || null,
              utm_term: utms?.utm_term || null
            });
        }
      } catch (supabaseErr) {
        console.error("Failed to log traffic lead in Supabase:", supabaseErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
