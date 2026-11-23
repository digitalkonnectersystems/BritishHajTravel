/**
 * RSS 2.0 feed for the current BHT blog CMS.
 * Keep permalinks aligned with src/app/[...slug]/page.tsx (/{slug}).
 * Admin blog actions already invalidate the `blogs` cache tag on publish/edit/delete.
 */
import { db } from '@/db';
import { blogPosts } from '@/db/schema';
import { and, desc, eq, isNotNull, ne } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { PRODUCTION_SITE_ORIGIN } from '@/lib/urlResolver';

const PUBLIC_SITE_ORIGIN = PRODUCTION_SITE_ORIGIN.replace(/\/+$/, '');
const FEED_URL = `${PUBLIC_SITE_ORIGIN}/feed/`;
const MAX_FEED_POSTS = 50;

const getPublishedFeedPosts = unstable_cache(
  async () => db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      category: blogPosts.category,
      authorName: blogPosts.authorName,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
      updatedAt: blogPosts.updatedAt,
    })
    .from(blogPosts)
    .where(and(
      eq(blogPosts.isPublished, true),
      isNotNull(blogPosts.slug),
      ne(blogPosts.slug, ''),
    ))
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.id))
    .limit(MAX_FEED_POSTS),
  ['bht-public-rss-feed-full-content-v2'],
  { tags: ['blogs'], revalidate: 300 },
);

/** XML 1.0 escaping, including disallowed control characters. */
function xml(value: unknown): string {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Some older blog records have no excerpt. Make a readable one from CMS HTML. */
function plainText(value: unknown): string {
  return String(value ?? '')
    .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (entity, code: string) => {
      const point = code.toLowerCase().startsWith('x')
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return point >= 32 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff)
        ? String.fromCodePoint(point)
        : ' ';
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Preserve the original CMS HTML in content:encoded just like WordPress RSS.
 * Split CDATA terminators safely so arbitrary editorial content remains valid XML.
 */
function fullContentCdata(value: unknown): string {
  const html = String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '');
  return `<![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function excerptFromPost(post: { excerpt: string | null; content: string | null }): string {
  const summary = plainText(post.excerpt) || plainText(post.content);
  const chars = Array.from(summary);
  if (chars.length <= 400) return summary;
  return `${chars.slice(0, 397).join('').trimEnd()}...`;
}

function rssDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toUTCString();
}

export async function createRssResponse(): Promise<Response> {
  try {
    const posts = (await getPublishedFeedPosts())
      .filter((post) => typeof post.slug === 'string' && post.slug.trim() !== '');

    const items = posts.map((post) => {
      // Blog details live at /{slug}; /blogs/{slug} is a legacy redirect.
      const cleanSlug = (post.slug ?? '').trim().replace(/^\/+|\/+$/g, '');
      const permalink = `${PUBLIC_SITE_ORIGIN}/${encodeURIComponent(cleanSlug)}`;
      const date = rssDate(post.publishedAt ?? post.createdAt);
      const category = post.category?.trim();
      const author = post.authorName?.trim();

      return [
        '    <item>',
        `      <title>${xml(post.title)}</title>`,
        `      <link>${xml(permalink)}</link>`,
        `      <guid isPermaLink="true">${xml(permalink)}</guid>`,
        ...(author ? [`      <dc:creator>${xml(author)}</dc:creator>`] : []),
        ...(date ? [`      <pubDate>${date}</pubDate>`] : []),
        ...(category ? [`      <category>${xml(category)}</category>`] : []),
        `      <description>${xml(excerptFromPost(post))}</description>`,
        `      <content:encoded>${fullContentCdata(post.content)}</content:encoded>`,
        '    </item>',
      ].join('\n');
    });

    const mostRecentUpdate = posts
      .map((post) => new Date(post.updatedAt ?? post.publishedAt ?? post.createdAt ?? 0).getTime())
      .filter((time) => Number.isFinite(time) && time > 0)
      .reduce((max, time) => Math.max(max, time), 0);

    const feed = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
      '  <channel>',
      '    <title>British Haj Travel | Hajj &amp; Umrah Guides</title>',
      `    <link>${xml(`${PUBLIC_SITE_ORIGIN}/blogs`)}</link>`,
      '    <description>Latest Hajj, Umrah, Saudi visa and pilgrimage travel articles from British Haj Travel UK.</description>',
      '    <language>en-gb</language>',
      '    <ttl>5</ttl>',
      `    <atom:link href="${xml(FEED_URL)}" rel="self" type="application/rss+xml" />`,
      ...(mostRecentUpdate ? [`    <lastBuildDate>${new Date(mostRecentUpdate).toUTCString()}</lastBuildDate>`] : []),
      ...items,
      '  </channel>',
      '</rss>',
      '',
    ].join('\n');

    return new Response(feed, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[rss] Failed to generate published blog feed:', error);
    // Fail explicitly instead of returning an empty 200 feed when the DB is down.
    return new Response('RSS feed temporarily unavailable\n', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        'Retry-After': '300',
      },
    });
  }
}
