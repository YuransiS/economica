import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const order = url.searchParams.get('order');
    
    // WayForPay returns via POST. We must use a 303 Redirect to force the browser 
    // to switch to a GET request when loading the thank-you page.
    if (order) {
      return NextResponse.redirect(new URL(`/thank-you/${order}`, req.url), 303);
    }
    
    return NextResponse.redirect(new URL('/', req.url), 303);
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url), 303);
  }
}
