'use server';

import { db } from '@/db';
import { sitePages, siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { getResponsiveEmailTemplateHtml } from '@/lib/emailTemplate';
import { logAdminActivityAction } from '@/actions/activityActions';

// Cached reads go stale after this long (seconds) and refetch in the background.
// Saves from the admin also bust these instantly via revalidateTag(), so content
// updates show up right away - this just avoids hitting the DB (a full network
// round trip) on every single page load, which is what was making the header
// and footer render before the actual page content.
const CONTENT_CACHE_SECONDS = 300;

function safeJsonParse<T>(jsonStr: any, fallback: T): T {
  if (!jsonStr || typeof jsonStr !== 'string') return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch (err) {
    console.warn('safeJsonParse fallback applied:', err);
    return fallback;
  }
}

export async function getPagesList() {
  try {
    let pages = await db.select().from(sitePages);

    // Apply stored reordering sequence if available
    try {
      const orderSetting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ordered_pages')).limit(1);
      const orderIds: number[] = orderSetting && orderSetting.length > 0 ? safeJsonParse(orderSetting[0].value, []) : [];

      if (orderIds && orderIds.length > 0) {
        const orderMap = new Map(orderIds.map((id, index) => [id, index]));
        pages.sort((a, b) => {
          const orderA = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : 999;
          const orderB = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : 999;
          return orderA - orderB;
        });
      }
    } catch (orderErr) {
      console.warn('Page order sorting failed:', orderErr);
    }

    return pages;
  } catch (err) {
    console.error('getPagesList DB query failed:', err);
    throw new Error('Failed to fetch pages from database');
  }
}

export async function getPageById(id: number) {
  try {
    const pages = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
    if (pages && pages.length > 0) {
      const p = pages[0];
      const seoData = p.seoSettings ? safeJsonParse(p.seoSettings, null) : null;
      return { ...p, seoData };
    }
  } catch (err) {
    console.error('getPageById DB query failed:', err);
  }
  return null;
}

async function fetchPageBySlugFromDb(slug: string) {
  const pages = await db.select().from(sitePages).where(eq(sitePages.slug, slug)).limit(1);
  if (pages && pages.length > 0) {
    const p = pages[0];
    const seoData = p.seoSettings ? safeJsonParse(p.seoSettings, null) : null;
    return { ...p, seoData };
  }
  return null;
}

export async function getPageBySlug(slug: string) {
  try {
    const getCachedPage = unstable_cache(
      () => fetchPageBySlugFromDb(slug),
      ['page-by-slug', slug],
      { tags: ['pages', `page-slug-${slug}`], revalidate: CONTENT_CACHE_SECONDS }
    );
    return await getCachedPage();
  } catch (err) {
    console.error('getPageBySlug DB query failed:', err);
  }
  return null;
}

export async function savePageAction(formData: FormData) {
  const id = formData.get('id') ? Number(formData.get('id')) : null;
  const title = String(formData.get('title') || 'Untitled Page');
  const slug = String(formData.get('slug') || '/');
  const status = (String(formData.get('status')) === 'draft' ? 'draft' : 'published') as 'published' | 'draft';
  const showInMenu = formData.get('showInMenu') === 'on' || formData.get('showInMenu') === 'true';
  const parentPage = formData.get('parentPage') ? String(formData.get('parentPage')) : null;
  const sections = formData.get('sections') ? String(formData.get('sections')) : null;
  const richText = formData.get('richText') ? String(formData.get('richText')) : null;
  const metaTitle = formData.get('metaTitle') ? String(formData.get('metaTitle')) : null;
  const metaDescription = formData.get('metaDescription') ? String(formData.get('metaDescription')) : null;

  const bannerBgImage = formData.get('bannerBgImage') ? String(formData.get('bannerBgImage')) : null;
  const bannerPosition = formData.get('bannerPosition') ? String(formData.get('bannerPosition')) : 'center center';
  const bannerSize = formData.get('bannerSize') ? String(formData.get('bannerSize')) : 'cover';
  const bannerTitle = formData.get('bannerTitle') as string;
  const bannerDescription = formData.get('bannerDescription') as string;
  const seoSettings = formData.get('seoSettings') as string;

  try {
    let savedId = id;
    if (id) {
      await db.update(sitePages).set({
        title,
        slug,
        status,
        showInMenu,
        parentPage: parentPage || null,
        bannerBgImage,
        bannerPosition,
        bannerSize,
        bannerTitle,
        bannerDescription,
        sections: sections || null,
        richText: richText || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        seoSettings: seoSettings ? JSON.parse(seoSettings) : null,
        updatedAt: new Date(),
      }).where(eq(sitePages.id, id));
    } else {
      const inserted = await db.insert(sitePages).values({
        title,
        slug,
        status,
        showInMenu,
        parentPage: parentPage || null,
        bannerBgImage,
        bannerPosition,
        bannerSize,
        bannerTitle,
        bannerDescription,
        sections: sections || null,
        richText: richText || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        seoSettings: seoSettings ? JSON.parse(seoSettings) : null,
      }).$returningId();
      if (inserted && inserted.length > 0) {
        savedId = inserted[0].id;
      }
    }

    // Synchronize nav_items if slug or title changed
    try {
      const navRes = await db.select().from(siteSettings).where(eq(siteSettings.key, 'nav_items')).limit(1);
      if (navRes && navRes.length > 0) {
        let navItems = safeJsonParse(navRes[0].value, []);
        let updatedNav = false;
        const syncItem = (item: any) => {
          if ((savedId && String(item.id) === String(savedId)) || item.label === title || item.url === slug) {
            item.url = slug;
            item.label = title;
            updatedNav = true;
          }
          if (item.children && Array.isArray(item.children)) {
            item.children.forEach(syncItem);
          }
        };
        navItems.forEach(syncItem);
        if (updatedNav) {
          await db.update(siteSettings).set({ value: JSON.stringify(navItems), updatedAt: new Date() }).where(eq(siteSettings.key, 'nav_items'));
        }
      }
    } catch (e) {
      console.error('Failed to sync nav_items on savePageAction:', e);
    }

    // Log Activity
    await logAdminActivityAction({
      type: 'pages',
      action: id ? 'Updated CMS Page' : 'Created CMS Page',
      details: `Page "${title}" (${slug}) - Status: ${status}`,
    });

    revalidatePath('/admin/pages');
    revalidatePath(slug);
    revalidatePath('/', 'layout');
    revalidateTag('pages', 'max');
    revalidateTag(`page-slug-${slug}`, 'max');
    return { success: true, pageId: savedId, error: undefined };
  } catch (err: any) {
    console.error('savePageAction DB query failed:', err);
    return { success: false, error: err.message || 'Failed to save page' };
  }
}

export async function getDefaultNavItems() {
  return [
    {
      id: '1',
      label: 'About Us',
      url: '/about',
      level: 1,
      children: [
        { id: '2-1', label: 'Licenses', url: '/about#licenses', level: 2 },
      ],
    },
    { id: '2', label: 'Umrah Packages', url: '/umrah-packages', level: 1, children: [] },
    { id: '3', label: 'Hajj Packages', url: '/hajj-packages', level: 1, children: [] },
    { id: '4', label: 'Saudi Visa', url: '/saudi-visa', level: 1, children: [] },
    { id: '5', label: 'Flights', url: '/airlines', level: 1, children: [] },
    { id: '6', label: 'Contact', url: '/contact', level: 1, children: [] },
  ];
}

async function fetchNavItemsFromDb() {
  const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'nav_items')).limit(1);
  if (res && res.length > 0) {
    return safeJsonParse(res[0].value, await getDefaultNavItems());
  }
  return await getDefaultNavItems();
}

