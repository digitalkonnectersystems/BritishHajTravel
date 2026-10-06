import type { Metadata } from 'next';
import { resolveCanonicalPublicOrigin } from '@/lib/urlResolver';

export type SeoEntityType = 'page' | 'package' | 'blog' | 'visa';

const DEFAULT_ORIGIN = 'https://britishhajjtravel.com';
const BRAND = 'British Hajj Travel UK';
const DEFAULT_OG_IMAGE = `${DEFAULT_ORIGIN}/img/logo.png`;

export function parseSeoSettings(value: unknown): Record<string, any> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, any>;
  if (typeof value !== 'string') return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function getPublicOrigin(): string {
  return (resolveCanonicalPublicOrigin() || DEFAULT_ORIGIN).replace(/\/+$/, '');
}

export function normalizeRoutePath(pathname: string): string {
  const raw = String(pathname || '/').trim() || '/';
  let path = raw.startsWith('/') ? raw : `/${raw}`;
  path = path.replace(/\/{2,}/g, '/');
  if (path !== '/') path = path.replace(/\/+$/, '');
  return path || '/';
}

export function toAbsoluteUrl(value: unknown, fallbackPath = '/'): string {
  const origin = getPublicOrigin();
  const raw = String(value || '').trim();
  if (!raw) return `${origin}${normalizeRoutePath(fallbackPath) === '/' ? '' : normalizeRoutePath(fallbackPath)}`;
  try {
    const parsed = new URL(raw, origin);
    return parsed.toString();
  } catch {
    const path = normalizeRoutePath(raw);
    return `${origin}${path === '/' ? '' : path}`;
  }
}

