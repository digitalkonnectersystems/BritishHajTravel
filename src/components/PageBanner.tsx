'use client';

import React from 'react';

interface PageBannerProps {
  title: string;
  description?: string | null;
  bgImage?: string | null;
  position?: string | null;
  size?: string | null;
}

const DEFAULT_BANNER_BG = "https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg";

export default function PageBanner({
  title,
  description,
  bgImage,
  position = 'center center',
  size = 'cover',
}: PageBannerProps) {
  const activeBg = (bgImage && bgImage.trim() !== '') ? bgImage : DEFAULT_BANNER_BG;
  const activePos = position || 'center center';
  const activeSize = size || 'cover';

  const cleanBg = activeBg.replace(/"/g, "'");

  return (
    <section
      style={{
        backgroundImage: `linear-gradient(rgba(10, 66, 45, 0.45), rgba(10, 66, 45, 1)), url("${cleanBg}")`,
        backgroundPosition: activePos,
        backgroundSize: activeSize,
      }}
      className="relative text-center text-white py-20 !px-5 overflow-hidden h-[420px] max-h-[420px] flex flex-col items-center justify-center bg-no-repeat"
    >
      <div className="mx-auto w-full z-10">
        <h1
          className="page-header-title"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {description && (
          <p
            className="page-header-leadtxt"
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
