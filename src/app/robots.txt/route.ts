import { NextResponse } from 'next/server';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin, deriveSeoUrls } from '@/lib/urlResolver';

export const revalidate = 3600;

export async function GET() {
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const isIndexingEnabled = seoSettings?.siteIndexingEnabled ?? true;
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings);
    const seoUrls = deriveSeoUrls(canonicalOrigin);

    let content = '';

    if (!isIndexingEnabled) {
      // Disallow all search engine bots when site indexing is disabled
      content = `# Search engine indexing is currently disabled by administrator in Settings > SEO Intelligence
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
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new NextResponse('User-agent: *\nAllow: /\n', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
