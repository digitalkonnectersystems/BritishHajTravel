import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/sessionToken';

/** Navigation protection only; every Server Action also enforces permission. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authenticated = Boolean(verifySession(request.cookies.get('bht_admin_session')?.value));
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !authenticated) {
    const loginUrl = new URL('/letstravel', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (pathname === '/letstravel' && authenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/letstravel'] };