export async function getNavItems() {
  try {
    const getCachedNavItems = unstable_cache(
      fetchNavItemsFromDb,
      ['nav-items'],
      { tags: ['nav-items'], revalidate: CONTENT_CACHE_SECONDS }
    );
    return await getCachedNavItems();
  } catch (err) {
    console.error('getNavItems DB query failed:', err);
  }
  return getDefaultNavItems();
}

export async function saveNavItemsAction(navItems: any[]) {
  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'nav_items')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: JSON.stringify(navItems), updatedAt: new Date() }).where(eq(siteSettings.key, 'nav_items'));
    } else {
      await db.insert(siteSettings).values({ key: 'nav_items', value: JSON.stringify(navItems) });
    }
    // Log Activity
    await logAdminActivityAction({
      type: 'menus',
      action: 'Updated Navigation Menus',
      details: `Header navigation menu saved (${navItems.length} top-level items)`,
    });

    revalidatePath('/', 'layout');
    revalidateTag('nav-items', 'max');
    return { success: true };
  } catch (err: any) {
    console.error('saveNavItemsAction DB query failed:', err);
    return { success: false, error: err.message };
  }
}

export async function getDefaultFooterData() {
  return {
    logo: '/img/logo-footer.png',
    tagline: 'A licensed Canadian agency dedicated to Hajj & Umrah travel — trusted, certified, and built for pilgrims.',
    socialLinks: [
      { name: 'Facebook', url: 'https://www.facebook.com/kingtravelcan', icon: '/img/fb.svg', openInNewTab: true },
      { name: 'Instagram', url: 'https://www.instagram.com/kingtravelcan/', icon: '/img/insta.svg', openInNewTab: true },
      { name: 'LinkedIn', url: 'https://ca.linkedin.com/company/kingtravelcan', icon: '/img/in.svg', openInNewTab: true },
      { name: 'TikTok', url: 'https://www.tiktok.com/@kingtravelcan', icon: '/img/tik.svg', openInNewTab: true },
      { name: 'X (Twitter)', url: 'https://twitter.com/kingtravelcan', icon: '/img/x.svg', openInNewTab: true },
      { name: 'Pinterest', url: 'https://pinterest.com/kingtravelcan', icon: '/img/pinterest.svg', openInNewTab: true },
    ],
    trustBadges: [
      { name: 'ACTA', icon: '/img/acta.svg' },
      { name: 'ATAC', icon: '/img/atac.svg' },
      { name: 'TICO', icon: '/img/tico.svg' },
      { name: 'IATA', icon: '/img/iata.svg' },
      { name: 'ASTA', icon: '/img/asta.svg' },
    ],
    servicesTitle: 'SERVICES',
    servicesLinks: [
      { label: 'Umrah Packages', url: '/umrah-packages' },
      { label: 'Hajj Packages', url: '/hajj-packages' },
      { label: 'Airline Tickets', url: '/airlines' },
      { label: 'Saudi Visa Services', url: '/saudi-visa' },
    ],
    sitemapTitle: 'SITEMAP',
    sitemapLinks: [
      { label: 'About Us', url: '/about' },
      { label: 'Packages', url: '/umrah-packages' },
      { label: 'Contact', url: '/contact' },
      { label: 'Terms of Use', url: '#' },
    ],
    supportTitle: '24/7 CUSTOMER SUPPORT',
    supportItems: [
      { text: '24/7 customer support', url: '', openInNewTab: false },
      { text: '+1800-844-5464', url: 'tel:+18008445464', openInNewTab: false },
      { text: '+1905-624-8555', url: 'tel:+19056248555', openInNewTab: false },
      { text: '+1905-624-8344', url: 'tel:+19056248344', openInNewTab: false },
      { text: 'saudivisa@kingtravelcan.com', url: 'mailto:saudivisa@kingtravelcan.com', openInNewTab: false },
      { text: 'Mon–Sat, 9am – 7pm EST', url: '', openInNewTab: false },
    ],
    copyrightText: '© 2026 King Travel Can LTD. All Rights Reserved.',
    developerText: 'Design & Developed by DKS',
    developerUrl: 'https://www.dks.com.pk',
  };
}

let footerMemoryCache: any = null;

async function fetchFooterDataFromDb() {
  const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'footer_settings')).limit(1);
  if (res && res.length > 0) {
    return safeJsonParse(res[0].value, footerMemoryCache || await getDefaultFooterData());
  }
  return footerMemoryCache || await getDefaultFooterData();
}

export async function getFooterData() {
  try {
    const getCachedFooterData = unstable_cache(
      fetchFooterDataFromDb,
      ['footer-data'],
      { tags: ['footer-data'], revalidate: CONTENT_CACHE_SECONDS }
    );
    return await getCachedFooterData();
  } catch (err) {
    console.error('getFooterData DB query failed:', err);
  }
  return footerMemoryCache || getDefaultFooterData();
}

export async function saveFooterSettingsAction(footerData: any) {
  try {
    footerMemoryCache = footerData;
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'footer_settings')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: JSON.stringify(footerData), updatedAt: new Date() }).where(eq(siteSettings.key, 'footer_settings'));
    } else {
      await db.insert(siteSettings).values({ key: 'footer_settings', value: JSON.stringify(footerData) });
    }
    // Log Activity
    await logAdminActivityAction({
      type: 'settings',
      action: 'Updated Footer Settings',
      details: 'Footer configuration and columns updated',
    });

    revalidatePath('/', 'layout');
    revalidateTag('footer-data', 'max');
    return { success: true };
  } catch (err: any) {
    console.warn('saveFooterSettingsAction DB insert failed, fallback to memory cache:', err);
    footerMemoryCache = footerData;
    revalidatePath('/', 'layout');
    revalidateTag('footer-data', 'max');
    return { success: true, warning: 'Saved to session cache.' };
  }
}

export async function deletePageAction(id: number) {
  try {
    const pages = await db.select().from(sitePages).where(eq(sitePages.id, id)).limit(1);
    if (pages && pages.length > 0) {
      const pageTitle = pages[0].title || `ID #${id}`;
      await db.delete(sitePages).where(eq(sitePages.id, id));

      // Log Activity
      await logAdminActivityAction({
        type: 'pages',
        action: 'Deleted CMS Page',
        details: `Removed page: "${pageTitle}" (${pages[0].slug})`,
      });

      revalidatePath('/admin/pages');
      revalidatePath('/', 'layout');
    }
    return { success: true };
  } catch (err: any) {
    console.error('deletePageAction DB query failed:', err);
    return { success: false, error: err.message || 'Failed to delete page' };
  }
}


export async function getDefaultSiteIdentity() {
  return {
    siteName: 'King Travel Canada',
    tagline: 'Trusted Hajj & Umrah Pilgrimage Travel Agency in Canada',
    logo: '/img/logo.png',
    logoAlt: 'King Travel Canada Logo',
    favicon: '/img/favicon.png',
    faviconAlt: 'King Travel Favicon',
  };
}

let siteIdentityMemoryCache: any = null;

