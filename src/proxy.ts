import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * The public URL for flight tickets is /flights.
 * Redirect legacy paths TO /flights (never redirect /flights away).
 * Admin session verification is performed by the protected server-side code.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/airlines' || normalizedPath === '/cheap-flights-air-tickets') {
    const destination = request.nextUrl.clone();
    destination.pathname = '/flights';
    return NextResponse.redirect(destination, 308);
  }

  const hasSessionCookie = Boolean(request.cookies.get('bht_admin_session')?.value);

  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !hasSessionCookie) {
    const loginUrl = new URL('/letstravel', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/airlines/:path*', '/cheap-flights-air-tickets/:path*'],
};
