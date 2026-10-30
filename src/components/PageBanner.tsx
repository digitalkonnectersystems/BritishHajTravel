'use client';

import React from 'react';

interface PageBannerProps {
  title: string;
  description?: string | null;
  bgImage?: string | null;
  position?: string | null;
  size?: string | null;
  variant?: 'default' | 'saudiVisa';
  eyebrow?: string | null;
  features?: Array<{ icon?: string; first?: string; second?: string }>;
  heroSettings?: unknown;
  fallbackBgImage?: string;
  localOnly?: boolean;
}

interface PageBannerFeature {
  icon?: string;
  first?: string;
  second?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPageBannerFeature(value: unknown): value is PageBannerFeature {
  return isRecord(value);
}

const DEFAULT_BANNER_BG = ''; // No unrelated external template image when CMS has no image
const SAUDI_VISA_BANNER_BG = ''; // CMS controls the visa page banner

export default function PageBanner({
  title,
  description,
  bgImage,
  position = 'center center',
  size = 'cover',
  variant = 'default',
  eyebrow,
  features,
  heroSettings,
  fallbackBgImage,
  localOnly = false,
}: PageBannerProps) {
  const hasUsableBg = bgImage && bgImage.trim() !== '' && ((!localOnly && variant !== 'saudiVisa') || bgImage.startsWith('/images_BHT/') || bgImage.startsWith('/img/'));
  const activeBg = hasUsableBg
    ? bgImage
    : fallbackBgImage || (variant === 'saudiVisa' ? SAUDI_VISA_BANNER_BG : DEFAULT_BANNER_BG);
  const activePos = position || 'center center';
  const activeSize = size || 'cover';

  const cleanBg = activeBg.replace(/"/g, "'");
  const isInnerBanner = true;
  let parsedHeroSettings: unknown = heroSettings;
  if (typeof heroSettings === 'string') {
    try { parsedHeroSettings = JSON.parse(heroSettings); } catch { parsedHeroSettings = null; }
  }
  const heroSettingsRecord = isRecord(parsedHeroSettings) ? parsedHeroSettings : {};
  const storedHeroSettings = isRecord(heroSettingsRecord.innerHero)
    ? heroSettingsRecord.innerHero
    : isRecord(heroSettingsRecord.saudiVisaHero)
      ? heroSettingsRecord.saudiVisaHero
      : {};
  const storedEyebrow = typeof storedHeroSettings.eyebrow === 'string' ? storedHeroSettings.eyebrow : '';
  const resolvedEyebrow = eyebrow || storedEyebrow;
  const storedFeatures = Array.isArray(storedHeroSettings.features)
    ? storedHeroSettings.features.filter(isPageBannerFeature)
    : [];
  const saudiFeatures = features?.length ? features : storedFeatures;
  const showHeroSupport = storedHeroSettings.showSupport !== false &&
    (Boolean(resolvedEyebrow) || saudiFeatures.length > 0);

  return (
    <section
      style={{
        backgroundImage: isInnerBanner
          ? `linear-gradient(90deg, rgba(3, 19, 65, 0.98) 0%, rgba(3, 19, 65, 0.9) 38%, rgba(3, 19, 65, 0.22) 78%, rgba(3, 19, 65, 0.1) 100%)${cleanBg ? `, url("${cleanBg}")` : ""}`
          : `linear-gradient(rgba(2, 14, 67, 0.45), rgba(2, 14, 67, 1)), url("${cleanBg}")`,
        backgroundPosition: activePos,
        backgroundSize: activeSize,
      }}
      className={`relative text-white overflow-hidden bg-no-repeat ${isInnerBanner
        ? 'h-[150px] sm:h-[200px] xl:h-[250px] flex items-center py-2 sm:py-3 xl:py-4'
        : 'text-center py-20 !px-5 h-[420px] max-h-[420px] flex flex-col items-center justify-center'}`}
    >
      <div className={`w-full z-10 ${isInnerBanner ? 'max-w-[1400px] px-5 sm:px-10 lg:px-14' : 'mx-auto'}`}>
        {isInnerBanner && showHeroSupport && Boolean(resolvedEyebrow) && (
          <div className="mb-7 inline-flex items-center gap-3 rounded-full bg-[#173b8e] px-5 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
              <path d="M2.5 16.5 21 9l-6.5 5.5-3.5 7-2-6-6.5 1Z" />
              <path d="m9 15-4-3" />
            </svg>
            {resolvedEyebrow}
          </div>
        )}
        <h1
          className={isInnerBanner ? 'page-header-title saudi-visa-banner-title' : 'page-header-title'}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        {description && (
          <p
            className={isInnerBanner ? 'page-header-leadtxt saudi-visa-banner-copy' : 'page-header-leadtxt'}
          >
            {description}
          </p>
        )}
        {isInnerBanner && showHeroSupport && saudiFeatures.length > 0 && (
          <div className="mt-9 flex max-w-[760px] items-center gap-7 text-left max-sm:grid max-sm:grid-cols-1 max-sm:gap-4">
            {saudiFeatures.map(({ icon = 'document', first = '', second = '' }, index: number) => (
              <React.Fragment key={`${icon}-${index}`}>
                {index > 0 && <span className="h-8 w-px bg-white/25 max-sm:hidden" />}
                <div className="flex min-w-0 max-sm:flex-col max-sm:items-start items-center gap-1 sm:gap-2">
                  <span className="flex h-6 w-6 sm:h-8 sm:w-8 xl:h-9 xl:w-9 shrink-0 items-center justify-center rounded-full bg-[#12357f] text-white shadow-inner">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 sm:h-5 sm:w-5 fill-none stroke-current" strokeWidth="1.8">
                      {icon === 'document' && <><path d="M6 3h9l3 3v15H6z" /><path d="M9 10h6M9 14h6M9 18h4" /></>}
                      {icon === 'people' && <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 20c.5-3.2 2.4-5 5.5-5s5 1.8 5.5 5M14 15c3.2-.4 5.3 1.3 6 4" /></>}
                      {icon === 'shield' && <><path d="m12 3 7 3v5c0 4.5-2.8 7.7-7 10-4.2-2.3-7-5.5-7-10V6z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>}
                    </svg>
                  </span>
                  <span className="text-[9px] sm:text-xs xl:text-sm leading-tight text-white/90">{first}<br />{second}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
