/** Public link filtering. Admin CRUD continues to display draft records. */
export type PublicVisaPage = { slug: string; title: string };

function key(value: unknown): string {
  return String(value ?? '').toLowerCase().trim().replace(/^\/+|\/+$/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const canonicalCardKeys: Record<string, string> = {
  'india': 'indian-passport',
  'indian': 'indian-passport',
  'pakistan': 'pakistani-passport',
  'pakistani': 'pakistani-passport',
  'bangladesh': 'bangladeshi-passport',
  'bangladeshi': 'bangladeshi-passport',
  'afghanistan': 'afghan-passport',
  'afghan': 'afghan-passport',
  'british': 'british-passport',
  'uk': 'british-passport',
  'british-tourist': 'british-tourist',
  'british-tourist-passport': 'british-tourist',
  'british-tourist-visa': 'british-tourist',
  'eta-saudi-visa': 'eta-saudi-visa',
  'saudi-eta': 'eta-saudi-visa',
  'saudi-eta-visa': 'eta-saudi-visa',
  'eta': 'eta-saudi-visa',
};

function canonicalCardKey(value: unknown): string {
  const normalized = key(value).replace(/^visa-processing-/, '');
  return canonicalCardKeys[normalized] || normalized;
}

/** A card is emitted only when a matching published CMS page exists. */
export function resolveVisibleVisaCards<T extends { country?: string; slug?: string }>(
  cards: T[],
  published: PublicVisaPage[],
  publishedSitePaths: readonly string[] = [],
): Array<{ card: T; href: string }> {
  const knownPaths = new Set(publishedSitePaths);
  const used = new Set<string>();
  return cards.flatMap(card => {
    if (card.country === 'More' && key(card.slug) === 'saudi-visa') {
      return knownPaths.has('/saudi-visa') ? [{ card, href: '/saudi-visa' }] : [];
    }
    const identity = canonicalCardKey(card.slug || card.country);
    const matched = published.find(page => {
      if (!/^\/visa-processing\/[a-z0-9-]+$/.test(page.slug)) return false;
      const pageKey = key(page.slug).replace(/^visa-processing-/, '');
      const titleKey = key(page.title).replace(/-visa-processing$/, '');
      return canonicalCardKey(pageKey) === identity || canonicalCardKey(titleKey) === identity;
    });
    if (!matched || used.has(matched.slug)) return [];
    used.add(matched.slug);
    return [{ card, href: matched.slug }];
  });
}

export function isHiddenInternalLink(href: unknown, hiddenPaths: readonly string[], publishedVisaPaths?: readonly string[]): boolean {
  const raw = String(href ?? '');
  if (!raw.startsWith('/') || raw.startsWith('//')) return false;
  const path = raw.split(/[?#]/, 1)[0].replace(/\/$/, '') || '/';
  if (path.startsWith('/visa-processing/') && publishedVisaPaths && !publishedVisaPaths.includes(path)) return true;
  return hiddenPaths.includes(path);
}

export function removeHiddenNavigation<T extends { url?: string; children?: Array<{ url?: string }> }>(items: T[], hiddenPaths: readonly string[], publishedVisaPaths?: readonly string[]): T[] {
  return items.flatMap(item => {
    if (isHiddenInternalLink(item.url, hiddenPaths, publishedVisaPaths)) return [];
    const children = Array.isArray(item.children) ? removeHiddenNavigation(item.children, hiddenPaths, publishedVisaPaths) : item.children;
    return [{ ...item, ...(Array.isArray(item.children) ? { children } : {}) }];
  });
}
