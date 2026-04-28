import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const order = url.searchParams.get('order');
    const tariff = url.searchParams.get('tariff') || 'PRO';
    
    // 1. Check query parameters first (WayForPay can sometimes append these)
    let status = url.searchParams.get('transactionStatus') || 
                 url.searchParams.get('transaction_status') || 
                 url.searchParams.get('status') || 
                 url.searchParams.get('result') || '';
    
    // 2. If not in query, check the body (WayForPay usually sends POST to returnUrl)
    if (!status) {
      try {
        const rawBody = await req.text();
        if (rawBody) {
          // Log rawBody for debugging if needed (internally)
          if (rawBody.trim().startsWith('{')) {
            const json = JSON.parse(rawBody);
            status = json.transactionStatus || json.transaction_status || json.status || json.result || '';
          } else {
            const params = new URLSearchParams(rawBody);
            status = params.get('transactionStatus') || params.get('transaction_status') || params.get('status') || params.get('result') || '';
          }
        }
      } catch (e) {
        // Ignored
      }
    }

    // WayForPay statuses: Approved, Declined, Expired, Processing, Voided, Refunded, etc.
    // We only want to show Thank You if it's explicitly Approved or if we REALLY don't know (fallback)
    const sLower = status ? status.toLowerCase() : 'approved'; 
    const isSuccess = sLower === 'approved';

    // WayForPay returns via POST. We must use a 303 Redirect to force the browser 
    // to switch to a GET request when loading the thank-you or failure page.
    if (order) {
      const isReservation = tariff === 'Invest Baby' || tariff === 'Business Baby' || tariff === 'Finance Baby';
      const basePath = isReservation ? '/price' : '';

      if (!isSuccess) {
        return NextResponse.redirect(new URL(`${basePath}/failure/${order}?tariff=${tariff}`, req.url), 303);
      }
      return NextResponse.redirect(new URL(`${basePath}/thank-you/${order}?tariff=${tariff}`, req.url), 303);
    }
    
    return NextResponse.redirect(new URL('/', req.url), 303);
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url), 303);
  }
}
