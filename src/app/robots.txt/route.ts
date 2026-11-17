import { NextResponse } from 'next/server';
import { getSeoIntelligenceSettings } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin, deriveSeoUrls, getSiteEnvironment } from '@/lib/urlResolver';

export const revalidate = 86400; // 24 hours auto-refresh

function normalizeDisallowPath(value: unknown): string | null {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw || raw === '/' || !raw.startsWith('/')) return null;
  return raw.replace(/\s+/g, '');
}

function buildAllowedGroup(userAgents: string[], extraDisallows: string[]): string {
  return [
    ...userAgents.map((agent) => `User-agent: ${agent}`),
    'Allow: /',
    'Disallow: /admin/',
    'Disallow: /api/',
    'Disallow: /letstravel',
    ...extraDisallows.map((path) => `Disallow: ${path}`),
    '',
  ].join('\n');
}

function buildBlockedGroup(userAgents: string[], extraDisallows: string[]): string {
  return [
    ...userAgents.map((agent) => `User-agent: ${agent}`),
    'Disallow: /',
    ...extraDisallows.map((path) => `# Public override is disabled for this crawler; configured path: ${path}`),
    '',
  ].join('\n');
}

export async function GET() {
  try {
    const seoSettings = await getSeoIntelligenceSettings();
    const isIndexingEnabled = getSiteEnvironment(seoSettings) === 'production' && (seoSettings?.siteIndexingEnabled ?? true);
    const canonicalOrigin = resolveCanonicalPublicOrigin(seoSettings) || 'https://britishhajtravel.com';
    const seoUrls = deriveSeoUrls(canonicalOrigin);
    const additionalDisallowPaths = Array.isArray(seoSettings?.additionalDisallowPaths)
      ? (seoSettings.additionalDisallowPaths.map(normalizeDisallowPath).filter(Boolean) as string[])
      : [];

    let content = '';

    if (!isIndexingEnabled) {
      content = `# Search engine indexing is currently disabled by administrator in Settings > SEO Intelligence\nUser-agent: *\nDisallow: /\n`;
    } else {
      const aiSearchEnabled = seoSettings?.aiSearchCrawlersEnabled ?? true;
      const cohereAuditTokenEnabled = seoSettings?.cohereAiCrawlerEnabled ?? true;
      const aiTrainingEnabled = seoSettings?.aiTrainingCrawlersEnabled ?? false;

      content = `# British Haj Travel UK - Multi-Engine Compliance Access Policy\n# Canonical Origin: ${canonicalOrigin}\n#\n# AI search access and AI training access are controlled independently in\n# Settings > SEO Intelligence. Public pages are crawlable; admin/API paths are not.\n\n`;

      // 1. Traditional search engines: fully crawlable public site.
      content += '# 1. Traditional Search Engines\n';
      content += buildAllowedGroup(
        ['Googlebot', 'Bingbot', 'Applebot', 'YandexBot'],
        additionalDisallowPaths,
      );

      // 2. AI answer/search crawlers: allowed by default for real-time search & answer retrieval.
      content += '# 2. AI Search / Answer Crawlers\n';
      content += aiSearchEnabled
        ? buildAllowedGroup(['ChatGPT-User', 'PerplexityBot', 'Claude-Web', 'OAI-SearchBot'], additionalDisallowPaths)
        : buildBlockedGroup(['ChatGPT-User', 'PerplexityBot', 'Claude-Web', 'OAI-SearchBot'], additionalDisallowPaths);

      // 3. SEOptimer / Cohere Audit Compatibility Token.
      content += '# 3. Cohere Audit Compatibility Token\n';
      content += cohereAuditTokenEnabled
        ? buildAllowedGroup(['cohere-ai', 'Cohere-ai', 'CohereBot'], additionalDisallowPaths)
        : buildBlockedGroup(['cohere-ai', 'Cohere-ai', 'CohereBot'], additionalDisallowPaths);

      // 4. AI training / bulk model scraping crawlers (opt-in; disabled by default).
      content += '# 4. AI Training / Bulk Crawlers\n';
      content += aiTrainingEnabled
        ? buildAllowedGroup(
          ['GPTBot', 'ClaudeBot', 'Bytespider', 'CCBot', 'Google-Extended', 'Diffbot', 'FacebookBot', 'Meta-ExternalAgent', 'Amazonbot'],
          additionalDisallowPaths,
        )
        : buildBlockedGroup(
          ['GPTBot', 'ClaudeBot', 'Bytespider', 'CCBot', 'Google-Extended', 'Diffbot', 'FacebookBot', 'Meta-ExternalAgent', 'Amazonbot'],
          additionalDisallowPaths,
        );

      // 5. Default Fallback for all other compliant user-agents.
      content += '# 5. Default Fallback\n';
      content += buildAllowedGroup(['*'], additionalDisallowPaths);

      // 6. XML Sitemap reference
      if (seoUrls.sitemapUrl) {
        content += `# XML Sitemap\nSitemap: ${seoUrls.sitemapUrl}\n`;
      }
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new NextResponse('User-agent: *\nAllow: /\n\nSitemap: https://britishhajtravel.com/sitemap.xml\n', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}
