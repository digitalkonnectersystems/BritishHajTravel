import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { runtimeInfo, runtimeWarn, shouldTracePublicPath } from '@/lib/runtimeDiagnostics';

/**
 * The public URL for flight tickets is /flights.
 * Only the current public Flights route is /flights; /airlines remains an alias.
 * Admin session verification is performed by the protected server-side code.
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isActionRequest = request.method === 'POST' && Boolean(request.headers.get('next-action'));
  const trace = isActionRequest || shouldTracePublicPath(pathname);
  if (trace) {
    // Origin and X-Forwarded-* contain routing hints. Never log cookies, URL queries or POST bodies.
    let originHost = '';
    try { originHost = new URL(request.headers.get('origin') || '').host; } catch { /* no Origin */ }
    runtimeInfo('proxy.request', {
      method: request.method,
      path: pathname,
      requestHost: request.headers.get('host') || '',
      requestProtocol: request.nextUrl.protocol,
      forwardedHost: request.headers.get('x-forwarded-host') || '',
      forwardedProto: request.headers.get('x-forwarded-proto') || '',
      originHost,
      isActionRequest,
      // Keep only an 8-character prefix for correlating with framework action errors.
      actionPrefix: isActionRequest ? (request.headers.get('next-action') || '').slice(0, 8) : undefined,
    });
  }
  // Canonicalize the public host before any path redirects. This preserves
  // paths and query parameters and leaves the staging host untouched.
  if (request.nextUrl.hostname.toLowerCase() === 'britishhajtravel.com') {
    const destination = request.nextUrl.clone();
    destination.hostname = 'www.britishhajtravel.com';
    destination.protocol = 'https:';
    if (trace) runtimeWarn('proxy.redirect', {
      reason: 'canonical_host', method: request.method, path: pathname,
      fromHost: request.nextUrl.hostname, toHost: destination.hostname,
      status: 308, isActionRequest,
    });
    return NextResponse.redirect(destination, 308);
  }

  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/airlines') {
    const destination = request.nextUrl.clone();
    destination.pathname = '/flights';
    if (trace) runtimeInfo('proxy.redirect', {
      reason: 'airlines_alias', method: request.method, path: pathname,
      toPath: '/flights', status: 308, isActionRequest,
    });
    return NextResponse.redirect(destination, 308);
  }

  const hasSessionCookie = Boolean(request.cookies.get('bht_admin_session')?.value);

  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && !hasSessionCookie) {
    const loginUrl = new URL('/letstravel', request.url);
    loginUrl.searchParams.set('from', pathname);
    if (trace) runtimeInfo('proxy.redirect', {
      reason: 'admin_session_missing', method: request.method, path: pathname,
      toPath: '/letstravel', status: 307, isActionRequest,
    });
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // The host redirect must also cover ordinary public pages, robots and sitemap.
  // Skip Next.js static assets for performance.
  matcher: ['/((?!_next/static|_next/image).*)'],
};
