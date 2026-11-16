'use client';

export interface BannerLogoData {
  image?: string;
  alt?: string;
}

/**
 * A page-builder section that is visually rendered inside the shared page banner.
 * Keeping it as section data lets an individual page opt into a banner logo
 * without adding page-specific fields to every CMS page.
 */
export default function BannerLogoSection({ data }: { data?: BannerLogoData | null }) {
  const image = typeof data?.image === 'string' ? data.image.trim() : '';
  if (!image) return null;

  return (
    <div className="mt-8 text-center min-w-[220px] rounded-2xl bg-white p-5 shadow-xl backdrop-blur-md md:mt-0 md:absolute md:top-1/2 md:right-4 md:-translate-y-1/2">
      {/* Logos may be uploaded as SVG, PNG or WebP and can come from the CMS media host. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image}
        alt={typeof data?.alt === 'string' ? data.alt : ''}
        className="mx-auto h-auto max-h-[90px] max-w-full object-contain"
      />
    </div>
  );
}
