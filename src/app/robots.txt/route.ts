import { NextRequest, NextResponse } from 'next/server';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin, deriveSeoUrls, getSiteEnvironment, isProductionSiteHost } from '@/lib/urlResolver';
import { runtimeInfo, runtimeError } from '@/lib/runtimeDiagnostics';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    // Hostinger may use 0.0.0.0 as the internal server URL. The Host header
    // contains the public hostname when accessed behind Hostinger's proxy.
    const requestHost = request.headers.get('host') || '';
    const publicHostname = requestHost.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
    const isProductionHost = isProductionSiteHost(publicHostname);

    runtimeInfo('robots.request', {
      internalHostname: request.nextUrl.hostname,
      requestHost, publicHostname,
      forwardedHost: request.headers.get('x-forwarded-host') || '',
      forwardedProto: request.headers.get('x-forwarded-proto') || '',
      siteEnvironment: seoSettings?.siteEnvironment,
      siteIndexingEnabled: seoSettings?.siteIndexingEnabled,
      isProductionHost,
    });
    // Staging and unrecognized domains remain non-indexable.
    const isIndexingEnabled = isProductionHost &&
      getSiteEnvironment(seoSettings) === 'production' &&
      seoSettings?.siteIndexingEnabled === true;
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings);
    const seoUrls = deriveSeoUrls(canonicalOrigin);

    let content = '';

    if (!isIndexingEnabled) {
      // Staging, local and unrecognized hosts are always non-indexable.
      content = `# Search engine indexing disabled for this hostname or in Settings > SEO Intelligence
User-agent: *
Disallow: /
`;
    } else {
      // Standard production robots.txt allowing indexing of public routes
      content = `User-agent: *
Allow: /

# Disallow private administrative & API routes
Disallow: /admin/
Disallow: /api/
`;

      // Custom Disallow paths configured by administrator
      if (Array.isArray(seoSettings?.additionalDisallowPaths) && seoSettings.additionalDisallowPaths.length > 0) {
        for (const path of seoSettings.additionalDisallowPaths) {
          const cleanPath = typeof path === 'string' ? path.trim() : '';
          if (/[\r\n]/.test(cleanPath)) continue;
          if (cleanPath && cleanPath.startsWith('/') && cleanPath !== '/') {
            content += `Disallow: ${cleanPath}\n`;
          }
        }
      }

      // Only include Sitemap line if a valid canonical public origin is configured
      if (seoUrls.sitemapUrl) {
        content += `\n# XML Sitemap\nSitemap: ${seoUrls.sitemapUrl}\n`;
      }
    }

    runtimeInfo('robots.result', {
      requestHost, isIndexingEnabled,
      canonicalOrigin, sitemapUrl: seoUrls.sitemapUrl,
      disallowAll: !isIndexingEnabled, status: 200,
      elapsedMs: Date.now() - startedAt,
    });
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    runtimeError('robots.failed', error, { status: 503, elapsedMs: Date.now() - startedAt });
    console.error('Error generating robots.txt:', error);
    return new NextResponse('Temporarily unable to generate robots.txt\n', {
      status: 503,
      headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store', 'Retry-After': '300' },
    });
  }
}
