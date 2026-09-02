"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import { getDurationUnit } from "@/lib/packageHelpers";

const umrahCardsData = [
  {
    id: "customize-2026",
    title: "Customize Umrah Package 2026",
    duration: "10, 15 Days",
    heroImage:
      "https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg",
    price: "CAD 7,499",
    makkahHotel: {
      name: "5 Star Hotel in Makkah",
      location: "Near to Haram",
      image:
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/865309229.jpg?k=13b36d624d683462058664c3aa31641cbb4c53cf07ca581f02f127e198029575&o=",
      badge: "Breakfast",
      nights: "6 Nights",
    },
    madinahHotel: {
      name: "5 Star Hotel in Madinah",
      location: "Near to Masjid Nabawi",
      image:
        "https://cf.bstatic.com/xdata/images/hotel/max1024x768/523311776.jpg?k=2d6dfd51cd0bb767e33d6cc5dc4d3f8d76da0c17140158b7b43366dc7cf66a36&o=",
      badge: "Breakfast",
      nights: "6 Nights",
    },
  },
  {
    id: "elite-platinum-2026",
    title: "Elite Platinum Umrah 2026",
    duration: "15 Days",
    heroImage:
      "https://images.unsplash.com/photo-1745775759814-9b60ed1718ed?q=80&w=1159&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: "CAD 10,950",
    makkahHotel: {
      name: "Fairmont Clock Royal Tower",
      location: "Zero distance (In Front)",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5-XnMVZK4gPR2fok2UHalB4MgmobfdO0bUKh_VXGHMGYe_A7NQaaZ748&s=10",
      badge: "Buffet Included",
      nights: "8 Nights",
    },
    madinahHotel: {
      name: "The Oberoi Madinah",
      location: "Adjacent to Courtyard",
      image:
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80",
      badge: "Buffet Included",
      nights: "7 Nights",
    },
  },
  {
    id: "express-custom-2026",
    title: "Express Custom Umrah 2026",
    duration: "10 Days",
    heroImage:
      "https://images.unsplash.com/photo-1586811388230-21835e10b83d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    price: "CAD 5,850",
    makkahHotel: {
      name: "Hyatt Regency Makkah",
      location: "2 Mins Walk",
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
      nights: "5 Nights",
    },
  },
];

import PackageDetailModal, { PackageDetailData } from "@/components/PackageDetailModal";

