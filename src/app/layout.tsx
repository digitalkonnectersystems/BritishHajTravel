import type { Metadata } from "next";
import { Jost, Marcellus, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import FloatingShareBar from "@/components/FloatingShareBar";
import RevealOnScroll from "@/components/RevealOnScroll";
import FrontendMaintenanceWrapper from "@/components/FrontendMaintenanceWrapper";
import DisclaimerPopupModal from "@/components/DisclaimerPopupModal";
import FaviconSync from "@/components/FaviconSync";
import FontAwesomeStylesheet from "@/components/FontAwesomeStylesheet";
import Script from "next/script";
import {
  getSiteIdentity,
  getLoginAuthSettings,
  getNavItems,
  getGalleryNavItems,
  getFooterData,
  getSeoIntelligenceSettings,
} from "@/actions/pageActions";
import { resolveCanonicalPublicOrigin, getSiteEnvironment } from '@/lib/urlResolver';
import { getHiddenSitePagePaths } from "@/lib/sitePageVisibility";
import { db } from "@/db";
import { visaProcessing } from "@/db/schema";
import { isHiddenInternalLink, removeHiddenNavigation } from "@/lib/publicPageVisibility";
import "./globals.css";
import { getCurrencyConfiguration } from "@/lib/currencyService";
import { CurrencyProvider } from "@/components/CurrencyProvider";

// The CMS navigation JSON is dynamically loaded; give it an explicit shape
// before passing it to the generic visibility filter.
type NavigationItem = {
  id: string;
  label: string;
  url: string;
  level: number;
  children: NavigationItem[];
};

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marcellus",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-jost",
  display: "swap",
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const [identity, seoSettings] = await Promise.all([
    getSiteIdentity(),
    getSeoIntelligenceSettings(),
  ]);
  const faviconUrl = identity?.favicon || "/img/favicon.png";
  const isIndexingEnabled = getSiteEnvironment(seoSettings) === 'production' && (seoSettings?.siteIndexingEnabled ?? true);

  return {
    metadataBase: new URL(resolveCanonicalPublicOrigin(seoSettings)),
    title: identity?.siteName || "British Hajj Travel UK",
    description: identity?.tagline || "",
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    robots: !isIndexingEnabled ? { index: false, follow: false } : undefined,
    verification: seoSettings?.googleSearchConsoleCode ? {
      google: seoSettings.googleSearchConsoleCode,
    } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [identity, loginAuth, navItems, galleryNavItems, footerData, seoSettings, currencySettings] = await Promise.all([
    getSiteIdentity(),
    getLoginAuthSettings(),
    getNavItems(),
    getGalleryNavItems(),
    getFooterData(),
    getSeoIntelligenceSettings(),
    getCurrencyConfiguration(),
  ]);
  const [unpublishedSitePaths, visaRecords] = await Promise.all([
    getHiddenSitePagePaths(),
    db.select({ slug: visaProcessing.slug, status: visaProcessing.status }).from(visaProcessing)
      .catch(error => { console.error('[navigation] Visa visibility query failed', error); return [] as { slug: string; status: 'draft' | 'published' }[]; }),
  ]);
  const unpublishedVisaPaths = visaRecords.filter(page => page.status !== 'published').map(page => page.slug);
  const publishedVisaPaths = visaRecords.filter(page => page.status === 'published').map(page => page.slug);
  const hiddenPaths = [...unpublishedSitePaths, ...unpublishedVisaPaths];
  // Keep configured links, but never link visitors to unpublished or missing visa CMS pages.
  const navWithDestinations = removeHiddenNavigation(navItems as NavigationItem[], hiddenPaths, publishedVisaPaths);
  // Navigation submenu links are managed in Admin > Navigation Menus.
  // Do not inject hotel-directory categories here: they duplicate the
  // manually configured Makkah/Madina hotel links in nav_items.
  const liveNavItems = navWithDestinations;
  const existingGalleryItem = liveNavItems.find((item: any) => item.id === 'galleries' || item.label?.toLowerCase() === 'gallery');
  if (galleryNavItems.length > 0 && !hiddenPaths.includes('/gallery')) {
    if (existingGalleryItem) {
      existingGalleryItem.url = '/gallery';
      existingGalleryItem.children = galleryNavItems;
    } else {
      liveNavItems.push({ id: 'galleries', label: 'Gallery', url: '/gallery', level: 1, children: galleryNavItems });
    }
  }
  const visibleFooterData = {
    ...footerData,
    servicesLinks: (footerData?.servicesLinks || []).filter((item: any) => !isHiddenInternalLink(item.url, hiddenPaths, publishedVisaPaths)),
    sitemapLinks: (footerData?.sitemapLinks || []).filter((item: any) => !isHiddenInternalLink(item.url, hiddenPaths, publishedVisaPaths)),
  };
  const faviconUrl = identity?.favicon || "/img/favicon.ico";
  const initialMaintenanceMode = loginAuth?.maintenanceMode ?? false;
  const initialMaintenanceScope = loginAuth?.maintenanceScope === 'selected_pages' ? 'selected_pages' : 'entire_site';
  const initialMaintenancePaths = Array.isArray(loginAuth?.maintenancePaths) ? loginAuth.maintenancePaths : [];

  const gaId = (seoSettings?.googleAnalyticsId || "").trim();
  const isGaActive = (seoSettings?.googleAnalyticsEnabled ?? true) && gaId.length > 0;

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${marcellus.variable} ${plusJakartaSans.variable} ${poppins.variable} ${jost.variable}`}
    >
      <head>
        <link rel="icon" href={faviconUrl} />
        <link rel="shortcut icon" href={faviconUrl} />
        <link rel="apple-touch-icon" href={faviconUrl} />
        <FontAwesomeStylesheet />
        {/* Google Analytics 4 (GA4) Tracking Script */}
        {isGaActive && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>

      <body suppressHydrationWarning>
        <FaviconSync faviconUrl={faviconUrl} />
        <CurrencyProvider initial={currencySettings}>
        <FrontendMaintenanceWrapper initialMaintenanceMode={initialMaintenanceMode} initialMaintenanceScope={initialMaintenanceScope} initialMaintenancePaths={initialMaintenancePaths}>
          <Header initialNavItems={liveNavItems} initialIdentity={identity} />
          {children}
          <Footer initialFooterData={visibleFooterData} />
          <WhatsAppFloat initialIdentity={identity} />
          <FloatingShareBar />
          <RevealOnScroll />
          <DisclaimerPopupModal />
        </FrontendMaintenanceWrapper>
        </CurrencyProvider>
      </body>
    </html>
  );
}