async function fetchSiteIdentityFromDb() {
  const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'site_identity')).limit(1);
  if (res && res.length > 0) {
    return safeJsonParse(res[0].value, siteIdentityMemoryCache || await getDefaultSiteIdentity());
  }
  return null;
}

export async function getSiteIdentity() {
  let identityData: any = null;
  try {
    const getCachedSiteIdentity = unstable_cache(
      fetchSiteIdentityFromDb,
      ['site-identity'],
      { tags: ['site-identity'], revalidate: CONTENT_CACHE_SECONDS }
    );
    identityData = await getCachedSiteIdentity();
  } catch (err) {
    console.warn('getSiteIdentity DB query failed, using defaults or cache:', err);
  }
  if (!identityData) identityData = siteIdentityMemoryCache || await getDefaultSiteIdentity();

  if (identityData) {
    if (identityData.favicon) {
      identityData.favicon = identityData.favicon.replace(/^https?:\/\/media\.kingtravelcan\.com\/?/, '/media/');
    }
    if (identityData.logo) {
      identityData.logo = identityData.logo.replace(/^https?:\/\/media\.kingtravelcan\.com\/?/, '/media/');
    }
  }
  return identityData;
}

export async function saveSiteIdentityAction(data: any) {
  try {
    siteIdentityMemoryCache = data;
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'site_identity')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: JSON.stringify(data), updatedAt: new Date() }).where(eq(siteSettings.key, 'site_identity'));
    } else {
      await db.insert(siteSettings).values({ key: 'site_identity', value: JSON.stringify(data) });
    }
    // Log Activity
    await logAdminActivityAction({
      type: 'settings',
      action: 'Updated Site Identity',
      details: `Branding settings updated: "${data.siteName || 'Site Identity'}"`,
    });

    revalidatePath('/', 'layout');
    revalidateTag('site-identity', 'max');
    return { success: true };
  } catch (err: any) {
    console.warn('saveSiteIdentityAction DB query failed, saving to cache fallback:', err);
    siteIdentityMemoryCache = data;
    revalidatePath('/', 'layout');
    revalidateTag('site-identity', 'max');
    return { success: true, warning: 'Saved to session memory cache.' };
  }
}

export async function getDefaultShareTools() {
  return {
    enabled: true,
    iconStyle: 'rounded-square', // rounded-square | circle | flat | minimal
    iconSize: 40,
    colorScheme: 'brand-colors', // brand-colors | monochrome | custom
    gapFromEdge: 20,
    verticalPosition: 'center', // top | center | bottom
    sidebarEdge: 'right', // left | right
    showLabels: true,
    hideOnScrollDown: false,
    openBehavior: 'popup', // popup | same-tab | new-tab
    delayBeforeShowing: 0,
    excludePages: '/cart, /checkout, /private',
    urlToShare: 'current', // current | custom
    customShareUrl: '',
    utmParameters: false,
    trackClicks: true,
    gaEventName: 'share_click',
    activePlatforms: [
      { id: 'facebook', name: 'Facebook', enabled: true, color: '#1877F2' },
      { id: 'whatsapp', name: 'WhatsApp', enabled: true, color: '#25D366' },
      { id: 'x', name: 'X (Twitter)', enabled: true, color: '#000000' },
      { id: 'email', name: 'Email', enabled: true, color: '#EA4335' },
      { id: 'linkedin', name: 'LinkedIn', enabled: true, color: '#0A66C2' },
      { id: 'pinterest', name: 'Pinterest', enabled: true, color: '#E60023' },
      { id: 'telegram', name: 'Telegram', enabled: true, color: '#24A1DE' },
    ],
  };
}

let shareToolsMemoryCache: any = null;

async function fetchShareToolsFromDb() {
  const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'share_tools')).limit(1);
  if (res && res.length > 0) {
    const parsed = safeJsonParse(res[0].value, null);
    if (parsed) {
      shareToolsMemoryCache = parsed;
      return parsed;
    }
  }
  return shareToolsMemoryCache || await getDefaultShareTools();
}

export async function getShareTools() {
  try {
    const getCachedShareTools = unstable_cache(
      fetchShareToolsFromDb,
      ['share-tools'],
      { tags: ['share-tools'], revalidate: CONTENT_CACHE_SECONDS }
    );
    return await getCachedShareTools();
  } catch (err) {
    console.error('getShareTools DB query failed:', err);
  }
  return shareToolsMemoryCache || getDefaultShareTools();
}

export async function saveShareToolsAction(data: any) {
  shareToolsMemoryCache = data;
  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'share_tools')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: JSON.stringify(data), updatedAt: new Date() }).where(eq(siteSettings.key, 'share_tools'));
    } else {
      await db.insert(siteSettings).values({ key: 'share_tools', value: JSON.stringify(data) });
    }
    revalidatePath('/', 'layout');
    revalidateTag('share-tools', 'max');
    return { success: true };
  } catch (err: any) {
    console.warn('saveShareToolsAction DB query failed, saving to cache fallback:', err);
    revalidatePath('/', 'layout');
    revalidateTag('share-tools', 'max');
    return { success: true, warning: 'Saved to session memory cache.' };
  }
}

export async function getGlobalCss() {
  try {
    const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'global_css')).limit(1);
    if (res && res.length > 0) {
      return res[0].value;
    }
  } catch (err) {
    console.error('getGlobalCss DB query failed:', err);
  }
  return '';
}

export async function saveGlobalCssAction(css: string) {
  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'global_css')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: css, updatedAt: new Date() }).where(eq(siteSettings.key, 'global_css'));
    } else {
      await db.insert(siteSettings).values({ key: 'global_css', value: css });
    }
    // Log Activity
    await logAdminActivityAction({
      type: 'settings',
      action: 'Updated Global Custom CSS',
      details: 'Custom CSS style sheet updated',
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.warn('saveGlobalCssAction DB query failed:', err);
    revalidatePath('/', 'layout');
    return { success: true };
  }
}

export async function updatePageOrderAction(orderedIds: number[]) {
  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'ordered_pages')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: JSON.stringify(orderedIds), updatedAt: new Date() }).where(eq(siteSettings.key, 'ordered_pages'));
    } else {
      await db.insert(siteSettings).values({ key: 'ordered_pages', value: JSON.stringify(orderedIds) });
    }

    // Log Activity
    await logAdminActivityAction({
      type: 'pages',
      action: 'Reordered CMS Pages',
      details: `Reordered ${orderedIds.length} CMS pages sequence`,
    });

    revalidatePath('/admin/pages');
    return { success: true };
  } catch (err: any) {
    console.warn('updatePageOrderAction DB query failed:', err);
    revalidatePath('/admin/pages');
    return { success: true };
  }
}

export async function updatePageStatusAction(id: number, status: 'published' | 'draft') {
  try {
    await db.update(sitePages).set({ status, updatedAt: new Date() }).where(eq(sitePages.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'pages',
      action: 'Updated Page Status',
      details: `Page ID #${id} status changed to "${status}"`,
    });

    revalidatePath('/admin/pages');
    return { success: true };
  } catch (err: any) {
    console.error('updatePageStatusAction DB error:', err);
    return { success: false, error: err.message || 'Failed to update status' };
  }
}

let loginAuthMemoryCache: any = null;

