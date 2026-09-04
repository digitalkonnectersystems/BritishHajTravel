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
  getFooterData,
  getSeoIntelligenceSettings,
} from "@/actions/pageActions";
import "./globals.css";

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
  const isIndexingEnabled = seoSettings?.siteIndexingEnabled ?? true;

  return {
    title: identity?.siteName || "King Travel UK",
    description: identity?.tagline || "Licensed Hajj & Umrah pilgrimage operator in UK offering 5-star packages, visa consultation, and direct flights.",
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
  const [identity, loginAuth, navItems, footerData, seoSettings] = await Promise.all([
    getSiteIdentity(),
    getLoginAuthSettings(),
    getNavItems(),
    getFooterData(),
    getSeoIntelligenceSettings(),
  ]);
  const faviconUrl = identity?.favicon || "/img/favicon.ico";
  const initialMaintenanceMode = loginAuth?.maintenanceMode ?? false;

  const isIndexingEnabled = seoSettings?.siteIndexingEnabled ?? true;
  const gscCode = (seoSettings?.googleSearchConsoleCode || "").trim();
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
        {/* Global Robots Indexing Directive if disabled */}
        {!isIndexingEnabled && (
          <meta name="robots" content="noindex, nofollow" />
        )}

        {/* Google Search Console HTML Verification */}
        {gscCode && (
          <meta name="google-site-verification" content={gscCode} />
        )}

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
        <FrontendMaintenanceWrapper initialMaintenanceMode={initialMaintenanceMode}>
          <Header initialNavItems={navItems} initialIdentity={identity} />
          {children}
          <Footer initialFooterData={footerData} />
          <WhatsAppFloat initialIdentity={identity} />
          <FloatingShareBar />
          <RevealOnScroll />
          <DisclaimerPopupModal />
        </FrontendMaintenanceWrapper>
      </body>
    </html>
  );
}
