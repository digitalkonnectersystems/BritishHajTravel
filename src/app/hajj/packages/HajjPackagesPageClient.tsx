"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import PageBanner from "@/components/PageBanner";
import PackageDetailModal, { PackageDetailData } from "@/components/PackageDetailModal";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import DynamicIcon from "@/components/ui/DynamicIcon";
import * as LucideIcons from "lucide-react";
import { getDurationUnit } from "@/lib/packageHelpers";

const hajjCardsData = [
  {
    id: "economy-hajj-2027",
    title: "Economy Hajj Package 2027",
    duration: "14Days",
    heroImage:
      "uploads\sections\hajj_1.jpg",
    price: "CAD 12,995",
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
      image: "/images_KTC/packages/aziziya-hotel-makkah-1788162953272.jpg",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
    minaHotel: {
      name: "Mina Camp",
      location: "Maktab - A Category",
      image: "/images_KTC/packages/mina-maktab-a-ktc-1788162957394.png",
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
      "uploads\sections\hajj_1.jpg",
    price: "CAD 17,995",
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
      image: "/images_KTC/packages/aziziya-hotel-makkah-1788162953272.jpg",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
    minaHotel: {
      name: "Mina Camp",
      location: "Maktab - A Category",
      image: "/images_KTC/packages/mina-maktab-a-ktc-1788162957394.png",
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
    price: "CAD 14,995",
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
      image: "/images_KTC/packages/aziziya-hotel-makkah-1788162953272.jpg",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
    minaHotel: {
      name: "Mina Camp",
      location: "Maktab - A Category",
      image: "/images_KTC/packages/mina-maktab-a-ktc-1788162957394.png",
      badge: "Full Board",
      badgeIcon: "ClipboardCheck",
      nights: "3 Nights",
    },
  },
];

export default function HajjPackagesPageClient({ initialPageData, packages = [] }: { initialPageData?: any, packages?: any[] }) {
  const pageData = initialPageData || null;
  const [selectedDetailPkg, setSelectedDetailPkg] = useState<PackageDetailData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);


  const openDetailModal = (card: any) => {
    setSelectedDetailPkg(card);
    setIsDetailOpen(true);
  };

  return (
    <div className="hajj-page-wrapper" suppressHydrationWarning>
      <PackageDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        pkg={selectedDetailPkg}
      />
      {/* ================= DYNAMIC HERO BANNER ================= */}
      <PageBanner
        title={
          pageData?.bannerTitle ||
          pageData?.title ||
          "Hajj Packages from Canada 2027 <br /><span>Travel with Confidence</span> by King Travel"
        }
        description={
          pageData?.bannerDescription ||
          "Perform your sacred obligation of Hajj in 2027 with comfort, organization, and spiritual focus. King Travel proudly offers premium Hajj Packages from Canada 2027, designed to provide Canadian Muslims with a smooth and well-managed pilgrimage experience."
        }
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

      {/* ================= MAIN HAJJ PACKAGES GRID ================= */}
      <section className="packages-grid-container py-12 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(() => {
            let cards = packages && packages.length > 0 ? packages : hajjCardsData;
            if (pageData?.sections && (!packages || packages.length === 0)) {
              try {
                const parsed = typeof pageData.sections === "string" ? JSON.parse(pageData.sections) : pageData.sections;
                const hajjSec = Array.isArray(parsed) && parsed.find((s: any) => s.type === "Hajj Packages Grid" || s.type === "Hajj Cards");
                if (hajjSec?.data?.items && Array.isArray(hajjSec.data.items) && hajjSec.data.items.length > 0) {
                  cards = hajjSec.data.items;
                }
              } catch (e) { }
            }

            return cards.map((card: any, idx: number) => {
              const badgeTag = card.badgeTag || (card.month ? `HAJJ ${card.month}` : "HAJJ 2027");
              const duration = card.duration || card.detailPageData?.durationText || card.month || "14Days";
              const flightRoute = card.flightRoute || "FROM CANADA ✈ TO SAUDIA";
              const heroImage = card.thumbnail || card.heroImage || "https://antiquewhite-stinkbug-399384.hostingersite.com/wp-content/uploads/2026/05/Umrah_packages_202605092201.jpeg";
              const title = card.title || "Hajj Package 2027";
              const rawPrice = (card.startingPrice || card.price || "12,995").toString();
              const price = rawPrice.startsWith("CAD") ? rawPrice : `CAD ${rawPrice.replace("$", "").trim()}`;
              const priceSubtext = card.priceSubtext || "CAD / QUAD OCCUPANCY";
              const operatorName = card.operatorName || "King Travel";
              const operatorRating = card.operatorRating || "4.4/5";
              const btnLabel = card.btnLabel || "Book Hajj 2027";
              const btnLink = card.btnLink || `https://wa.me/19056248344?text=Hi,%20I'm%20interested%20in%20${encodeURIComponent(title)}`;

              const makkahImg = card.makkahHotel?.image || "https://cf.bstatic.com/xdata/images/hotel/max1024x768/865309229.jpg";
              const makkahName = card.makkahHotel?.name || "5 Star Hotel in Makkah";
              const makkahLoc = card.makkahHotel?.location || "Near to Haram";
              const makkahBadge = card.makkahHotel?.badge || "Breakfast";
              const makkahNights = card.makkahHotel?.nights || "6 Nights";

              const makkahHotel = card.makkahHotel;
              const madinahHotel = card.madinahHotel;
              const aziziyaHotel = card.aziziyaHotel;
              const minaHotel = card.minaHotel;

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
                  city: 'MAKKAH',
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
                  city: 'MADINA',
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
                  city: 'AZIZIYA',
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
                  city: 'MINA',
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

              const inclusionsList = Array.isArray(card.inclusions) && card.inclusions.length > 0
                ? card.inclusions
                : [
                  { icon: 'Plane', text: 'Return\nAir Tickets' },
                  { icon: 'FileCheck', text: 'Hajj Visa\nProcessing' },
                  { icon: 'Bed', text: 'Comfortable\nAccommodation' },
                  { icon: 'Utensils', text: 'All Meals\nIncluded' },
                  { icon: 'Bus', text: 'Transport in\nSaudi Arabia' },
                  { icon: 'MessageCircle', text: 'Guidance &\nSupport' },
                ];

              const eligibilityList = Array.isArray(card.eligibility) && card.eligibility.length > 0
                ? card.eligibility
                : [
                  'Canadian & U.S. citizens with Pakistani passports.',
                  'Pakistani passport holders with Canadian PR or American Green Card.',
                  'All foreign passport holders with Pakistan passport.',
                  'Side trip to Pakistan or any other destination available with an additional cost.',
                ];

              const pkgSlug = card.slug || card.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

              return (
                <article key={card.id || idx} className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-slate-100 flex flex-col group transition-all duration-300 hover:shadow-2xl">
                  {/* Hero Header Image */}
                  <div className="relative h-60 overflow-hidden">
                    <Image
                      src={heroImage}
                      alt={title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/30" />

                    {/* Top Bar Tags */}
                    <div className="absolute top-4 inset-x-4 flex justify-between items-center text-xs">
                      <div className="bg-primary text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm">
                        <i className="fa-solid fa-kaaba text-gold"></i>
                        <span>{badgeTag}</span>
                      </div>
                      <div className="text-gold font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <i className="fa-solid fa-calendar-days"></i>
                        <span>{duration}</span>
                      </div>
                    </div>

                    {/* Title & Route Placement */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="text-[#6ee7b7] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <i className="fa-solid fa-plane text-xs"></i> {flightRoute}
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 block mb-3">Accommodations</span>

                      {/* 2x2 Accommodations Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                        {defaultAccommodations.map((acc, aIdx) => (
                          <div
                            key={aIdx}
                            className="flex gap-2.5 p-2 rounded-2xl border border-[#eef0e4] bg-[#fcfdf9] items-center"
                          >
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                              {acc.image ? (
                                <Image
                                  src={acc.image}
                                  alt={acc.city}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (
                                <i className="fa-solid fa-hotel text-slate-400 text-base"></i>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-black text-primary uppercase tracking-wider leading-none mb-0.5">{acc.city}</h4>
                              <div className="text-gold font-bold text-[10px] uppercase tracking-wide truncate mb-1">
                                {acc.subtitle}
                              </div>
                              <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-1 truncate">
                                <i className="fa-solid fa-location-dot text-slate-400 shrink-0"></i>
                                <span className="truncate">{acc.location}</span>
                              </p>
                              <div className="flex gap-1 flex-wrap">
                                {acc.badgeEnabled !== false && acc.badge && (
                                  <span className="text-[8px] font-bold bg-primary text-white px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                                    <DynamicIcon name={acc.badgeIcon || 'Utensils'} className="w-2.5 h-2.5" />
                                    <span>{acc.badge}</span>
                                  </span>
                                )}
                                {acc.durationEnabled !== false && acc.nights && (
                                  <span className="text-[8px] font-bold bg-gold-lt text-ink-soft px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                                    {getDurationUnit(acc.nights) === 'days' ? (
                                      <LucideIcons.Sun className="w-2 h-2 text-ink" />
                                    ) : (
                                      <LucideIcons.MoonStar className="w-2 h-2 text-ink" />
                                    )}
                                    <span>{acc.nights}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* PACKAGE INCLUSIONS (6 Badges Card) */}
                      <div className="relative mb-4 pt-3">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#00382B] text-white text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-full z-10 shadow-sm whitespace-nowrap">
                          PACKAGE INCLUSIONS
                        </div>
                        <div className="rounded-2xl border border-[#e5ebe3] bg-[#f9faf7] pt-5 pb-3 px-2">
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-center">
                            {inclusionsList.map((inc: any, iIdx: number) => {
                              const iconName = inc.icon || 'CheckCircle';
                              const text = inc.text || '';
                              return (
                                <div key={iIdx} className="flex flex-col items-center justify-start">
                                  <div className="w-9 h-9 rounded-full border border-slate-300 bg-white flex items-center justify-center mb-1 shadow-2xs">
                                    <DynamicIcon name={iconName} className="w-3.5 h-3.5 text-primary" />
                                  </div>
                                  <span className="text-[8px] font-bold text-slate-800 leading-tight whitespace-pre-line">
                                    {text}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Eligibility Checklist */}
                      {eligibilityList.length > 0 && (
                        <div className="rounded-2xl bg-[#f4f7f2] p-3 border border-[#e4ece0] mb-4">
                          <ul className="space-y-1.5">
                            {eligibilityList.map((item: string, eIdx: number) => (
                              <li key={eIdx} className="flex items-start gap-2 text-[11px] text-ink leading-snug">
                                <span className="w-3.5 h-3.5 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                                  <i className="fa-solid fa-check text-[8px]"></i>
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Footer Meta & Actions */}
                    <div className="pt-3 border-t border-slate-100 mt-2 space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <div className="w-1/2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">OPERATOR</span>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-800">{operatorName}</span>
                            <span className="text-[9px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shrink-0">{operatorRating}</span>
                          </div>
                        </div>
                        <div className="w-1/2 text-right">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">{priceSubtext}</span>
                          <div className="text-[22px] font-black text-primary text-right leading-none">{price}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/package/${pkgSlug}`}
                          className="flex-1 py-3 border-2 border-slate-800 text-slate-800 hover:bg-slate-800/5 text-xs font-extrabold rounded-xl uppercase tracking-wider transition-colors flex justify-center items-center gap-2"
                        >
                          <i className="fa-solid fa-eye text-xs"></i> View Detail
                        </Link>
                        <Link
                          href={`/package/${pkgSlug}`}
                          className="flex-1 bg-gold hover:bg-[#b88222] text-slate-950 font-extrabold py-3 px-3 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                          <i className="fa-solid fa-book-bookmark text-xs"></i>
                          <span>{btnLabel}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            });
          })()}
        </div>
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
                  <span className="text-xs font-extrabold uppercase tracking-widest text-gold block mb-2">{eyebrow}</span>
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
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-gold mb-1">
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
                  className="py-12 md:py-16 bg-sage px-4"
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
                <div className="text-xs font-extrabold uppercase tracking-widest text-gold mb-2">
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
                      alt="King Travel logo"
                    />
                    <div className="text-sm font-bold text-white">
                      King Travel Can Ltd - Mississauga
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
