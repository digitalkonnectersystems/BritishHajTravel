import { getVisibleBlogFaqs } from './blogFaq';

type JsonLdNode = Record<string, any>;

function hasType(node: JsonLdNode, type: string): boolean {
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  return types.some((value) => typeof value === 'string' && value.toLowerCase() === type.toLowerCase());
}

function isArticle(node: JsonLdNode): boolean {
  return ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle'].some((type) => hasType(node, type));
}

/** Custom SEO JSON-LD may be a single node, an array, or a schema.org @graph. */
export function readCustomBlogSchema(value: unknown): JsonLdNode[] {
  let input = value;
  if (typeof input === 'string') {
    const unwrapped = input.trim()
      .replace(/^<script\b[^>]*>/i, '')
      .replace(/<\/script>\s*$/i, '')
      .trim();
    try {
      input = JSON.parse(unwrapped);
    } catch {
      return [];
    }
  }
  if (Array.isArray(input)) {
    return input.flatMap(readCustomBlogSchema);
  }
  if (!input || typeof input !== 'object') return [];
  const node = input as JsonLdNode;
  if (Array.isArray(node['@graph'])) {
    const graph = node['@graph'].flatMap(readCustomBlogSchema);
    const { '@context': _context, '@graph': _graph, ...standalone } = node;
    return Object.keys(standalone).some((key) => key === '@type' || key === '@id')
      ? [...graph, standalone]
      : graph;
  }
  if (!node['@type'] && !node['@id']) return [];
  const { '@context': _context, ...rest } = node;
  return [rest];
}

function appendHasPart(node: JsonLdNode, faqId: string): JsonLdNode {
  const existing = node.hasPart === undefined ? [] : Array.isArray(node.hasPart) ? node.hasPart : [node.hasPart];
  if (existing.some((part: any) => part?.['@id'] === faqId || part === faqId)) return node;
  const hasPart = [...existing, { '@id': faqId }];
  return { ...node, hasPart: hasPart.length === 1 ? hasPart[0] : hasPart };
}

function safeIso(value: unknown): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

interface BlogStructuredDataInput {
  blog: {
    title: string;
    excerpt?: string | null;
    authorName?: string | null;
    publishedAt?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
    seoSettings?: unknown;
    faqs?: unknown;
  };
  pageUrl: string; // Already resolved using the same canonical override as Next.js metadata.
  imageUrl: string; // Absolute featured-image URL.
  logoUrl: string;  // Absolute logo URL.
}

/**
 * Build one interconnected graph. Keep existing custom Organization, WebSite,
 * BreadcrumbList and Article fields, while replacing stale custom FAQPage nodes
 * with the currently visible blog FAQs. This prevents duplicate or hidden Q&As.
 */
export function buildBlogStructuredData({ blog, pageUrl, imageUrl, logoUrl }: BlogStructuredDataInput) {
  const url = pageUrl.replace(/#.*$/, '');
  const articleId = `${url}#article`;
  const webPageId = `${url}#webpage`;
  const faqId = `${url}#faq`;
  const seoSettings = typeof blog.seoSettings === 'string'
    ? (() => { try { return JSON.parse(blog.seoSettings); } catch { return {}; } })()
    : blog.seoSettings;
  const customSchema = seoSettings && typeof seoSettings === 'object' && !Array.isArray(seoSettings)
    ? (seoSettings as Record<string, unknown>).jsonLdPayload
    : null;

  // FAQ data lives in blog_posts.faqs, not in a manually maintained SEO field.
  const faqs = getVisibleBlogFaqs(blog.faqs);
  // Older blogs may already have manually configured FAQPage markup. Leave it
  // untouched until the blog FAQ editor has explicitly saved managed FAQs.
  const hasManagedFaqs = blog.faqs !== null && blog.faqs !== undefined;
  const customNodes = readCustomBlogSchema(customSchema)
    .filter((node) => !hasManagedFaqs || !hasType(node, 'FAQPage'));
  const customOrganization = customNodes.find((node) => hasType(node, 'Organization'));
  const customWebsite = customNodes.find((node) => hasType(node, 'WebSite'));
  const customBreadcrumbs = customNodes.find((node) => hasType(node, 'BreadcrumbList'));

  const article: JsonLdNode = {
    '@type': 'Article',
    '@id': articleId,
    headline: blog.title,
    description: blog.excerpt || '',
    image: imageUrl,
    author: { '@type': 'Person', name: blog.authorName || 'British Hajj Travel Editorial' },
    publisher: customOrganization?.['@id']
      ? { '@id': customOrganization['@id'] }
      : {
        '@type': 'Organization',
        name: 'British Hajj Travel UK',
        logo: { '@type': 'ImageObject', url: logoUrl },
      },
    datePublished: safeIso(blog.publishedAt) || safeIso(blog.createdAt),
    dateModified: safeIso(blog.updatedAt),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  const hasCustomArticle = customNodes.some(isArticle);
  const nodes = hasCustomArticle ? [...customNodes] : [article, ...customNodes];
  if (faqs.length === 0) {
    // No FAQs: keep the Article and any other existing schema without adding an empty FAQPage.
    return hasCustomArticle || customNodes.length > 0
      ? { '@context': 'https://schema.org', '@graph': nodes }
      : { '@context': 'https://schema.org', ...article };
  }

  const faqRef = { '@id': faqId };
  const articleIndex = nodes.findIndex(isArticle);
  const effectiveArticleId = articleIndex >= 0 ? nodes[articleIndex]['@id'] || articleId : articleId;
  if (articleIndex >= 0) {
    nodes[articleIndex] = appendHasPart({ ...nodes[articleIndex], '@id': effectiveArticleId }, faqId);
  }

  let webPageIndex = nodes.findIndex((node) => hasType(node, 'WebPage'));
  if (webPageIndex < 0) {
    nodes.push({
      '@type': 'WebPage',
      '@id': webPageId,
      url,
      name: blog.title,
      mainEntity: { '@id': effectiveArticleId },
      ...(customWebsite?.['@id'] ? { isPartOf: { '@id': customWebsite['@id'] } } : {}),
      ...(customBreadcrumbs?.['@id'] ? { breadcrumb: { '@id': customBreadcrumbs['@id'] } } : {}),
      hasPart: faqRef,
    });
    webPageIndex = nodes.length - 1;
  } else {
    const existingPage = nodes[webPageIndex];
    nodes[webPageIndex] = appendHasPart({
      ...existingPage,
      '@id': existingPage['@id'] || webPageId,
      mainEntity: existingPage.mainEntity || { '@id': effectiveArticleId },
    }, faqId);
  }

  const pageNodeId = nodes[webPageIndex]['@id'] || webPageId;
  // Link back to the matching WebPage node; do not overwrite a manually
  // configured Article's mainEntityOfPage unless it is absent.
  if (articleIndex >= 0 && (!hasCustomArticle || !nodes[articleIndex].mainEntityOfPage)) {
    nodes[articleIndex] = { ...nodes[articleIndex], mainEntityOfPage: { '@id': pageNodeId } };
  }
  nodes.push({
    '@type': 'FAQPage',
    '@id': faqId,
    url,
    isPartOf: { '@id': pageNodeId },
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  });
  return { '@context': 'https://schema.org', '@graph': nodes };
}

/** Prevent a question or any custom value from prematurely ending the script tag. */
export function serializeBlogStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