export async function getDefaultLoginAuthSettings() {
  return {
    backgroundImage: '',
    backgroundAlt: 'Login screen background image',
    footerText: '© 2026 King Travel Can Ltd. All Rights Reserved.',
    maintenanceMode: false,
  };
}

async function fetchLoginAuthSettingsFromDb() {
  const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'login_auth_settings')).limit(1);
  if (res && res.length > 0) {
    const parsed = safeJsonParse(res[0].value, null);
    if (parsed) {
      loginAuthMemoryCache = parsed;
      return parsed;
    }
  }
  return loginAuthMemoryCache || await getDefaultLoginAuthSettings();
}

export async function getLoginAuthSettings() {
  try {
    const getCachedLoginAuthSettings = unstable_cache(
      fetchLoginAuthSettingsFromDb,
      ['login-auth-settings'],
      { tags: ['login-auth-settings'], revalidate: CONTENT_CACHE_SECONDS }
    );
    return await getCachedLoginAuthSettings();
  } catch (err) {
    console.warn('getLoginAuthSettings DB query failed, using defaults or cache:', err);
  }
  return loginAuthMemoryCache || getDefaultLoginAuthSettings();
}

export async function saveLoginAuthSettingsAction(data: any) {
  loginAuthMemoryCache = data;
  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'login_auth_settings')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: JSON.stringify(data), updatedAt: new Date() }).where(eq(siteSettings.key, 'login_auth_settings'));
    } else {
      await db.insert(siteSettings).values({ key: 'login_auth_settings', value: JSON.stringify(data) });
    }
    // Log Activity
    await logAdminActivityAction({
      type: 'settings',
      action: 'Updated Security Settings',
      details: 'Login screen and security options saved',
    });

    revalidatePath('/letstravel');
    revalidatePath('/', 'layout');
    revalidateTag('login-auth-settings', 'max');
    return { success: true };
  } catch (err: any) {
    console.warn('saveLoginAuthSettingsAction DB query failed:', err);
    revalidatePath('/letstravel');
    revalidatePath('/', 'layout');
    revalidateTag('login-auth-settings', 'max');
    return { success: true };
  }
}

export interface DisclaimerSettings {
  enabled: boolean;
  image: string;
  altText?: string;
}

let disclaimerMemoryCache: any = null;

export async function getDisclaimerSettings(): Promise<DisclaimerSettings> {
  try {
    const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'disclaimer_settings')).limit(1);
    if (res && res.length > 0) {
      try {
        const parsed = JSON.parse(res[0].value);
        disclaimerMemoryCache = parsed;
        return parsed;
      } catch (parseErr) {
        console.warn('getDisclaimerSettings JSON parse error, falling back to default:', parseErr);
      }
    }
  } catch (err) {
    console.warn('getDisclaimerSettings DB query failed, falling back to default:', err);
  }
  return disclaimerMemoryCache || { enabled: false, image: '', altText: 'Disclaimer Popup Image' };
}

export async function saveDisclaimerSettingsAction(data: DisclaimerSettings) {
  disclaimerMemoryCache = data;
  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'disclaimer_settings')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: JSON.stringify(data), updatedAt: new Date() }).where(eq(siteSettings.key, 'disclaimer_settings'));
    } else {
      await db.insert(siteSettings).values({ key: 'disclaimer_settings', value: JSON.stringify(data) });
    }
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.warn('saveDisclaimerSettingsAction DB query failed:', err);
    revalidatePath('/', 'layout');
    return { success: true };
  }
}

let formsSettingsMemoryCache: any = null;

export async function clearFormsSettingsCache() {
  formsSettingsMemoryCache = null;
}

