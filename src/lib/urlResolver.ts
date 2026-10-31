/**
 * Public SEO origin selection. Admin > Settings > SEO Intelligence chooses
 * staging or production. The legacy free-text canonicalSiteUrl is ignored so
 * imported live-domain values cannot override the active environment.
 */

export const STAGING_SITE_ORIGIN = 'https://new.britishhajtravel.com';
export const PRODUCTION_SITE_ORIGIN = 'https://www.britishhajtravel.com';
export type SiteEnvironment = 'staging' | 'production';

export function getSiteEnvironment(settings?: { siteEnvironment?: string | null }): SiteEnvironment {
  return settings?.siteEnvironment === 'production' ? 'production' : 'staging';
}

/** Authoritative public origin for the selected Admin > SEO environment. */
export function getEnvironmentOrigin(settings?: { siteEnvironment?: string | null }): string {
  return getSiteEnvironment(settings) === 'production' ? PRODUCTION_SITE_ORIGIN : STAGING_SITE_ORIGIN;
}

const FORBIDDEN_HOST_PATTERNS = [
  /^localhost(:\d+)?$/i,
  /^127\.\d+\.\d+\.\d+(:\d+)?$/,
  /^0\.0\.0\.0(:\d+)?$/,
  /^10\.\d+\.\d+\.\d+(:\d+)?$/,
  /^192\.168\.\d+\.\d+(:\d+)?$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/,
  /\.local(:\d+)?$/i,
  /\.internal(:\d+)?$/i,
  /\.lan(:\d+)?$/i,
];

/**
 * Validates whether a given URL string is a valid public HTTPS or HTTP origin.
 */
export function isValidPublicOrigin(urlString?: string | null): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  const trimmed = urlString.trim();
  if (!trimmed || trimmed === '/' || trimmed === 'http://' || trimmed === 'https://') return false;

  try {
    const urlObj = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    
    // Only permit http or https
    if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') return false;
    
    const hostname = urlObj.hostname.toLowerCase();
    
    for (const pattern of FORBIDDEN_HOST_PATTERNS) {
      if (pattern.test(hostname)) return false;
    }

    // Must have a valid dot in hostname (e.g. domain.com)
    if (!hostname.includes('.')) return false;

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Normalizes a URL to a clean public origin: e.g. "https://www.britishhajjtravel.com"
 */
export function normalizePublicOrigin(urlString?: string | null): string | null {
  if (!isValidPublicOrigin(urlString)) return null;
  try {
    const cleanStr = urlString!.trim();
    const urlObj = new URL(cleanStr.startsWith('http') ? cleanStr : `https://${cleanStr}`);
    
    // Enforce lowercase hostname and remove trailing slashes/paths
    return `${urlObj.protocol}//${urlObj.host.toLowerCase()}`;
  } catch (e) {
    return null;
  }
}

/** Environment selection is authoritative; legacy/host environment variables do not override it. */
export function resolveCanonicalPublicOrigin(settings?: { siteEnvironment?: string | null; canonicalSiteUrl?: string | null }): string {
  // The environment selector is authoritative, including for legacy DB rows that
  // have a hardcoded production canonicalSiteUrl. Do not use that old field.
  return getEnvironmentOrigin(settings);
}

/**
 * Derives canonical public SEO URLs
 */
export function deriveSeoUrls(canonicalOrigin: string | null) {
  if (!canonicalOrigin) {
    return {
      isConfigured: false,
      origin: null,
      websiteUrl: null,
      robotsUrl: null,
      sitemapUrl: null,
    };
  }

  const cleanOrigin = canonicalOrigin.replace(/\/+$/, '');
  return {
    isConfigured: true,
    origin: cleanOrigin,
    websiteUrl: `${cleanOrigin}/`,
    robotsUrl: `${cleanOrigin}/robots.txt`,
    sitemapUrl: `${cleanOrigin}/sitemap.xml`,
  };
}
