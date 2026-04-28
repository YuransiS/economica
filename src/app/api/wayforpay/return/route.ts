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

    if (order) {
      // Redirect to the intermediate checking page (always GET via 303)
      return NextResponse.redirect(
        new URL(`/checking-payment/${order}?tariff=${tariff}`, req.url),
        303
      );
    }
    
    return NextResponse.redirect(new URL('/', req.url), 303);
  } catch (err) {
    return NextResponse.redirect(new URL('/', req.url), 303);
  }
}
