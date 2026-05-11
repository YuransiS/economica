import { NextResponse } from 'next/server';

const GOOGLE_SHEET_WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbxx7guPyybvHxUAn91xg0uwzrFbXDqj9eJPESVQKjOx34GwvdoKE6-pSPOv4HNKLj5Y/exec';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, targetSheet, orderId, status, comment } = body;

    if (!GOOGLE_SHEET_WEBHOOK_URL) {
      throw new Error("Webhook URL not configured");
    }

    const payload: any = { 
      action,
      _sheet: targetSheet,
      orderId: orderId
    };

    if (action === 'update_status') payload.status = status;
    if (action === 'update_comment') payload.comment = comment;

    const response = await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
