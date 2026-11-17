import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * The public URL for flight tickets is /flights.
 * Only the current public Flights route is /flights; /airlines remains an alias.
 * Admin session verification is performed by the protected server-side code.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Machine SEO endpoints should be served directly without redirect loops or auth barriers.
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml' || pathname === '/llms.txt') {
    return NextResponse.next();
  }

  // Canonicalize to non-www for Google Search Console consistency (www -> non-www).
  const host = (request.headers.get('host') || request.nextUrl.hostname || '').toLowerCase().replace(/:\d+$/, '');
  if (host === 'www.britishhajtravel.com' || request.nextUrl.hostname.toLowerCase() === 'www.britishhajtravel.com') {
    const destination = request.nextUrl.clone();
    destination.hostname = 'britishhajtravel.com';
    destination.protocol = 'https:';
    return NextResponse.redirect(destination, 308);
  }
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/airlines') {
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
  // The host redirect must also cover ordinary public pages, robots and sitemap.
  // Skip Next.js static assets for performance.
  matcher: ['/((?!_next/static|_next/image).*)'],
};
