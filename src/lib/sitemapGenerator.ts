import { db } from '@/db';
import { sitePages, packages, blogPosts, visaServices, sitemapConfigs, sitemapLogs } from '@/db/schema';
import { eq, or, and, isNotNull } from 'drizzle-orm';

interface SitemapItem {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: string;
  images?: string[];
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeImageUrl(imgUrl: string, baseUrl: string): string {
  if (!imgUrl) return '';
  const trimmed = imgUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${cleanBase}${cleanPath}`;
}

export async function generateSitemapXml(baseUrl: string): Promise<string> {
  const items = await gatherAllSitemapItems(baseUrl);
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  
  for (const item of items) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(item.loc)}</loc>\n`;
    if (item.lastmod) xml += `    <lastmod>${escapeXml(item.lastmod)}</lastmod>\n`;
    if (item.changefreq) xml += `    <changefreq>${escapeXml(item.changefreq)}</changefreq>\n`;
    if (item.priority) xml += `    <priority>${escapeXml(item.priority)}</priority>\n`;
    
    if (item.images && item.images.length > 0) {
      for (const img of item.images) {
        if (!img) continue;
        const absoluteImg = normalizeImageUrl(img, baseUrl);
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(absoluteImg)}</image:loc>\n`;
        xml += `    </image:image>\n`;
      }
    }
    xml += `  </url>\n`;
  }
  
  xml += `</urlset>`;
  
  return xml;
}

export async function gatherAllSitemapItems(baseUrl: string): Promise<SitemapItem[]> {
  let configs: any[] = [];
  try {
    configs = await db.select().from(sitemapConfigs);
  } catch (err) {
    // Graceful fallback if sitemap_configs table has not been pushed to db yet
    configs = [];
  }
  
  const getConfig = (type: string) => {
    return configs.find(c => c.contentType === type) || {
      includeInSitemap: true,
      changeFrequency: 'monthly',
      priority: '0.5',
      includeImages: true,
      includeLastModified: true
    };
  };

  const globalConfig = getConfig('global');
  if (globalConfig.includeInSitemap === false) {
    return [];
  }

  const items: SitemapItem[] = [];

  // Helper to parse seoSettings JSON
  const parseSeoSettings = (jsonStr: any) => {
    if (!jsonStr) return {};
    if (typeof jsonStr === 'string') {
      try { return JSON.parse(jsonStr); } catch (e) { return {}; }
    }
    return jsonStr;
  };

  // 1. Pages
  const pageConfig = getConfig('sitePages');
  if (pageConfig.includeInSitemap !== false) {
    try {
      const pages = await db.select().from(sitePages).where(eq(sitePages.status, 'published'));
      for (const page of pages) {
        const seo = parseSeoSettings(page.seoSettings);
        if (seo.includeInSitemap === false || seo.noIndex === true) continue;
        
        const rawSlug = (page.slug || '').trim();
        const cleanSlug = rawSlug === 'home' || rawSlug === '/' || rawSlug === '' ? '' : rawSlug.replace(/^\/+/, '');
        const rawUrl = seo.canonicalUrl || seo.customUrl;
        let url: string;
        if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
          url = rawUrl;
        } else if (rawUrl && rawUrl.startsWith('/')) {
          url = `${baseUrl.replace(/\/+$/, '')}${rawUrl}`;
        } else {
          url = cleanSlug ? `${baseUrl}/${cleanSlug}` : baseUrl;
        }
        
        items.push({
          loc: url,
          lastmod: pageConfig.includeLastModified !== false ? (seo.lastModifiedOverride || (page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])) : undefined,
          changefreq: seo.changeFrequency || pageConfig.changeFrequency || 'monthly',
          priority: seo.priority || pageConfig.priority || (cleanSlug === '' ? '1.0' : '0.8'),
          images: pageConfig.includeImages !== false && page.bannerBgImage ? [page.bannerBgImage] : []
        });
      }
    } catch (e) {
      console.warn('Sitemap sitePages fetch skipped:', e);
    }
  }

  // 2. Packages
  const pkgConfig = getConfig('packages');
  if (pkgConfig.includeInSitemap !== false) {
    try {
      const pkgs = await db.select().from(packages).where(eq(packages.status, 'available'));
      for (const pkg of pkgs) {
        const seo = parseSeoSettings(pkg.seoSettings);
        if (seo.includeInSitemap === false || seo.noIndex === true) continue;
        
        const cleanSlug = (pkg.slug || '').replace(/^\/+/, '');
        const rawPkgUrl = seo.canonicalUrl || seo.customUrl;
        let url: string;
        if (rawPkgUrl && (rawPkgUrl.startsWith('http://') || rawPkgUrl.startsWith('https://'))) {
          url = rawPkgUrl;
        } else if (rawPkgUrl && rawPkgUrl.startsWith('/')) {
          url = `${baseUrl.replace(/\/+$/, '')}${rawPkgUrl}`;
        } else {
          url = `${baseUrl}/package/${cleanSlug}`;
        }
        
        items.push({
          loc: url,
          lastmod: pkgConfig.includeLastModified !== false ? (seo.lastModifiedOverride || (pkg.updatedAt ? new Date(pkg.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])) : undefined,
          changefreq: seo.changeFrequency || pkgConfig.changeFrequency || 'weekly',
          priority: seo.priority || pkgConfig.priority || '0.9',
          images: pkgConfig.includeImages !== false && pkg.featuredImage ? [pkg.featuredImage] : []
        });
      }
    } catch (e) {
      console.warn('Sitemap packages fetch skipped:', e);
    }
  }

  // 3. Blog Posts
  const blogConfig = getConfig('blogPosts');
  if (blogConfig.includeInSitemap !== false) {
    try {
      const posts = await db.select().from(blogPosts).where(eq(blogPosts.isPublished, true));
      for (const post of posts) {
        const seo = parseSeoSettings(post.seoSettings);
        if (seo.includeInSitemap === false || seo.noIndex === true) continue;
        
        const rawUrl = seo.canonicalUrl || seo.customUrl;
        let url: string;
        if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
          url = rawUrl;
        } else if (rawUrl && rawUrl.startsWith('/')) {
          url = `${baseUrl.replace(/\/+$/, '')}${rawUrl}`;
        } else {
          url = `${baseUrl}/blog/${post.slug}`;
        }
        
        items.push({
          loc: url,
          lastmod: blogConfig.includeLastModified !== false ? (seo.lastModifiedOverride || (post.updatedAt ? new Date(post.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])) : undefined,
          changefreq: seo.changeFrequency || blogConfig.changeFrequency || 'weekly',
          priority: seo.priority || blogConfig.priority || '0.7',
          images: blogConfig.includeImages !== false && post.featuredImage ? [post.featuredImage] : []
        });
      }
    } catch (e) {
      console.warn('Sitemap blogPosts fetch skipped:', e);
    }
  }

  // 4. Visa Services
  const visaConfig = getConfig('visaServices');
  if (visaConfig.includeInSitemap !== false) {
    try {
      const visas = await db
        .select({
          id: visaServices.id,
          slug: visaServices.slug,
          isPublished: visaServices.isPublished,
          createdAt: visaServices.createdAt,
        })
        .from(visaServices)
        .where(eq(visaServices.isPublished, true));

      for (const visa of visas) {
        if (!visa.slug) continue;
        const cleanSlug = (visa.slug || '').replace(/^\/+/, '');
        const url = `${baseUrl}/saudi-visa`;
        
        items.push({
          loc: url,
          lastmod: visaConfig.includeLastModified !== false ? (visa.createdAt ? new Date(visa.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) : undefined,
          changefreq: visaConfig.changeFrequency || 'monthly',
          priority: visaConfig.priority || '0.6',
        });
      }
    } catch (e) {
      console.warn('Sitemap visaServices fetch skipped:', e);
    }
  }

  return items;
}
