"use client";

import HajjLandscapeCard from "@/components/HajjLandscapeCard";
import HajjPackagePager from "@/components/HajjPackagePager";
import { isAccommodationVisible, isPackageCardVisible } from "@/lib/packageCardVisibility";
import { isTbcPrice } from "@/lib/priceDisplay";
import { useCurrency } from "@/components/CurrencyProvider";
import PageBanner from "@/components/PageBanner";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import DynamicIcon from "@/components/ui/DynamicIcon";

export default function HajjPackagesPageClient({ initialPageData, packages = [] }: { initialPageData?: any, packages?: any[] }) {
  const currencySettings = useCurrency();
  const pageData = initialPageData || null;
  let orderedSections: any[] = [];
  try { const raw = typeof pageData?.sections === 'string' ? JSON.parse(pageData.sections) : pageData?.sections; orderedSections = Array.isArray(raw) ? raw : []; } catch {}
  const sectionOrder = (types: string[], fallback: number) => {
    const i = orderedSections.findIndex((section: any) => types.includes(section.type));
    return i >= 0 ? i * 10 + 10 : fallback;
  };
  return (
    <div className="hajj-page-wrapper flex flex-col" suppressHydrationWarning>
      {/* ================= DYNAMIC HERO BANNER ================= */}
      <div style={{ order: -100 }}>
      <PageBanner
        title={
          pageData?.bannerTitle ||
          pageData?.title ||
          "Hajj Packages from UK 2027 <br /><span>Travel with Confidence</span> by British Hajj Travel"
        }
        description={
          pageData?.bannerDescription ||
          "Perform your sacred obligation of Hajj in 2027 with comfort, organization, and spiritual focus. British Hajj Travel proudly offers premium Hajj Packages from UK 2027, designed to provide British Muslims with a smooth and well-managed pilgrimage experience."
        }
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
        heroSettings={pageData?.seoSettings}
      />
      </div>

      {(() => {
        const section = (() => {
          try {
            const rows = typeof pageData?.sections === 'string' ? JSON.parse(pageData.sections) : pageData?.sections;
            return Array.isArray(rows) ? rows.find((row: any) => ['Accreditations Bar','Badges Cards'].includes(row?.type)) : null;
          } catch { return null; }
        })();
        const badges = Array.isArray(section?.data?.items) ? section.data.items.filter((row: any) => row?.title) : [];
        return badges.length ? <div className="badges-overlap-container" style={{ order: sectionOrder(['Accreditations Bar','Badges Cards'], 0) }}><div className="badge-grid">
          {badges.map((row: any, i: number) => <div className="badge-card" key={i}>
            <div className="badge-icon-wrap"><DynamicIcon name={row.icon || 'Shield'} className="h-5 w-5" /></div>
            <span>{row.title}</span>
          </div>)}
        </div></div> : null;
      })()}

      {/* ================= FULL-WIDTH HAJJ LANDSCAPE PACKAGES ================= */}
      <section className="packages-grid-container mx-auto max-w-[1400px] px-4 py-12 sm:px-6" style={{ order: sectionOrder(['Packages Grid','Hajj Packages','Hajj Packages Grid'], 100), width: '100%' }}>
        <HajjPackagePager
          items={(() => {
            if (packages.length > 0) return packages.filter(isPackageCardVisible);
            try {
              const parsed = typeof pageData?.sections === "string" ? JSON.parse(pageData.sections) : pageData?.sections;
              const section = Array.isArray(parsed) && parsed.find((s: any) => s.type === "Hajj Packages Grid" || s.type === "Hajj Cards");
              if (Array.isArray(section?.data?.items) && section.data.items.length > 0) return section.data.items.filter(isPackageCardVisible);
            } catch { /* Keep existing page fallback. */ }
            return []; // Do not create fabricated public package offers if the database is empty.
          })()}
          renderCard={(card: any, idx: number) => {
              const cd = typeof card.cardData === "string" ? (() => { try { return JSON.parse(card.cardData); } catch { return {}; } })() : (card.cardData || {});
              const detail = typeof card.detailPageData === "string" ? (() => { try { return JSON.parse(card.detailPageData); } catch { return {}; } })() : (card.detailPageData || {});
              const badgeTag = cd.badgeTag || card.badgeTag || (card.month ? `HAJJ ${card.month}` : "HAJJ 2027");
              const duration = cd.duration || card.duration || detail.durationText || (card.durationDays ? `${card.durationDays} Days` : "");
              const flightRoute = cd.flightRoute || card.flightRoute || "";
              const heroImage = cd.bannerImage || card.thumbnail || card.heroImage || card.featuredImage || card.image || "/uploads/sections/hajj_1.jpg";
              const title = card.title || cd.packageTitle || "Hajj Package 2027";
              const rawPrice = String(card.startingPrice ?? card.price ?? cd.price ?? "").trim();
              const quadPrice = Array.isArray(cd.packagePrices) ? cd.packagePrices.find((p: any) => /quad/i.test(p.packageType || p.type || "")) : null;
              const price = isTbcPrice(rawPrice, quadPrice?.priceStatus) ? "TBC" : rawPrice ? `${currencySettings.symbol} ${Number.isFinite(Number(rawPrice.replace(/[,£$A-Z\s]/g, ""))) ? Number(rawPrice.replace(/[,£$A-Z\s]/g, "")).toLocaleString(currencySettings.locale) : rawPrice}` : "";
              const priceSubtext = cd.priceSubtext || card.priceSubtext || "";
              const operatorName = cd.operatorName || card.operatorName || "";
              const operatorRating = cd.operatorRating || card.operatorRating || "";
              const packageCode = String(
                card.packageCode || cd.packageCode || detail.packageCode || ''
              ).trim();
              const btnLabel = cd.btnLabel || card.btnLabel || "BOOK NOW";

              const makkahHotel = cd.makkahHotel || card.makkahHotel;
              const madinahHotel = cd.madinahHotel || card.madinahHotel;
              const aziziyaHotel = cd.aziziyaHotel || card.aziziyaHotel;
              const minaHotel = cd.minaHotel || card.minaHotel;

              const isDurEnabled = (h: any) => {
                if (!h) return false;
                if (h.durationEnabled === false || h.enabled === false) return false;
                return true;
              };

              const isBadgeEnabled = (h: any) => {
                if (!h) return false;
                if (h.badgeEnabled === false) return false;
                return true;
              };

              const defaultAccommodations = [
                {
                  isVisible: makkahHotel?.isVisible,
                  city: makkahHotel?.label || 'MAKKAH',
                  subtitle: makkahHotel?.name || '',
                  location: makkahHotel?.location || '',
                  badge: makkahHotel?.badge || '',
                  badgeIcon: makkahHotel?.badgeIcon || '',
                  badgeEnabled: isBadgeEnabled(makkahHotel),
                  nights: makkahHotel?.nights || '',
                  image: makkahHotel?.image || '',
                  durationEnabled: isDurEnabled(makkahHotel),
                },
                {
                  isVisible: madinahHotel?.isVisible,
                  city: madinahHotel?.label || 'MADINA',
                  subtitle: madinahHotel?.name || '',
                  location: madinahHotel?.location || '',
                  badge: madinahHotel?.badge || '',
                  badgeIcon: madinahHotel?.badgeIcon || '',
                  badgeEnabled: isBadgeEnabled(madinahHotel),
                  nights: madinahHotel?.nights || '',
                  image: madinahHotel?.image || '',
                  durationEnabled: isDurEnabled(madinahHotel),
                },
                {
                  isVisible: aziziyaHotel?.isVisible,
                  city: aziziyaHotel?.label || 'AZIZIYA',
                  subtitle: aziziyaHotel?.name || '',
                  location: aziziyaHotel?.location || '',
                  badge: aziziyaHotel?.badge || '',
                  badgeIcon: aziziyaHotel?.badgeIcon || '',
                  badgeEnabled: isBadgeEnabled(aziziyaHotel),
                  nights: aziziyaHotel?.nights || '',
                  image: aziziyaHotel?.image || '',
                  durationEnabled: isDurEnabled(aziziyaHotel),
                },
                {
                  isVisible: minaHotel?.isVisible,
                  city: minaHotel?.label || 'MINA',
                  subtitle: minaHotel?.name || '',
                  location: minaHotel?.location || '',
                  badge: minaHotel?.badge || '',
                  badgeIcon: minaHotel?.badgeIcon || '',
                  badgeEnabled: isBadgeEnabled(minaHotel),
                  nights: minaHotel?.nights || '',
                  image: minaHotel?.image || '',
                  durationEnabled: isDurEnabled(minaHotel),
                }
              ].filter((acc) => {
                // If fields are empty, do not display accommodation on frontend
                return isAccommodationVisible(acc) && Boolean(acc.subtitle || acc.location || acc.image || (acc.durationEnabled && acc.nights) || (acc.badgeEnabled && acc.badge));
              });

              const inclusionsList = Array.isArray(cd.inclusions) ? cd.inclusions
                : Array.isArray(card.inclusions) ? card.inclusions : [];

              const eligibilityList = Array.isArray(cd.eligibility) ? cd.eligibility
                : Array.isArray(card.eligibility) && card.eligibility.length > 0
                ? card.eligibility
                : [
                  'British & U.S. citizens with Pakistani passports.',
                  'Pakistani passport holders with British PR or American Green Card.',
                  'All foreign passport holders with Pakistan passport.',
                  'Side trip to Pakistan or any other destination available with an additional cost.',
                ];

              const pkgSlug = card.slug || card.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

            return (
              <HajjLandscapeCard
                key={card.id || idx}
                heroImage={heroImage}
                packageTitle={title}
                badgeTag={badgeTag}
                duration={duration}
                flightRoute={flightRoute}
                packageCode={packageCode}
                accommodations={defaultAccommodations}
                inclusions={inclusionsList}
                eligibility={eligibilityList}
                operatorName={operatorName}
                operatorRating={operatorRating}
                priceSubtext={priceSubtext}
                price={price}
                bookLabel={btnLabel}
                onViewDetail={() => { window.location.href = `/package/${pkgSlug}`; }}
                onBook={() => { window.location.href = `/package/${pkgSlug}`; }}
              />
            );
          }}
        />
      </section>

      {/* ================= HAJJ SERVICES GRID ================= */}
      {(() => {
        let eyebrow = '';
        let heading = '';
        let subtitle = '';
        let services: any[] = [];
        try {
          if (pageData?.sections) {
            const parsed = typeof pageData.sections === 'string' ? JSON.parse(pageData.sections) : pageData.sections;
            const sec = Array.isArray(parsed) && parsed.find((s: any) => s.type === 'Hajj Services Grid');
            if (sec?.data) {
              eyebrow = sec.data.eyebrow || eyebrow;
              heading = sec.data.title || heading;
              subtitle = sec.data.subtitle || subtitle;
              if (Array.isArray(sec.data.items) && sec.data.items.length > 0) {
                services = sec.data.items;
              }
            }
          }
        } catch (e) { }
        return services.length > 0 ? (
          <section className="py-16 bg-white" style={{ order: sectionOrder(['Hajj Services Grid'], 120) }}>
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-10">
                {eyebrow && (
                  <span className="text-xs font-extrabold uppercase tracking-widest text-red block mb-2">{eyebrow}</span>
                )}
                <h2 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">{heading}</h2>
                {subtitle && (
                  <p className="text-sm text-slate-500 max-w-xl mx-auto">{subtitle}</p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {services.map((svc: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-red mb-1">
                      <DynamicIcon name={svc.icon || 'Star'} className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-extrabold text-primary leading-snug">{svc.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{svc.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null;
      })()}

      {/* ================= DYNAMIC SECTIONS (Text Block, etc.) ================= */}
      {(() => {
        if (!pageData?.sections) return null;
        try {
          const parsed =
            typeof pageData.sections === 'string'
              ? JSON.parse(pageData.sections)
              : pageData.sections;
          if (!Array.isArray(parsed)) return null;

          // Unescape HTML entities that may have been stored as text nodes
          const unescapeHtmlEntities = (str: string): string => {
            return str
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&nbsp;/g, '\u00a0');
          };

          return parsed
            .filter((s: any) => s.type === 'Text Block (Rich Text)')
            .map((sec: any, idx: number) => {
              let content: string = sec.data?.content || '';
              if (!content) return null;
              // Unwrap if the HTML was stored inside a wrapping <p> as entity-encoded text
              content = unescapeHtmlEntities(content);
              // Ensure empty paragraphs (like those created by pressing Enter) don't collapse
              content = content.replace(/<p>\s*(?:<br\s*\/?>)?\s*<\/p>/gi, '<p>&nbsp;</p>');
              // Strip wrapping <p>...</p> if the inner content starts with a block element
              const innerMatch = content.match(/^<p>([\s\S]*)<\/p>$/);
              if (innerMatch) {
                const inner = innerMatch[1].trim();
                if (inner.startsWith('<h') || inner.startsWith('<ul') || inner.startsWith('<ol') || inner.startsWith('<blockquote')) {
                  content = inner;
                }
              }
              if (!content || content === '<p></p>') return null;
              return (
                <section
                  key={`tb-${idx}`}
                  style={{ order: parsed.findIndex((s: any) => s.id === sec.id) * 10 + 10 }}
                  className="py-8 md:py-10 bg-blue-lt px-4"
                >
                  <div className="section-rich bg-white rounded-3xl p-4 md:p-8 max-w-[1360px] mx-auto w-full">
                    <div
                      className={[
                        'prose prose-slate max-w-none text-sm leading-relaxed',
                        '[&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:text-slate-900',
                        '[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary',
                        '[&_h3]:text-lg [&_h3]:font-bold [&_h3]:text-primary',
                        '[&_a]:text-primary [&_a]:underline',
                        '[&_ul]:list-disc [&_ul]:pl-5',
                        '[&_ol]:list-decimal [&_ol]:pl-5',
                        '[&_blockquote]:border-l-4 [&_blockquote]:border-red [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600',
                        '[&_strong]:text-slate-900',
                        '[&_p]:text-slate-700 [&_p]:leading-relaxed',
                      ].join(' ')}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                </section>
              );
            });
        } catch (e) {
          return null;
        }
      })()}

      {(() => {
        // Render only reviews entered through the CMS. No example testimonials.
        let reviewSection: any = null;
        try {
          const sections = typeof pageData?.sections === 'string' ? JSON.parse(pageData.sections) : pageData?.sections;
          reviewSection = Array.isArray(sections) ? sections.find((sec: any) => sec.type === 'Google Reviews / Testimonials') : null;
        } catch { /* Missing or invalid data is not a reason to publish sample reviews. */ }
        const reviews = Array.isArray(reviewSection?.data?.items) ? reviewSection.data.items : [];
        if (!reviews.length) return null;
        return <section className="bg-primary text-white py-6 overflow-hidden" style={{ order: sectionOrder(['Google Reviews / Testimonials'], 140) }}>
          <div className="max-w-7xl mx-auto">
            {reviewSection?.data?.title && <h2 className="text-3xl md:text-4xl font-serif text-white text-center mb-12">{reviewSection.data.title}</h2>}
            <TestimonialsCarousel reviews={reviews} />
          </div>
        </section>;
      })()}

      {(() => {
        try {
          const handledTypes = ['Packages Grid', 'Hajj Packages', 'Text Block (Rich Text)', 'Google Reviews / Testimonials'];
          const parsed = typeof pageData?.sections === 'string' ? JSON.parse(pageData.sections) : (pageData?.sections || []);
          const unhandled = parsed.filter((s: any) => !handledTypes.includes(s.type));
          if (unhandled.length > 0) {
            return <>{unhandled.map((sec: any) => <div key={sec.id} style={{ order: parsed.findIndex((s: any) => s.id === sec.id) * 10 + 10 }}><PageSectionsRenderer sections={[sec]} pageData={pageData} /></div>)}</>;
          }
        } catch (e) { }
        return null;
      })()}
    </div>
  );
}