function plainText(value: unknown): string {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function fitText(value: string, maxLength: number): string {
  const clean = plainText(value);
  if (clean.length <= maxLength) return clean;
  const clipped = clean.slice(0, Math.max(1, maxLength - 1));
  const lastSpace = clipped.lastIndexOf(' ');
  return `${(lastSpace > Math.floor(maxLength * 0.65) ? clipped.slice(0, lastSpace) : clipped).replace(/[\s,;:.!-]+$/, '')}…`;
}

function withoutRepeatedBrand(value: string): string {
  let clean = plainText(value);
  const escapedBrand = BRAND.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  clean = clean.replace(new RegExp(`(?:\\s*[|:-]\\s*${escapedBrand}){2,}$`, 'i'), ` | ${BRAND}`);
  clean = clean.replace(new RegExp(`\\s*[|:-]\\s*${escapedBrand}\\s*[|:-]\\s*${escapedBrand}`, 'ig'), ` | ${BRAND}`);
  return clean;
}

function buildTitle(base: string, explicit?: unknown, extra?: string): string {
  const configured = withoutRepeatedBrand(String(explicit || ''));
  // Preserve an explicitly configured value exactly. The SEO audit must see
  // the same over/under-length title that Next.js will render so it can flag it.
  if (configured) return configured;

  const cleanBase = plainText(base) || BRAND;
  const parts = [cleanBase];
  if (extra && !cleanBase.toLowerCase().includes(extra.toLowerCase())) parts.push(extra);
  let title = parts.join(' ');
  if (!title.toLowerCase().includes(BRAND.toLowerCase())) title = `${title} | ${BRAND}`;
  return fitText(title, 65);
}

function buildDescription(explicit: unknown, fallback: string): string {
  const configured = plainText(explicit);
  // Do not silently trim configured descriptions; surface length problems in SEO Center.
  return configured || fitText(fallback, 160);
}

function metadataFromParts({
  title,
  description,
  canonical,
  image,
  imageAlt,
  keywords,
  noIndex,
  noFollow,
  type = 'website',
}: {
  title: string;
  description: string;
  canonical: string;
  image?: unknown;
  imageAlt?: string;
  keywords?: unknown;
  noIndex?: unknown;
  noFollow?: unknown;
  type?: 'website' | 'article';
}): Metadata {
  const ogImage = toAbsoluteUrl(image || DEFAULT_OG_IMAGE, '/img/logo.png');
  const keywordValue = Array.isArray(keywords)
    ? keywords.map(String).filter(Boolean)
    : typeof keywords === 'string'
      ? keywords.split(',').map((item) => item.trim()).filter(Boolean)
      : undefined;

  return {
    title,
    description,
    keywords: keywordValue,
    alternates: { canonical },
    robots: {
      index: !Boolean(noIndex),
      follow: !Boolean(noFollow),
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: BRAND,
      type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: imageAlt || title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export function buildPageMetadata(page: any, routePath?: string): Metadata {
  const seo = parseSeoSettings(page?.seoData ?? page?.seoSettings);
  const path = normalizeRoutePath(routePath || page?.slug || '/');
  const canonical = toAbsoluteUrl(seo.canonicalUrl, path);
  const title = buildTitle(page?.title || 'Home', page?.metaTitle || seo.metaTitle);
  const description = buildDescription(
    page?.metaDescription || seo.metaDescription,
    page?.bannerDescription || `${page?.title || BRAND} information, Hajj and Umrah travel services from ${BRAND}.`,
  );

  return metadataFromParts({
    title,
    description,
    canonical,
    image: seo.ogImageUrl || page?.bannerBgImage,
    imageAlt: seo.ogCardAlt || seo.heroAlt || page?.title,
    keywords: seo.metaKeywords || seo.keywords,
    noIndex: seo.noIndex,
    noFollow: seo.noFollow,
  });
}

export function buildPackageMetadata(pkg: any, slug?: string): Metadata {
  const seo = parseSeoSettings(pkg?.seoData ?? pkg?.seoSettings);
  const cleanSlug = String(slug || pkg?.slug || '').replace(/^\/+/, '');
  const path = `/package/${cleanSlug}`;
  const monthYear = [pkg?.month, pkg?.year].filter(Boolean).join(' ');
  const title = buildTitle(pkg?.title || 'Pilgrimage Package', seo.metaTitle, monthYear || undefined);
  const description = buildDescription(
    seo.metaDescription,
    pkg?.shortDescription || `Book ${pkg?.title || 'this pilgrimage package'} with ${BRAND}. View dates, hotels, pricing and booking details.`,
  );

  return metadataFromParts({
    title,
    description,
    canonical: toAbsoluteUrl(seo.canonicalUrl, path),
    image: seo.ogImageUrl || pkg?.featuredImage,
    imageAlt: seo.ogCardAlt || seo.heroAlt || pkg?.title,
    keywords: seo.metaKeywords || seo.keywords,
    noIndex: seo.noIndex || pkg?.status === 'draft',
    noFollow: seo.noFollow,
  });
}

export function buildBlogMetadata(blog: any, slug?: string): Metadata {
  const seo = parseSeoSettings(blog?.seoData ?? blog?.seoSettings);
  const cleanSlug = String(slug || blog?.slug || '').replace(/^\/+/, '');
  const path = `/${cleanSlug}`;
  const legacyBlogPath = `/blogs/${cleanSlug}`;
  const configuredCanonical = String(seo.canonicalUrl || '').trim();
  // /blogs/[slug] is a permanent redirect in this project, so never emit that
  // redirect URL as canonical for a root-level blog detail page.
  const canonicalSource = configuredCanonical === legacyBlogPath || configuredCanonical.endsWith(legacyBlogPath)
    ? path
    : configuredCanonical;
  const title = buildTitle(blog?.title || 'Travel Guide', seo.metaTitle);
  const description = buildDescription(
    seo.metaDescription,
    blog?.excerpt || `Read ${blog?.title || 'this travel guide'} from ${BRAND}.`,
  );

  return metadataFromParts({
    title,
    description,
    canonical: toAbsoluteUrl(canonicalSource, path),
    image: seo.ogImageUrl || blog?.featuredImage,
    imageAlt: seo.ogCardAlt || seo.heroAlt || blog?.title,
    keywords: seo.metaKeywords || seo.keywords,
    noIndex: seo.noIndex || blog?.isPublished === false,
    noFollow: seo.noFollow,
    type: 'article',
  });
}

export function buildVisaMetadata(visa: any, routePath?: string): Metadata {
  const seo = parseSeoSettings(visa?.seoData ?? visa?.seoSettings);
  const path = normalizeRoutePath(routePath || `/saudi-visa#${visa?.slug || ''}`);
  const title = buildTitle(visa?.title || 'Saudi Visa', seo.metaTitle);
  const description = buildDescription(
    seo.metaDescription,
    visa?.shortDescription || `${visa?.title || 'Saudi visa'} information and application support from ${BRAND}.`,
  );

  return metadataFromParts({
    title,
    description,
    canonical: toAbsoluteUrl(seo.canonicalUrl, path),
    image: seo.ogImageUrl || visa?.imageUrl,
    imageAlt: seo.ogCardAlt || seo.heroAlt || visa?.title,
    keywords: seo.metaKeywords || seo.keywords,
    noIndex: seo.noIndex || visa?.isPublished === false,
    noFollow: seo.noFollow,
  });
}

export function metadataSnapshot(metadata: Metadata) {
  const title = typeof metadata.title === 'string'
    ? metadata.title
    : (metadata.title && typeof metadata.title === 'object' && 'absolute' in metadata.title ? String(metadata.title.absolute || '') : '');
  const canonicalValue = metadata.alternates?.canonical;
  const canonical = typeof canonicalValue === 'string'
    ? canonicalValue
    : canonicalValue instanceof URL
      ? canonicalValue.toString()
      : '';
  const openGraphImages = metadata.openGraph && 'images' in metadata.openGraph ? metadata.openGraph.images : undefined;
  let ogImage = '';
  if (Array.isArray(openGraphImages) && openGraphImages.length) {
    const first: any = openGraphImages[0];
    ogImage = typeof first === 'string' ? first : first instanceof URL ? first.toString() : String(first?.url || '');
  }
  const robots: any = metadata.robots || {};

  return {
    title,
    description: String(metadata.description || ''),
    canonical,
    ogImage,
    robotsIndex: robots.index !== false,
    robotsFollow: robots.follow !== false,
  };
}

export function buildEntityMetadata(entityType: SeoEntityType, entity: any): Metadata {
  if (entityType === 'package') return buildPackageMetadata(entity, entity?.slug);
  if (entityType === 'blog') return buildBlogMetadata(entity, entity?.slug);
  if (entityType === 'visa') return buildVisaMetadata(entity);
  return buildPageMetadata(entity, entity?.slug);
}