const DEFAULT_FORM_FIELDS_STATE: Record<string, Array<{ id: string; label: string; type: string; placeholder: string; required: boolean }>> = {
  quoteForm: [
    { id: '1', label: 'Your Name', type: 'text', placeholder: 'Full Name', required: true },
    { id: '2', label: 'Phone Number', type: 'tel', placeholder: '+1 905 624 8344', required: true },
    { id: '3', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
    { id: '4', label: 'Select Your Package', type: 'select', placeholder: 'Select your package choice', required: true },
    { id: '5', label: 'Departure Date', type: 'date', placeholder: 'mm/dd/yyyy', required: true },
    { id: '6', label: 'Number of Adults', type: 'number', placeholder: '1', required: true },
  ],
  packageDetailForm: [
    { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
    { id: '2', label: 'Phone Number', type: 'tel', placeholder: '+1', required: true },
    { id: '3', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
    { id: '4', label: 'Adults', type: 'select', placeholder: '1', required: true },
    { id: '5', label: 'Children', type: 'select', placeholder: '0', required: false },
    { id: '6', label: 'Infants', type: 'select', placeholder: '0', required: false },
    { id: '7', label: 'Select Start Date', type: 'date', placeholder: 'e.g. March 25, 2025', required: true },
    { id: '8', label: 'Package Type', type: 'select', placeholder: 'CAD 2,695 - Quad Occupancy', required: true },
  ],
  hajjPackageDetailForm: [
    { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
    { id: '2', label: 'Phone Number', type: 'tel', placeholder: '+1', required: true },
    { id: '3', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
    { id: '4', label: 'Adults', type: 'select', placeholder: '1', required: true },
    { id: '5', label: 'Children', type: 'select', placeholder: '0', required: false },
    { id: '6', label: 'Infants', type: 'select', placeholder: '0', required: false },
    { id: '7', label: 'Package Type', type: 'select', placeholder: 'CAD 12,995 - Quad Occupancy', required: true },
  ],
  hajjCustomizeForm: [
    { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
    { id: '2', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
    { id: '3', label: 'Phone Number', type: 'tel', placeholder: '+1 905 624 8344', required: true },
    { id: '4', label: 'Room Occupancy', type: 'select', placeholder: 'Quad / Triple / Double', required: true },
  ],
  contact: [
    { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
    { id: '2', label: 'Email Address', type: 'email', placeholder: 'name@example.com', required: true },
    { id: '3', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', required: true },
    { id: '4', label: 'Subject', type: 'text', placeholder: 'Inquiry subject', required: false },
    { id: '5', label: 'Message', type: 'textarea', placeholder: 'Write your message here...', required: true },
  ],
  packageInquiry: [
    { id: '1', label: 'Pilgrim Name', type: 'text', placeholder: 'Lead pilgrim full name', required: true },
    { id: '2', label: 'Contact Phone', type: 'tel', placeholder: '+1 (555) 000-0000', required: true },
    { id: '3', label: 'Email Address', type: 'email', placeholder: 'name@example.com', required: true },
    { id: '4', label: 'Select Package', type: 'select', placeholder: 'Select package choice', required: true },
    { id: '5', label: 'Number of Travelers', type: 'text', placeholder: 'e.g. 4 adults', required: true },
    { id: '6', label: 'Special Notes', type: 'textarea', placeholder: 'Any special requests...', required: false },
  ],
  visaConsultation: [
    { id: '1', label: 'Applicant Name', type: 'text', placeholder: 'Full passport name', required: true },
    { id: '2', label: 'Nationality', type: 'text', placeholder: 'e.g. Canadian', required: true },
    { id: '3', label: 'Passport Type', type: 'select', placeholder: 'Regular / Diplomatic', required: true },
    { id: '4', label: 'Destination', type: 'text', placeholder: 'Saudi Arabia', required: true },
    { id: '5', label: 'Phone Number', type: 'tel', placeholder: '+1 (555) 000-0000', required: true },
    { id: '6', label: 'Consultation Details', type: 'textarea', placeholder: 'Describe your visa needs...', required: false },
  ],
  flightInquiry: [
    { id: '1', label: 'Full Name (As per Passport)', type: 'text', placeholder: 'Full Name', required: true },
    { id: '2', label: 'Email Address', type: 'email', placeholder: 'example@email.com', required: true },
    { id: '3', label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 890', required: true },
    { id: '4', label: 'Departure City', type: 'text', placeholder: 'e.g. London', required: true },
    { id: '5', label: 'Destination City', type: 'text', placeholder: 'e.g. Jeddah', required: true },
    { id: '6', label: 'Travel Date', type: 'date', placeholder: 'e.g. March 10, 2025', required: true },
    { id: '7', label: 'Return Date (if round trip)', type: 'date', placeholder: 'e.g. March 20, 2025', required: false },
    { id: '8', label: 'Trip Type', type: 'select', placeholder: 'One-Way / Round Trip', required: true },
    { id: '9', label: 'Passengers', type: 'select', placeholder: '1, 2, 3...', required: true },
    { id: '10', label: 'Class', type: 'select', placeholder: 'Economy / Business / First Class', required: true },
    { id: '11', label: 'Message', type: 'richtext', placeholder: 'Special request (seat, baggage, meal preference...)', required: false },
  ],
  dropUsMessage: [
    { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
    { id: '2', label: 'Email Address', type: 'email', placeholder: 'Email Address', required: true },
    { id: '3', label: 'Phone Number', type: 'tel', placeholder: 'Phone Number', required: false },
    { id: '4', label: 'Select Package', type: 'select', placeholder: 'Select Package', required: false },
    { id: '5', label: 'Message', type: 'textarea', placeholder: 'Your Message', required: false },
  ],
  blogSidebarForm: [
    { id: '1', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
    { id: '2', label: 'Phone Number', type: 'tel', placeholder: '+1 905 624 8344', required: true },
    { id: '3', label: 'Email Address', type: 'email', placeholder: 'Email', required: true },
    { id: '4', label: 'Select Package', type: 'select', placeholder: 'Select Hajj or Umrah package', required: true },
    { id: '5', label: 'Travel Month', type: 'select', placeholder: 'Preferred travel month', required: false },
    { id: '6', label: 'Adults', type: 'select', placeholder: '1', required: true },
    { id: '7', label: 'Children', type: 'select', placeholder: '0', required: false },
  ],
};

const DEFAULT_FORMS_DATA: Record<string, any> = {
  quoteForm: {
    title: 'Homepage Hero Banner — Get a Free Quote Form',
    subtitle: 'Inline quote form embedded in the Homepage & Umrah landing page hero banner.',
    recipientEmail: 'saudivisa@kingtravelcan.com',
    successMessage: 'Thank you! Your quote request has been received.',
    enabled: true,
    buttonText: 'Submit Quote',
    fieldsCount: 6,
  },
  packageDetailForm: {
    title: 'Umrah Package Booking Form (Detail Page & Popup Modal)',
    subtitle: 'Primary booking form used across individual Umrah detail pages (/package/[slug]) and the “Book Now” popup modal.',
    recipientEmail: 'booking@kingtravelcan.com',
    successMessage: 'Your package booking request has been submitted.',
    enabled: true,
    buttonText: 'Book Package',
    fieldsCount: 8,
  },
  hajjPackageDetailForm: {
    title: 'Hajj Package Booking Form (Detail Page & Popup Modal)',
    subtitle: 'Dedicated booking form used across individual Hajj detail pages (/package/[slug]) and the “Book Now” popup modal.',
    recipientEmail: 'booking@kingtravelcan.com',
    successMessage: 'Your Hajj package booking request has been submitted.',
    enabled: true,
    buttonText: 'Book Hajj 2027',
    fieldsCount: 7,
  },
  hajjCustomizeForm: {
    title: 'Hajj Page — Customize Your Hajj Package Form',
    subtitle: 'Inline quote form on the /hajj page for custom Hajj 2027 package requests.',
    recipientEmail: 'saudivisa@kingtravelcan.com',
    successMessage: 'Thank you! Your Hajj inquiry has been received.',
    enabled: true,
    buttonText: 'Submit Hajj Inquiry',
    fieldsCount: 4,
  },
  contact: {
    title: 'Contact Page — Enquiry Form',
    subtitle: 'Primary contact form on the /contact page for general enquiries & support.',
    recipientEmail: 'saudivisa@kingtravelcan.com',
    successMessage: 'Thank you! Your message has been received. Our team will contact you shortly.',
    enabled: true,
    buttonText: 'Send Message',
    fieldsCount: 5,
  },
  packageInquiry: {
    title: 'Pilgrimage Package — Custom Inquiry Form',
    subtitle: 'Dynamic inquiry form placed on Umrah/Hajj package listing pages via Page Builder.',
    recipientEmail: 'booking@kingtravelcan.com',
    successMessage: 'Package inquiry submitted successfully! A representative will call you soon.',
    enabled: true,
    buttonText: 'Submit Package Inquiry',
    fieldsCount: 6,
  },
  visaConsultation: {
    title: 'Visa Services — Consultation Form',
    subtitle: 'Saudi eVisa & Pilgrimage visa consultation form placed via Page Builder on visa pages.',
    recipientEmail: 'visas@kingtravelcan.com',
    successMessage: 'Visa application submitted! We will process your requirements immediately.',
    enabled: true,
    buttonText: 'Submit Visa Request',
    fieldsCount: 6,
  },
  flightInquiry: {
    title: 'Flights Page — Booking Inquiry Form',
    subtitle: 'Flight quote & booking assistance form on the flights page.',
    recipientEmail: 'flights@kingtravelcan.com',
    successMessage: 'Flight request received! We will send available flight options to your email.',
    enabled: true,
    buttonText: 'Request Booking',
    fieldsCount: 11,
  },
  dropUsMessage: {
    title: 'General — Drop Us A Message Form',
    subtitle: 'General purpose contact form used across multiple pages via Page Builder.',
    recipientEmail: 'saudivisa@kingtravelcan.com',
    successMessage: 'Thank you! Your message has been received.',
    enabled: true,
    buttonText: 'Send Enquiry',
    fieldsCount: 5,
  },
  blogSidebarForm: {
    title: 'Blog Detail Page — Sidebar Booking Form',
    subtitle: 'Sticky sidebar booking widget shown on every blog/article detail page.',
    recipientEmail: 'booking@kingtravelcan.com',
    successMessage: 'Your booking inquiry has been submitted.',
    enabled: true,
    buttonText: 'Book Your Trip',
    fieldsCount: 7,
  },
};

const DEFAULT_EMAIL_CONFIGS: any = {
  sendToEmail: 'saudivisa@kingtravelcan.com',
  emailSubjectLine: 'New Pilgrimage Form Submission',
  fromName: 'King Travel Canada',
  fromEmail: 'no-reply@kingtravelcan.com',
  replyTo: 'no-reply@kingtravelcan.com',
  successHeading: 'Message Sent Successfully!',
  successDescription: 'Thank you for contacting King Travel Canada. We will respond within 24 hours.',
  formRoutes: {},
  formCcRoutes: {},
  formBccRoutes: {},
  formRoutingRules: [
    { id: 'rule_1', forms: ['quoteForm', 'hajjCustomizeForm', 'contact', 'dropUsMessage'], sendTo: 'saudivisa@kingtravelcan.com', cc: '', bcc: '' },
    { id: 'rule_2', forms: ['packageDetailForm', 'hajjPackageDetailForm', 'packageInquiry', 'blogSidebarForm'], sendTo: 'booking@kingtravelcan.com', cc: '', bcc: '' },
    { id: 'rule_3', forms: ['visaConsultation'], sendTo: 'visas@kingtravelcan.com', cc: '', bcc: '' },
    { id: 'rule_4', forms: ['flightInquiry'], sendTo: 'flights@kingtravelcan.com', cc: '', bcc: '' },
  ],
};

export async function getFormsSettings() {
  if (formsSettingsMemoryCache) return formsSettingsMemoryCache;
  try {
    const setting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'forms_settings')).limit(1);
    if (setting && setting.length > 0) {
      const parsed: any = safeJsonParse(setting[0].value, null);
      if (parsed) {
        // Deep merge saved DB settings with comprehensive defaults so newly added forms/fields are never lost
        const mergedFormsData = { ...DEFAULT_FORMS_DATA, ...(parsed.formsData || (parsed.quoteForm ? parsed : {})) };
        const mergedFormFieldsState = { ...DEFAULT_FORM_FIELDS_STATE, ...(parsed.formFieldsState || {}) };
        
        // Ensure every form in formsData has non-empty field state if available in default
        Object.keys(DEFAULT_FORM_FIELDS_STATE).forEach((k) => {
          if (!mergedFormFieldsState[k] || mergedFormFieldsState[k].length === 0) {
            mergedFormFieldsState[k] = DEFAULT_FORM_FIELDS_STATE[k];
          }
        });

        const rawRules = parsed.emailConfigs?.formRoutingRules || DEFAULT_EMAIL_CONFIGS.formRoutingRules;
        const normalizedRules = (rawRules || []).map((r: any) => ({
          id: r.id || `rule_${Date.now()}`,
          forms: r.forms || [],
          sendTo: r.sendTo || '',
          cc: r.cc || '',
          bcc: r.bcc || '',
        }));

        const mergedEmailConfigs = {
          ...DEFAULT_EMAIL_CONFIGS,
          ...(parsed.emailConfigs || {}),
          formRoutingRules: normalizedRules,
        };

        const result = {
          formsData: mergedFormsData,
          formFieldsState: mergedFormFieldsState,
          emailConfigs: mergedEmailConfigs,
          emailTemplateHtml: parsed.emailTemplateHtml || getResponsiveEmailTemplateHtml('Sample Form Submission', {
            fullName: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 905-624-8555',
            packageType: 'Deluxe Hajj Package 2027',
            departureDate: 'Flexible 2027',
            message: 'Looking for quad occupancy options and flight schedules from Toronto.',
          }),
        };

        formsSettingsMemoryCache = result;
        return result;
      }
    }
  } catch (err) {
    console.warn('getFormsSettings DB query failed, using defaults or cache:', err);
  }

  const defaultResult = {
    formsData: DEFAULT_FORMS_DATA,
    formFieldsState: DEFAULT_FORM_FIELDS_STATE,
    emailConfigs: DEFAULT_EMAIL_CONFIGS,
    emailTemplateHtml: getResponsiveEmailTemplateHtml('Sample Form Submission', {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 905-624-8555',
      packageType: 'Deluxe Hajj Package 2027',
      departureDate: 'Flexible 2027',
      message: 'Looking for quad occupancy options and flight schedules from Toronto.',
    }),
  };

  return formsSettingsMemoryCache || defaultResult;
}

export async function saveFormsSettingsAction(settingsData: any) {
  formsSettingsMemoryCache = settingsData;
  try {
    const json = JSON.stringify(settingsData);
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'forms_settings')).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: json, updatedAt: new Date() }).where(eq(siteSettings.key, 'forms_settings'));
    } else {
      await db.insert(siteSettings).values({ key: 'forms_settings', value: json });
    }
    // Log Activity
    await logAdminActivityAction({
      type: 'settings',
      action: 'Updated Form Settings',
      details: 'CRM enquiry & booking form endpoints and templates saved',
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err: any) {
    console.warn('saveFormsSettingsAction DB query failed, saving to cache fallback:', err);
    formsSettingsMemoryCache = settingsData;
    revalidatePath('/', 'layout');
    return { success: true, warning: 'Saved to session memory cache.' };
  }
}

export async function slugifyPackageTitle(title: string): Promise<string> {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function getPackageDetailsAction(packageSlug: string) {
  try {
    if (!packageSlug) return null;
    const cleanSlug = packageSlug.toLowerCase().trim();
    const getCachedPackageDetails = unstable_cache(
      async () => {
        const pages = await getPagesList();
        for (const page of pages) {
          if (page.sections) {
            let parsedSections: any[] = [];
            try {
              parsedSections = typeof page.sections === 'string' ? JSON.parse(page.sections) : page.sections;
            } catch (e) { }

            if (Array.isArray(parsedSections)) {
              for (const sec of parsedSections) {
                if (sec.data?.items && Array.isArray(sec.data.items)) {
                  for (const item of sec.data.items) {
                    const itemSlug = await slugifyPackageTitle(item.title || '');
                    const itemId = String(item.id || '').toLowerCase();
                    if (itemSlug === cleanSlug || itemId === cleanSlug || itemSlug.includes(cleanSlug)) {
                      return item;
                    }
                  }
                }
              }
            }
          }
        }
        return null;
      },
      ['package-details', cleanSlug],
      { tags: ['pages', `package-details-${cleanSlug}`], revalidate: CONTENT_CACHE_SECONDS }
    );
    return await getCachedPackageDetails();
  } catch (err: any) {
    console.error('getPackageDetailsAction failed:', err);
    return null;
  }
}

export async function savePageSeoAction(pageId: number | string, seoData: any) {
  try {
    const key = `page_seo_${pageId}`;
    const value = JSON.stringify(seoData);

    const numId = typeof pageId === 'number' ? pageId : parseInt(String(pageId), 10);
    // Save to sitePages metaTitle and metaDescription if numeric
    if (!isNaN(numId) && numId > 0) {
      await db.update(sitePages).set({
        metaTitle: seoData.metaTitle || null,
        metaDescription: seoData.metaDescription || null,
        updatedAt: new Date(),
      }).where(eq(sitePages.id, numId));
    }

    // Save full JSON payload to siteSettings
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, key));
    } else {
      await db.insert(siteSettings).values({ key, value });
    }

    // Log Activity
    await logAdminActivityAction({
      type: 'pages',
      action: 'Updated Page SEO',
      details: `SEO metadata updated for page ID #${pageId}`,
    });

    revalidatePath('/admin/pages');
    revalidatePath('/admin/dashboard');
    revalidateTag('page-seo', 'max');
    revalidateTag(`page-seo-${pageId}`, 'max');
    return { success: true };
  } catch (err: any) {
    console.error('savePageSeoAction error:', err);
    return { success: false, error: err.message };
  }
}

export async function getPageSeoAction(pageId: number | string) {
  try {
    const key = `page_seo_${pageId}`;
    const getCachedPageSeo = unstable_cache(
      async () => {
        const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, key)).limit(1);
        if (rows && rows.length > 0) {
          return safeJsonParse(rows[0].value, null);
        }
        return null;
      },
      ['page-seo', String(pageId)],
      { tags: ['page-seo', `page-seo-${pageId}`], revalidate: CONTENT_CACHE_SECONDS }
    );
    return await getCachedPageSeo();
  } catch (err) {
    return null;
  }
}

export async function getDefaultSeoIntelligence() {
  return {
    siteIndexingEnabled: true,
    canonicalSiteUrl: '',
    additionalDisallowPaths: [] as string[],
    googleSearchConsoleCode: '',
    googleAnalyticsId: '',
    googleAnalyticsEnabled: true,
    sitemapLastGenerated: null,
    sitemapTotalUrls: 0,
  };
}

let seoIntelligenceMemoryCache: any = null;

async function fetchSeoIntelligenceFromDb() {
  try {
    const res = await db.select().from(siteSettings).where(eq(siteSettings.key, 'seo_intelligence')).limit(1);
    if (res && res.length > 0 && res[0].value) {
      const parsed: any = safeJsonParse(res[0].value, null);
      if (parsed && typeof parsed === 'object') {
        const defaults = await getDefaultSeoIntelligence();
        return {
          ...defaults,
          ...parsed,
          siteIndexingEnabled: parsed.siteIndexingEnabled !== undefined ? Boolean(parsed.siteIndexingEnabled) : true,
        };
      }
    }
  } catch (err) {
    console.warn('fetchSeoIntelligenceFromDb error:', err);
  }
  return seoIntelligenceMemoryCache || await getDefaultSeoIntelligence();
}

export async function getSeoIntelligenceSettings() {
  let data: any = null;
  try {
    const getCached = unstable_cache(
      fetchSeoIntelligenceFromDb,
      ['seo-intelligence'],
      { tags: ['seo-intelligence'], revalidate: CONTENT_CACHE_SECONDS }
    );
    data = await getCached();
  } catch (err) {
    console.warn('getSeoIntelligenceSettings DB query failed, using defaults:', err);
  }
  if (!data) data = seoIntelligenceMemoryCache || await getDefaultSeoIntelligence();
  return data;
}

export async function saveSeoIntelligenceSettingsAction(settings: any) {
  try {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'seo_intelligence')).limit(1);
    const value = JSON.stringify(settings);
    seoIntelligenceMemoryCache = settings;

    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value, updatedAt: new Date() }).where(eq(siteSettings.key, 'seo_intelligence'));
    } else {
      await db.insert(siteSettings).values({ key: 'seo_intelligence', value });
    }

    await logAdminActivityAction({
      type: 'settings',
      action: 'Updated SEO Intelligence',
      details: 'Updated site indexing, Google Search Console, Google Analytics, and Sitemap configurations.',
    });

    revalidateTag('seo-intelligence', 'max');
    revalidatePath('/', 'layout');
    revalidatePath('/sitemap.xml');
    revalidatePath('/robots.txt');

    return { success: true };
  } catch (err: any) {
    console.error('saveSeoIntelligenceSettingsAction error:', err);
    return { success: false, error: err.message || 'Failed to save SEO Intelligence settings' };
  }
}

