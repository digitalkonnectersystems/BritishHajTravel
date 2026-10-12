"use client";

import HajjLandscapeCard from "@/components/HajjLandscapeCard";
import HajjPackagePager from "@/components/HajjPackagePager";
import { isTbcPrice } from "@/lib/priceDisplay";
import PageBanner from "@/components/PageBanner";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";

const hajjCardsData = [
  {
    id: "economy-hajj-2027",
    title: "Economy Hajj Package 2027",
    duration: "14Days",
    heroImage:
      "/uploads/sections/hajj_1.jpg",
    price: "£ 12,995",
    makkahHotel: {
      name: "5 Star Hotel in Makkah",
      location: "Near to Haram",
      image:
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/865309229.jpg?k=13b36d624d683462058664c3aa31641cbb4c53cf07ca581f02f127e198029575&o=",
      badge: "Breakfast",
      badgeIcon: "Utensils",
      nights: "6 Nights",
    },
    madinahHotel: {
      name: "5 Star Hotel in Madinah",
      location: "Near to Masjid Nabawi",
      image:
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/523311776.jpg?k=2d6dfd51cd0bb767e33d6cc5dc4d3f8d76da0c17140158b7b43366dc7cf66a36&o=",
      badge: "Breakfast",
      badgeIcon: "Utensils",
      nights: "6 Nights",
    },
    aziziyaHotel: {
      name: "Aziziya Hotel",
      location: "Near Jamarat",
      image: "/images_BHT/packages/aziziya-hotel-makkah-1788162953272.jpg",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
    minaHotel: {
      name: "Mina Camp",
      location: "Maktab - A Category",
      image: "/images_BHT/packages/mina-maktab-a-bht-1788162957394.png",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
  },
  {
    id: "deluxe-hajj-2027",
    title: "Deluxe Hajj 2027",
    duration: "15 Days",
    heroImage:
      "/uploads/sections/hajj_1.jpg",
    price: "£ 17,995",
    makkahHotel: {
      name: "5 Star Hotel Fairmont Makkah",
      location: "Near to Haram",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5-XnMVZK4gPR2fok2UHalB4MgmobfdO0bUKh_VXGHMGYe_A7NQaaZ748&s=10",
      badge: "Buffet Included",
      badgeIcon: "Utensils",
      nights: "8 Nights",
    },
    madinahHotel: {
      name: "5 Star Hotel Dar Al Eman Madinah",
      location: "Near to Masjid Nabawi",
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80",
      badge: "Buffet Included",
      badgeIcon: "Utensils",
      nights: "7 Nights",
    },
    aziziyaHotel: {
      name: "Aziziya Hotel",
      location: "Near Jamarat",
      image: "/images_BHT/packages/aziziya-hotel-makkah-1788162953272.jpg",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
    minaHotel: {
      name: "Mina Camp",
      location: "Maktab - A Category",
      image: "/images_BHT/packages/mina-maktab-a-bht-1788162957394.png",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
  },
  {
    id: "express-custom-hajj-2027",
    title: "Express Custom Hajj 2027",
    duration: "10 Days",
    heroImage:
      "https://images.unsplash.com/photos/kaaba-mecca-IAwnp88Fz8Y",
    price: "£ 14,995",
    makkahHotel: {
      name: "Hyatt Regency Makkah",
      location: "Jabal Omar (Short Walk)",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80",
      badge: "Breakfast",
      nights: "5 Nights",
    },
    madinahHotel: {
      name: "Pullman Zamzam Madinah",
      location: "Walking Distance",
      image:
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80",
      badge: "Breakfast",
      badgeIcon: "Utensils",
      nights: "5 Nights",
    },
    aziziyaHotel: {
      name: "Aziziya Hotel",
      location: "Near Jamarat",
      image: "/images_BHT/packages/aziziya-hotel-makkah-1788162953272.jpg",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
    minaHotel: {
      name: "Mina Camp",
      location: "Maktab - A Category",
      image: "/images_BHT/packages/mina-maktab-a-bht-1788162957394.png",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
  },
];

export default function HajjPackagesPageClient({ initialPageData, packages = [] }: { initialPageData?: any, packages?: any[] }) {
  const pageData = initialPageData || null;
  return (
    <div className="hajj-page-wrapper" suppressHydrationWarning>
      {/* ================= DYNAMIC HERO BANNER ================= */}
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
        fallbackBgImage="/images_BHT/packages/hajj-2026-4-1789469937874.webp"
        localOnly
      />

      {/* ================= 4 FLOATING ACCREDITATION BADGES ================= */}
      <div className="badges-overlap-container">
        <div className="badge-grid">
          <div className="badge-card">
            <div className="badge-icon-wrap">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <span>ATOL PROTECTED</span>
          </div>

          <div className="badge-card">
            <div className="badge-icon-wrap">
              <i className="fa-solid fa-mosque"></i>
            </div>
            <span>SAUDI MINISTRY APPROVED</span>
          </div>

          <div className="badge-card">
            <div className="badge-icon-wrap">
              <i className="fa-solid fa-plane-departure"></i>
            </div>
            <span>IATA ACCREDITED</span>
          </div>

          <div className="badge-card">
            <div className="badge-icon-wrap">
              <i className="fa-solid fa-stamp"></i>
            </div>
            <span>ABTA BONDED</span>
          </div>
        </div>
      </div>

      {/* ================= FULL-WIDTH HAJJ LANDSCAPE PACKAGES ================= */}
      <section className="packages-grid-container mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <HajjPackagePager
          items={(() => {
            if (packages.length > 0) return packages;
            try {
              const parsed = typeof pageData?.sections === "string" ? JSON.parse(pageData.sections) : pageData?.sections;
              const section = Array.isArray(parsed) && parsed.find((s: any) => s.type === "Hajj Packages Grid" || s.type === "Hajj Cards");
              if (Array.isArray(section?.data?.items) && section.data.items.length > 0) return section.data.items;
            } catch { /* Keep existing page fallback. */ }
            return hajjCardsData;
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
              const price = isTbcPrice(rawPrice, quadPrice?.priceStatus) ? "TBC" : rawPrice ? (rawPrice.startsWith("£") ? rawPrice : `£ ${Number.isFinite(Number(rawPrice.replace(/[,£$]/g, ""))) ? Number(rawPrice.replace(/[,£$]/g, "")).toLocaleString("en-GB") : rawPrice}`) : "";
              const priceSubtext = cd.priceSubtext || card.priceSubtext || "";
              const operatorName = cd.operatorName || card.operatorName || "";
              const operatorRating = cd.operatorRating || card.operatorRating || "";
              const packageCode = String(
                card.packageCode || cd.packageCode || detail.packageCode || ''
              ).trim();
              const btnLabel = cd.btnLabel || card.btnLabel || "Book Hajj 2027";

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
                return Boolean(acc.subtitle || acc.location || acc.image || (acc.durationEnabled && acc.nights) || (acc.badgeEnabled && acc.badge));
              });

              const inclusionsList = Array.isArray(cd.inclusions) ? cd.inclusions
                : Array.isArray(card.inclusions) && card.inclusions.length > 0
                ? card.inclusions
                : [
                  { icon: 'Plane', text: 'Return\nAir Tickets' },
                  { icon: 'FileCheck', text: 'Hajj Visa\nProcessing' },
                  { icon: 'Bed', text: 'Comfortable\nAccommodation' },
                  { icon: 'Utensils', text: 'All Meals\nIncluded' },
                  { icon: 'Bus', text: 'Transport in\nSaudi Arabia' },
                  { icon: 'MessageCircle', text: 'Guidance &\nSupport' },
                ];

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
        // Defaults matching the screenshot layout
        const DEFAULT_SERVICES = [
          { icon: 'Users', title: 'Pre-Hajj Meet up', description: 'Get to know each other and held a meeting with all Hajjis' },
          { icon: 'Handshake', title: 'Meet & Assist', description: 'A dedicated team to assist and guide' },
          { icon: 'Utensils', title: 'Buffet Meals', description: 'Segregated full board buffet food' },
          { icon: 'IdCard', title: 'Visa Acquisition', description: 'We facilitate with visa documentation and services' },
          { icon: 'Bus', title: 'Luxury Transportation', description: 'We offer luxury busses and private vehicle' },
          { icon: 'Building2', title: '5 Star Accommodation', description: 'Get a comfort living 5 star hotel facility' },
          { icon: 'BedDouble', title: 'Sofa Mattress in Mina', description: 'Premium quality sofas and mattress' },
          { icon: 'BookOpen', title: 'Guide & Scholar', description: '3 to 4 training sessions with renowned scholars' },
        ];
        let eyebrow = 'WHAT IS INCLUDED';
        let heading = 'Hajj 2027 Services';
        let subtitle = 'From Departure to Return, We Take Care of Every Detail of Your Hajj.';
        let services = DEFAULT_SERVICES;
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
        return (
          <section className="py-16 bg-white">
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
        );
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
                  className="py-12 md:py-16 bg-blue-lt px-4"
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

      {/* ================= GOOGLE REVIEWS / TESTIMONIALS ================= */}
      {(() => {
        let eyebrow = 'HAPPY PILGRIMS';
        let heading = 'What our clients say';
        let reviewCount = '942';
        let reviewLink = 'https://maps.app.goo.gl/1BRUoBxtt4wWw58t6';
        let ctaLabel = 'Write A Review';
        try {
          if (pageData?.sections) {
            const parsed =
              typeof pageData.sections === 'string'
                ? JSON.parse(pageData.sections)
                : pageData.sections;
            const sec =
              Array.isArray(parsed) &&
              parsed.find((s: any) => s.type === 'Google Reviews / Testimonials');
            if (sec?.data) {
              eyebrow = sec.data.eyebrow || eyebrow;
              heading = sec.data.title || heading;
              reviewCount = sec.data.reviewCount || reviewCount;
              reviewLink = sec.data.reviewLink || reviewLink;
              ctaLabel = sec.data.ctaLabel || ctaLabel;
            }
          }
        } catch (e) { }
        return (
          <section className="bg-primary text-white py-6 overflow-hidden">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-xs font-extrabold uppercase tracking-widest text-red mb-2">
                  {eyebrow}
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-white">{heading}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/img/round-logo.png"
                      className="w-12 h-12 rounded-full border border-white/20 object-cover"
                      alt="British Hajj Travel logo"
                    />
                    <div className="text-sm font-bold text-white">
                      British Hajj Travel LTD - Mississauga
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-lg">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <div className="text-xs font-medium text-slate-200">Google reviews</div>
                  <a
                    href={reviewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block border border-white/40 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    {ctaLabel}
                  </a>
                </div>
                <div className="lg:col-span-8 relative">
                  <TestimonialsCarousel />
                </div>
              </div>
            </div>
          </section>
        );
      })()}
      {(() => {
        try {
          const handledTypes = ['Packages Grid', 'Hajj Packages', 'Text Block (Rich Text)', 'Google Reviews / Testimonials'];
          const parsed = typeof pageData?.sections === 'string' ? JSON.parse(pageData.sections) : (pageData?.sections || []);
          const unhandled = parsed.filter((s: any) => !handledTypes.includes(s.type));
          if (unhandled.length > 0) {
            return <PageSectionsRenderer sections={unhandled} pageData={pageData} />;
          }
        } catch (e) { }
        return null;
      })()}
    </div>
  );
}