export default function UmrahPackagesPageClient({ initialPageData, packages = [] }: { initialPageData?: any, packages?: any[] }) {
  const pageData = initialPageData || null;
  const [selectedDetailPkg, setSelectedDetailPkg] = useState<PackageDetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Extract heading data if the user configured 'Upcoming Umrah Packages' in CMS
  let umrahHeadingData: any = null;
  let parsedSections: any[] = [];
  try {
    parsedSections = typeof pageData?.sections === 'string' ? JSON.parse(pageData.sections) : (pageData?.sections || []);
    const umrahSec = parsedSections.find((s: any) => s.type === 'Upcoming Umrah Packages' || s.type === 'Umrah Packages Grid' || s.type === 'Umrah Packages');
    if (umrahSec && umrahSec.data) {
      umrahHeadingData = umrahSec.data;
    }
  } catch (e) { }

  const eyebrow = umrahHeadingData?.eyebrow || "EXCLUSIVE UPCOMING";
  const title = umrahHeadingData?.title || "Umrah Packages<br />from Canada";
  const description = umrahHeadingData?.description || umrahHeadingData?.subtext || "Departures from CAD 2,595 per person. Availability and accommodations are confirmed with every booking — contact us before reserving.";

  const openDetailModal = (card: any) => {
    setSelectedDetailPkg({
      ...card,
      badgeTag: card.badgeTag || "UMRAH 2026",
      departure: card.departure || "CANADA",
      destination: card.destination || "SAUDIA"
    });
    setIsDetailOpen(true);
  };

  return (
    <div className="umrah-page-wrapper" suppressHydrationWarning>
      <PackageDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        pkg={selectedDetailPkg}
      />
      {/* ================= DYNAMIC HERO BANNER ================= */}
      <PageBanner
        title={pageData?.bannerTitle || pageData?.title || "Umrah Packages from Canada 2026 <br /><span>Travel with Confidence</span> by King Travel"}
        description={pageData?.bannerDescription || "Perform your sacred obligation of Umrah in 2026 with comfort, organization, and spiritual focus. King Travel proudly offers premium Umrah Packages from Canada 2026, designed to provide Canadian Muslims with a smooth and well-managed pilgrimage experience."}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
      />

      {/* ================= 4 FLOATING ACCREDITATION BADGES ================= */}
      <div className="badges-overlap-container">
        <div className="badge-grid">
          <div className="badge-card">
            <div className="badge-icon-wrap">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <span>ATOL Protected</span>
          </div>

          <div className="badge-card">
            <div className="badge-icon-wrap">
              <i className="fa-solid fa-mosque"></i>
            </div>
            <span>Saudi Ministry Approved</span>
          </div>

          <div className="badge-card">
            <div className="badge-icon-wrap">
              <i className="fa-solid fa-plane-departure"></i>
            </div>
            <span>IATA Accredited</span>
          </div>

          <div className="badge-card">
            <div className="badge-icon-wrap">
              <i className="fa-solid fa-stamp"></i>
            </div>
            <span>ABTA Bonded</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN PACKAGES GRID ================= */}
      <section className="packages-grid-container pt-16 bg-sage">
        <div className="max-w-[1400px] mx-auto px-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start">
              <h3 className="eyebrow">{eyebrow}</h3>
              <h2 className="" dangerouslySetInnerHTML={{ __html: title }} />
            </div>
            <div className="max-w-sm text-gray-500 text-sm leading-relaxed border-t-2 md:border-t-0 md:border-l-2 border-gray-200 pt-4 md:pt-0 pl-0 md:pl-4">
              {description}
            </div>
          </div>
        </div>
        <div className="cards-grid">
          {(() => {
            let cards = packages && packages.length > 0 ? packages : umrahCardsData;
            return cards.map((card: any) => {
              const badgeTag = card.badgeTag || (card.month ? `UMRAH ${card.month}` : "UMRAH 2026");
              const duration = card.duration || card.detailPageData?.durationText || card.month || "14Days";
              const heroImage = card.thumbnail || card.heroImage || "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1170&auto=format&fit=crop";
              const title = card.title || "Umrah Package 2026";
              const rawPrice = (card.startingPrice || card.price || "12,995").toString();
              const price = rawPrice.startsWith("CAD") ? rawPrice : `CAD ${rawPrice.replace("$", "").trim()}`;

              const makkahHotel = card.detailPageData?.makkahHotel || card.makkahHotel || { name: "5 Star Hotel", location: "Near Haram", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80", badge: "Breakfast", nights: "5 Nights" };
              const madinahHotel = card.detailPageData?.madinahHotel || card.madinahHotel || { name: "5 Star Hotel", location: "Near Masjid", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80", badge: "Breakfast", nights: "5 Nights" };

              return (
                <article key={card.id} className="custom-pkg-card">
                  {/* Hero Header Image */}
                  <div className="card-hero-img-wrap">
                    <Image
                      src={heroImage}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                    <div className="card-hero-overlay" />

                    {/* Top Bar Tags */}
                    <div className="card-hero-tags">
                      <div className="tag-black">
                        <i className="fa-solid fa-kaaba text-gold"></i>
                        <span>{badgeTag}</span>
                      </div>
                      <div className="tag-gold">
                        <i className="fa-solid fa-calendar-days"></i>
                        <span>{duration}</span>
                      </div>
                    </div>

                    {/* Title & Route Placement */}
                    <div className="card-hero-text">
                      <div className="route-subtext">
                        <i className="fa-solid fa-plane text-xs"></i> FROM CANADA <i className="fa-solid fa-arrow-right text-[10px]"></i> TO SAUDIA
                      </div>
                      <h2 className="card-main-title">{title}</h2>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    <div>
                      <span className="section-label">Accommodations</span>

                      {/* Makkah Hotel */}
                      <div className="hotel-strip makkah">
                        <div className="hotel-thumb">
                          <Image
                            src={makkahHotel.image}
                            alt={makkahHotel.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <span className="city-badge-overlay mk">Makkah</span>
                        </div>
                        <div className="hotel-details">
                          <div className="hotel-name">{makkahHotel.name}</div>
                          <div className="hotel-location">
                            <i className="fa-solid fa-location-dot text-primary"></i>
                            <span>{makkahHotel.location}</span>
                          </div>
                          <div className="hotel-tags">
                            <span className="tag-pill-dark">
                              <i className="fa-solid fa-utensils text-[8px]"></i>
                              <span>{makkahHotel.badge}</span>
                            </span>
                            <span className="tag-pill-light flex items-center gap-1">
                              {getDurationUnit(makkahHotel.nights) === 'days' ? (
                                <i className="fa-solid fa-sun text-amber-500 text-[8px]"></i>
                              ) : (
                                <i className="fa-solid fa-moon text-slate-600 text-[8px]"></i>
                              )}
                              <span>{makkahHotel.nights}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Madinah Hotel */}
                      <div className="hotel-strip madinah">
                        <div className="hotel-thumb">
                          <Image
                            src={madinahHotel.image}
                            alt={madinahHotel.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <span className="city-badge-overlay md">Madinah</span>
                        </div>
                        <div className="hotel-details">
                          <div className="hotel-name">{madinahHotel.name}</div>
                          <div className="hotel-location">
                            <i className="fa-solid fa-location-dot text-gold"></i>
                            <span>{madinahHotel.location}</span>
                          </div>
                          <div className="hotel-tags">
                            <span className="tag-pill-dark">
                              <i className="fa-solid fa-utensils text-[8px]"></i>
                              <span>{madinahHotel.badge}</span>
                            </span>
                            <span className="tag-pill-light flex items-center gap-1">
                              {getDurationUnit(madinahHotel.nights) === 'days' ? (
                                <i className="fa-solid fa-sun text-amber-500 text-[8px]"></i>
                              ) : (
                                <i className="fa-solid fa-moon text-slate-600 text-[8px]"></i>
                              )}
                              <span>{madinahHotel.nights}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Meta & Actions */}
                    <div className="card-footer-meta">
                      <div className="meta-row">
                        <div>
                          <div className="operator-title">Operator</div>
                          <div className="operator-val">
                            <span className="operator-name">King Travel</span>
                            <span className="rating-badge">4.4/5</span>
                          </div>
                        </div>
                        <div>
                          <div className="price-title">CAD / QUAD OCCUPANCY</div>
                          <div className="text-[24px] font-black text-primary text-right leading-none">{card.price}</div>
                        </div>
                      </div>

                      <Link
                        href={`/package/${card.slug || card.id || card.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        className="w-full bg-gold hover:bg-[#b88222] text-slate-950 font-extrabold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
                      >
                        <i className="fa-solid fa-passport"></i>
                        <span>Book Umrah 2026</span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            });
          })()}
        </div>
      </section>

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
                  className="pt-12 md:pt-16 bg-sage px-4"
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
                        '[&_blockquote]:border-l-4 [&_blockquote]:border-gold [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600',
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
        try {
          const handledTypes = ['Upcoming Umrah Packages', 'Umrah Packages Grid', 'Umrah Packages', 'Text Block (Rich Text)'];
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