// -------------------------------------------------------------
// SEO Generation Action & AI Helpers (Claude / LLM pipeline)
// -------------------------------------------------------------

export interface SeoGenerationContext {
  pageTitle: string;
  pageSlug: string;
  metaDescription?: string;
  heroImageUrl?: string;
  ogImageUrl?: string;
  schemaType?: string;
  canonicalUrl?: string;
  existingContent?: Record<string, string>;
  siteContext: {
    brandName: string;
    domain: string;
    industry: string;
    logoUrl: string;
  };
}

export interface SeoSectionResult {
  success: boolean;
  data?: any;
  error?: string;
  usedFallback?: boolean;
}

function cleanAndTruncate(text: string, maxLen: number): string {
  const cleaned = (text || '').replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  const truncated = cleaned.slice(0, maxLen - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 20) {
    return `${truncated.slice(0, lastSpace)}...`;
  }
  return `${truncated}...`;
}

function stripJsonFences(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

function buildSectionPrompt(section: string, context: SeoGenerationContext): { prompt: string; maxTokens: number } {
  const { pageTitle, pageSlug, schemaType, existingContent, siteContext } = context;
  const existingStr = existingContent && Object.keys(existingContent).length > 0
    ? `\nCURRENT CONTENT TO REFINE:\n${JSON.stringify(existingContent, null, 2)}`
    : '';

  let task = '';
  let outputSchema = '';
  let maxTokens = 300;

  if (section === 'traditional') {
    maxTokens = 200;
    task = `Generate an optimal SEO Meta Title and Meta Description for this page.
RULES:
1. Meta Title: primary keyword first, brand suffix (${siteContext.brandName}) only if it fits in 60 characters total. Hard limit: MAXIMUM 60 CHARACTERS.
2. Meta Description: active voice with a clear call-to-action, highlighting 1-2 concrete differentiators (${siteContext.industry}). Hard limit: MAXIMUM 160 CHARACTERS.
3. Self-check length: title <= 60 chars, description <= 160 chars. Drop non-essential words if needed, never truncate mid-word.`;
    outputSchema = `{\n  "metaTitle": "string <= 60 chars",\n  "metaDescription": "string <= 160 chars"\n}`;
  } else if (section === 'alt') {
    maxTokens = 200;
    task = `Generate concise, accessibility-first and SEO-friendly Alt Text for the featured hero image and OpenGraph social card.
RULES:
1. Describe visible subject + purpose for screen readers and search engines (8-20 words each).
2. Avoid generic phrases like "image of" or keyword stuffing. Provide concrete visual description and page context.`;
    outputSchema = `{\n  "heroAlt": "string (8-20 words)",\n  "ogCardAlt": "string (8-20 words)"\n}`;
  } else if (section === 'geo') {
    maxTokens = 300;
    task = `Generate Generative Engine Optimization (GEO) structured summary and entity clusters for AI search engines (ChatGPT, Gemini, Perplexity).
RULES:
1. geoSummary: 2-3 self-contained factual sentences an LLM can cite verbatim. State what the page offers, who it is for, and key inclusions. No marketing fluff.
2. geoClusters: comma-separated string of 6-10 real entities/topics (brand name, service names, location, and semantically associated terms).`;
    outputSchema = `{\n  "geoSummary": "string (2-3 factual sentences)",\n  "geoClusters": "string (comma-separated 6-10 entities)"\n}`;
  } else if (section === 'aeo') {
    maxTokens = 600;
    task = `Generate at least 5 Answer Engine Optimization (AEO) Question & Answer pairs for Featured Snippets, Voice Search, and People Also Ask.
MUST COVER 5 DISTINCT INTENTS:
1. Informational: what is / what is included in ${pageTitle}
2. Pricing / Cost details
3. Booking / Application process
4. Eligibility / Requirements
5. Trust & Differentiation: why choose ${siteContext.brandName}
RULES:
- Each answer must be 35-55 words.
- Direct answer in the very first sentence without throat-clearing.
- Plain sentences only (no markdown, no bullet lists, no emojis).`;
    outputSchema = `{\n  "faqs": [\n    { "question": "string", "answer": "string (35-55 words)" }\n  ]\n}`;
  } else if (section === 'schema') {
    maxTokens = 500;
    const selectedType = schemaType || 'TravelAgency';
    task = `Generate valid, unescaped JSON-LD Schema.org structured data object matching @type "${selectedType}".
RULES:
1. Always include "@context": "https://schema.org" and "@type": "${selectedType}".
2. Required fields for ${selectedType}:
   - TravelAgency: name, description, url, telephone, address, publisher
   - Product: name, description, url, brand
   - Article: headline, description, url, author, datePublished, publisher
   - Organization: name, url, logo, address
   - WebPage: name, description, url, publisher
3. Do NOT invent fake phone numbers or addresses; only use values from siteContext or existingContent if provided.`;
    outputSchema = `Valid Schema.org JSON object directly matching @type "${selectedType}".`;
  }

  const prompt = `You are an SEO specialist generating structured content for a single web page.
Return ONLY valid JSON matching the schema below. No prose, no markdown, no code fences.

PAGE: "${pageTitle}"
SITE: ${siteContext.brandName} — ${siteContext.industry}
URL: ${siteContext.domain}${pageSlug}${existingStr}

TASK:
${task}

OUTPUT SCHEMA:
${outputSchema}`;

  return { prompt, maxTokens };
}

function getLocalTemplateFallback(section: string, context: SeoGenerationContext): any {
  const { pageTitle, pageSlug, schemaType, siteContext } = context;
  const title = (pageTitle || 'King Travel Canada').trim();
  const cleanSlug = pageSlug === '/' ? '' : pageSlug.startsWith('/') ? pageSlug : `/${pageSlug}`;

  if (section === 'traditional') {
    const brandSuffix = ` | ${siteContext.brandName}`;
    let metaTitle = `${title}${brandSuffix}`;
    if (metaTitle.length > 60) metaTitle = cleanAndTruncate(title, 60);
    const metaDescription = cleanAndTruncate(
      `Explore official ${title} packages by ${siteContext.brandName}. Verified visas, luxury hotel bookings & 24/7 customer support.`,
      160
    );
    return { metaTitle, metaDescription };
  }

  if (section === 'alt') {
    return {
      heroAlt: `Official visual illustration and hero presentation for ${title} at ${siteContext.brandName}`,
      ogCardAlt: `Official social share card banner for ${title} package offerings at ${siteContext.brandName}`,
    };
  }

  if (section === 'geo') {
    return {
      geoSummary: `${siteContext.brandName} offers full-service ${title} solutions, including verified visa processing, group packages, custom itineraries, and luxury accommodations.`,
      geoClusters: `${title}, Umrah Packages 2026, Hajj Travel, Canada Saudi Visas, Toronto Umrah Agency`,
    };
  }

  if (section === 'aeo') {
    return {
      formattedFaqs: `Q: What is included in ${title} at ${siteContext.brandName}?\nA: This package includes verified visa assistance, round-trip flight bookings, 5-star hotel accommodations in Makkah and Madinah, and reliable ground transfers with guided support throughout your journey.\n\nQ: What is the cost of ${title} packages?\nA: Package pricing varies depending on travel dates, airline choice, and room occupancy. Contact our Toronto office for an itemized and transparent quotation with zero hidden fees.\n\nQ: How can I book or apply for ${title}?\nA: You can easily reserve your spot by submitting an online inquiry on our official website, calling our customer care desk, or visiting our Toronto headquarters.\n\nQ: What are the eligibility and document requirements for ${title}?\nA: Canadian travelers require a valid passport with at least six months validity, passport-sized photographs, and required immunization records as mandated by Saudi authorities.\n\nQ: Why choose ${siteContext.brandName} for ${title}?\nA: We are an authorized and licensed pilgrimage provider offering decade-long experience, dedicated 24/7 on-ground assistance, and curated five-star hospitality for Canadian pilgrims.`,
    };
  }

  if (section === 'schema') {
    const selectedType = schemaType || 'TravelAgency';
    return {
      '@context': 'https://schema.org',
      '@type': selectedType,
      name: `${title} - ${siteContext.brandName}`,
      description: `Official ${title} travel solutions, hotel bookings, and visa services by ${siteContext.brandName}.`,
      url: `${siteContext.domain}${cleanSlug}`,
      telephone: '+1-800-KING-TRAVEL',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Toronto',
        addressRegion: 'ON',
        addressCountry: 'CA',
      },
      publisher: {
        '@type': 'Organization',
        name: siteContext.brandName,
        url: siteContext.domain,
        logo: siteContext.logoUrl,
      },
    };
  }

  return {};
}

