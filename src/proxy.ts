import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Fast, optimistic redirect only. Do not fetch the signing secret from MySQL
 * in Proxy; the authenticated admin layout and protected Server Actions
 * verify the cookie signature on the server.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get('bht_admin_session')?.value);

  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !hasSessionCookie) {
    const loginUrl = new URL('/letstravel', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
