'use client';

import { useEffect } from 'react';

interface PageSeoHeadProps {
  pageTitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImageUrl?: string;
  jsonLdPayload?: string;
  noIndex?: boolean;
  seoData?: any;
}

export default function PageSeoHead({
  pageTitle,
  metaTitle,
  metaDescription,
  canonicalUrl,
  ogImageUrl,
  jsonLdPayload,
  noIndex,
  seoData,
}: PageSeoHeadProps) {
  /**
   * PRIORITY ORDER ENFORCEMENT:
   * 1. Priority 1: Custom Dynamic SEO Page Settings from DB (metaTitle / metaDescription)
   * 2. Priority 2: Dynamic Page Title / Details from Page Content
   * 3. Priority 3: Fallback ONLY if Dynamic data is not fetched or empty
   */

  // Determine Title according to strict Priority Order
  let finalTitle = metaTitle || seoData?.metaTitle;

  if (!finalTitle && pageTitle) {
    // Priority 2: Use Dynamic Page Title directly
    finalTitle = pageTitle.includes('King Travel') ? pageTitle : `${pageTitle} | King Travel UK`;
  }

  if (!finalTitle) {
    // Priority 3: Fallback ONLY if no dynamic title exists
    finalTitle = 'King Travel UK';
  }

  // Determine Meta Description according to strict Priority Order
  let finalDescription = metaDescription || seoData?.metaDescription;

  if (!finalDescription) {
    // Priority 3: Fallback description ONLY if dynamic SEO description is missing
    finalDescription = 'Licensed Hajj & Umrah pilgrimage operator in UK offering 5-star packages, visa consultation, and direct flights.';
  }

  const finalCanonicalUrl = canonicalUrl || seoData?.canonicalUrl || 'https://kingtravelcan.com';
  const finalOgImageUrl = ogImageUrl || seoData?.ogImageUrl || 'https://media.kingtravelcan.com/uploads/branding/logo.png';
  const finalJsonLdPayload = jsonLdPayload || seoData?.jsonLdPayload;
  const finalNoIndex = noIndex ?? seoData?.noIndex ?? false;

  // Real-time Browser Tab & View-Source Title sync
  useEffect(() => {
    if (finalTitle) {
      document.title = finalTitle;
    }
  }, [finalTitle]);

  return (
    <>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalCanonicalUrl && <link rel="canonical" href={finalCanonicalUrl} />}

      {/* Open Graph Metadata */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImageUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={finalCanonicalUrl} />

      {/* Twitter Cards Metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalOgImageUrl} />

      {/* Robots Indexing Directive */}
      {finalNoIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* JSON-LD Knowledge Graph Schema */}
      {finalJsonLdPayload && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: finalJsonLdPayload }}
        />
      )}
    </>
  );
}