export async function generateSeoSectionAction(
  section: 'traditional' | 'alt' | 'geo' | 'aeo' | 'schema' | 'technical',
  context: SeoGenerationContext
): Promise<SeoSectionResult> {
  if (section === 'technical') {
    const cleanSlug = context.pageSlug === '/' ? '' : context.pageSlug.startsWith('/') ? context.pageSlug : `/${context.pageSlug}`;
    return {
      success: true,
      data: {
        canonicalUrl: `${context.siteContext.domain}${cleanSlug}`,
        noIndex: false,
      },
    };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  const { prompt, maxTokens } = buildSectionPrompt(section, context);

  if (apiKey) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const userContent = attempt === 0 ? prompt : `${prompt}\n\nIMPORTANT: Return ONLY raw, valid JSON with no markdown and no code fences.`;
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: maxTokens,
            temperature: 0.4,
            messages: [{ role: 'user', content: userContent }],
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.content?.[0]?.text || '';
          const cleanedText = stripJsonFences(rawText);
          const parsed = JSON.parse(cleanedText);

          // Section-specific validation & normalization
          if (section === 'traditional') {
            return {
              success: true,
              data: {
                metaTitle: cleanAndTruncate(parsed.metaTitle || context.pageTitle, 60),
                metaDescription: cleanAndTruncate(parsed.metaDescription || '', 160),
              },
            };
          }

          if (section === 'alt') {
            return {
              success: true,
              data: {
                heroAlt: parsed.heroAlt || `Featured image for ${context.pageTitle}`,
                ogCardAlt: parsed.ogCardAlt || `Social share banner for ${context.pageTitle}`,
              },
            };
          }

          if (section === 'geo') {
            return {
              success: true,
              data: {
                geoSummary: parsed.geoSummary || '',
                geoClusters: parsed.geoClusters || '',
              },
            };
          }

          if (section === 'aeo') {
            let faqsArray: Array<{ question: string; answer: string }> = [];
            if (Array.isArray(parsed.faqs)) {
              faqsArray = parsed.faqs;
            } else if (Array.isArray(parsed)) {
              faqsArray = parsed;
            }

            if (faqsArray.length >= 3) {
              const formattedFaqs = faqsArray
                .map((f) => `Q: ${f.question.trim()}\nA: ${f.answer.trim()}`)
                .join('\n\n');
              return {
                success: true,
                data: { formattedFaqs, faqs: faqsArray },
              };
            }
          }

          if (section === 'schema') {
            if (parsed && typeof parsed === 'object' && parsed['@context']) {
              return {
                success: true,
                data: parsed,
              };
            }
          }
        }
      } catch (callErr) {
        console.warn(`generateSeoSectionAction Claude attempt ${attempt + 1} failed:`, callErr);
      }
    }
  }

  // Graceful local template fallback
  const fallbackData = getLocalTemplateFallback(section, context);
  return {
    success: true,
    data: fallbackData,
    usedFallback: true,
  };
}





