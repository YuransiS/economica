import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('admin_session');
  const isAuthenticated = 
    session?.value === 'authenticated_yuransis' || 
    session?.value === 'authenticated_anya_koorator';

  // 1. If trying to access admin login page while already authenticated
  if (pathname === '/admin/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 2. Protect all /admin and /api/admin routes except login and link generation
  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isExemptedRoute = 
    pathname === '/admin/login' || 
    pathname === '/api/admin/login' || 
    pathname === '/api/admin/generate-link';

  if (isProtectedRoute && !isExemptedRoute && !isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin', '/api/admin/:path*'],
};
