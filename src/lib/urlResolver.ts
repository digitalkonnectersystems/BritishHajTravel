/**
 * Centralized Production-Safe Public URL Resolver
 * 
 * Strict guardrails:
 * - Never returns localhost, 127.0.0.1, 0.0.0.0, .local, internal Docker hostnames.
 * - Prioritizes:
 *   1. Explicit `canonicalSiteUrl` configured in SEO Intelligence DB settings.
 *   2. Server-side environment variable (NEXT_PUBLIC_APP_URL / NEXT_PUBLIC_BASE_URL / SITE_URL) IF it is a valid public domain.
 *   3. If neither is a valid public domain, returns null / "not configured" rather than guessing or leaking development hostnames.
 */

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
 * Normalizes a URL to a clean public origin: e.g. "https://www.kingtravel.ca"
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

/**
 * Resolves the Canonical Public Origin using strict precedence:
 * 1. explicitly configured `canonicalSiteUrl` in settings
 * 2. environment variable `NEXT_PUBLIC_APP_URL` / `NEXT_PUBLIC_BASE_URL` (if valid public domain)
 * 3. returns null if no valid public origin is configured
 */
export function resolveCanonicalPublicOrigin(settings?: { canonicalSiteUrl?: string | null }): string | null {
  // 1. Explicitly configured Site URL in database
  if (settings?.canonicalSiteUrl && isValidPublicOrigin(settings.canonicalSiteUrl)) {
    return normalizePublicOrigin(settings.canonicalSiteUrl);
  }

  // 2. Production Environment Variable (supports both NEXT_PUBLIC_ prefixes and non-prefixed keys)
  const envUrl =
    process.env.APP_URL ||
    process.env.BASE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_BASE_URL;

  if (envUrl && isValidPublicOrigin(envUrl)) {
    return normalizePublicOrigin(envUrl);
  }

  return null;
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
