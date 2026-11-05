import { NextRequest, NextResponse } from 'next/server';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin, deriveSeoUrls, getSiteEnvironment, isProductionSiteHost } from '@/lib/urlResolver';

export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    // Do not depend on the database's selected SEO environment alone. Staging and
    // production may share settings, so a production setting must never expose
    // the staging hostname to crawlers.
    const isIndexingEnabled = isProductionSiteHost(request.nextUrl.hostname) && getSiteEnvironment(seoSettings) === 'production' && (seoSettings?.siteIndexingEnabled ?? true);
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

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new NextResponse('User-agent: *\nDisallow: /\n', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
