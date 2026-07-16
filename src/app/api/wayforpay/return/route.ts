import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return handleRedirect(req);
}

export async function GET(req: Request) {
  return handleRedirect(req);
}

async function handleRedirect(req: Request) {
  try {
    const url = new URL(req.url);
    const order = url.searchParams.get('order');
    const tariff = url.searchParams.get('tariff') || 'PRO';

    let wfpReason = '';
    let wfpCode = '';

    if (req.method === 'POST') {
      try {
        const rawBody = await req.clone().text();
        console.log("WayForPay Return POST Body:", rawBody);
        
        let data: any = {};
        try {
          data = JSON.parse(rawBody);
        } catch {
          const params = new URLSearchParams(rawBody);
          data = Object.fromEntries(params.entries());
        }
        
        if (data.reason) wfpReason = data.reason;
        if (data.reasonCode) wfpCode = data.reasonCode;
        if (data.transactionStatus && !wfpReason) wfpReason = data.transactionStatus;
      } catch (bodyErr) {
        console.error("Failed to parse return POST body:", bodyErr);
      }
    }

    if (order) {
      const redirectUrl = new URL(`/checking-payment/${order}?tariff=${tariff}`, req.url);
      if (wfpReason) redirectUrl.searchParams.set('wfpReason', wfpReason);
      if (wfpCode) redirectUrl.searchParams.set('wfpCode', wfpCode);

      // Redirect to the intermediate checking page (always GET via 303)
      return NextResponse.redirect(redirectUrl, 303);
    }
    
    return NextResponse.redirect(new URL('/', req.url), 303);
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url), 303);
  }
}
