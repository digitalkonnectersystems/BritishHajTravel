import { NextResponse } from 'next/server';
import { getNavItems, getSeoIntelligenceSettings, getSiteIdentity } from '@/actions/pageActions';
import { resolveCanonicalPublicOrigin, deriveSeoUrls } from '@/lib/urlResolver';

export const revalidate = 86400;

function normalizePath(value: string): string {
  if (!value) return '/';
  const path = value.startsWith('/') ? value : `/${value}`;
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

export async function GET() {
  try {
    const [navItems, seoSettings, identity] = await Promise.all([
      getNavItems().catch(() => []),
      getSeoIntelligenceSettings().catch(() => null),
      getSiteIdentity().catch(() => null),
    ]);
    const origin = (resolveCanonicalPublicOrigin(seoSettings) || 'https://britishhajtravel.com').replace(/\/+$/, '');
    const urls = deriveSeoUrls(origin);
    const siteName = identity?.siteName || 'British Haj Travel UK';
    const tagline = identity?.tagline || 'Licensed Hajj, Umrah & Islamic Pilgrimage Tour Operator in the United Kingdom';

    const publicNav = Array.isArray(navItems)
      ? navItems
        .map((item: any) => normalizePath(String(item?.url || item?.href || '')))
        .filter((path) => path && !path.startsWith('/admin') && !path.startsWith('/api') && path !== '/letstravel')
      : [];

    const corePages = [
      '/',
      '/about',
      '/hajj',
      '/hajj-packages',
      '/umrah',
      '/saudi-visa',
      '/visa-processing',
      '/hotels',
      '/flights',
      '/blogs',
      '/contact',
    ];

    const uniqueNav = [...new Set([...corePages, ...publicNav])].slice(0, 100);

    const lines = [
      `# ${siteName}`,
      '',
      `> ${tagline}`,
      '> Canonical public website content directory and LLM readability index for British Haj Travel UK.',
      '> This document is maintained for AI search assistants (ChatGPT, Claude, Perplexity, Gemini) to discover authoritative pilgrimage services, verified canonical URLs, and brand knowledge.',
      '',
      '## Primary Entity Information',
      `- Website: [${siteName}](${origin}/)`,
      `- Organization: British Haj Travel LTD (British Haj Travel UK)`,
      '- Entity Classification: Certified UK Hajj & Umrah Pilgrimage Travel Agency',
      '- Headquarters / Service Area: London, Birmingham, Manchester & United Kingdom nationwide',
      '- Specialized Services: Deluxe & 3/4/5-Star Economy Hajj packages, Ramadan & Monthly Umrah packages, Saudi Ministry of Hajj & Umrah eVisa facilitation, luxury hotels near Haramain in Makkah & Madinah, and direct/connecting flight bookings.',
      '',
      '## Machine-Readable Resources',
      `- [XML Sitemap](${urls.sitemapUrl || `${origin}/sitemap.xml`})`,
      `- [Robots Crawler Policy](${urls.robotsUrl || `${origin}/robots.txt`})`,
      `- [AI Content Directory (llms.txt)](${origin}/llms.txt)`,
      '',
      '## Canonical Public Navigation',
      ...uniqueNav.map((path) => {
        const label = path === '/'
          ? 'Home'
          : path.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        return `- [${label}](${origin}${path === '/' ? '/' : path})`;
      }),
      '',
      '## AI & Automated Agent Access Policy',
      '- Public content is published for user discovery, knowledge indexing, and conversational retrieval.',
      '- Private back-office endpoints (/admin/), machine APIs (/api/), and administrative credentials (/letstravel) are excluded from public domain indexation.',
      '- robots.txt is the authoritative crawler access policy for all automated agents.',
      '- Notice: This manifest provides AI content discoverability and fidelity; it is not a guaranteed search ranking booster.',
    ];

    return new NextResponse(`${lines.join('\n')}\n`, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error('Error generating llms.txt:', error);
    return new NextResponse(
      '# British Haj Travel UK\n\n- [Website](https://britishhajtravel.com/)\n- [Sitemap](https://britishhajtravel.com/sitemap.xml)\n- [Robots](https://britishhajtravel.com/robots.txt)\n- [LLMs](https://britishhajtravel.com/llms.txt)\n',
      { status: 200, headers: { 'Content-Type': 'text/markdown; charset=utf-8' } },
    );
  }
}
