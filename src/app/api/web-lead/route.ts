import { NextResponse } from 'next/server';

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, telegram, utms } = body;

    if (GOOGLE_SHEET_WEBHOOK_URL) {
      try {
        await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_lead',
            targetSheet: 'Заявки Вебінар', // Identifier for Apps Script
            name,
            phone,
            telegram,
            tariff: 'Безкоштовно',
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

    return NextResponse.json({ success: true, redirectUrl: 'https://t.me/+NAcZ4dcRKdVlZDky' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
