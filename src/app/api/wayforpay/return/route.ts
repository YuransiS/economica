import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const order = url.searchParams.get('order');
    const tariff = url.searchParams.get('tariff') || 'PRO';
    
    // Parse the form data to check the transaction status
    const rawBody = await req.text();
    let status = 'Approved'; // Default to Approved just in case
    
    try {
      if (rawBody) {
        if (rawBody.startsWith('{')) {
          const json = JSON.parse(rawBody);
          status = json.transactionStatus || json.transaction_status || json.status || 'Approved';
        } else {
          const params = new URLSearchParams(rawBody);
          status = params.get('transactionStatus') || params.get('transaction_status') || params.get('status') || 'Approved';
        }
      }
    } catch (e) {
      // Ignored
    }

    const sLower = status.toLowerCase();
    const isDeclined = sLower === 'declined' || sLower === 'fail';

    // WayForPay returns via POST. We must use a 303 Redirect to force the browser 
    // to switch to a GET request when loading the thank-you or failure page.
    if (order) {
      const isReservation = tariff === 'Invest Baby' || tariff === 'Business Baby' || tariff === 'Finance Baby';
      const basePath = isReservation ? '/price' : '';

      if (isDeclined) {
        return NextResponse.redirect(new URL(`${basePath}/failure/${order}?tariff=${tariff}`, req.url), 303);
      }
      return NextResponse.redirect(new URL(`${basePath}/thank-you/${order}?tariff=${tariff}`, req.url), 303);
    }
    
    return NextResponse.redirect(new URL('/', req.url), 303);
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url), 303);
  }
}
