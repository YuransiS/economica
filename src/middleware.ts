import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('admin_session');
  const isAuthenticated = 
    session?.value === 'authenticated_yuransis' || 
    session?.value === 'authenticated_anya_koorator';

  // 1. Admin route protection & auth logic
  const isAdminRoute = 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/minicourse/admin') || 
    pathname.startsWith('/api/admin');

  const isAdminExempted = 
    pathname === '/admin/login' || 
    pathname === '/minicourse/admin/login' || 
    pathname === '/api/admin/login' || 
    pathname === '/api/admin/generate-link';

  if (isAdminRoute) {
    if (pathname === '/admin/login' && isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (!isAdminExempted && !isAuthenticated) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // 2. Allow API routes, static assets, and the /restricted page itself
  const isApiRoute = pathname.startsWith('/api/');
  const isRestrictedPage = pathname === '/restricted';

  if (isApiRoute || isRestrictedPage) {
    return NextResponse.next();
  }

  // 3. For ALL other landing pages & subpages (including /, /intensive, /minicourse, /web, /checkout, /price, etc.),
  // rewrite to the /restricted wall.
  return NextResponse.rewrite(new URL('/restricted', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static asset extensions (.svg, .png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};

