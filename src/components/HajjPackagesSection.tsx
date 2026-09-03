"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import * as LucideIcons from "lucide-react";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { getDurationUnit } from "@/lib/packageHelpers";
import { getPackagesByType, getPackagesByIds } from "@/actions/packageActions";
import PackageBookingModal from "@/components/PackageBookingModal";
export default function HajjPackagesSection({
  data,
  initialPackages,
  pageData,
}: {
  data: any;
  initialPackages?: any;
  pageData?: any;
}) {
  const pathname = usePathname();
  const eyebrow = data?.eyebrow || "LUXURY HAJJ PACKAGES";
  const title = data?.title || "Hajj Packages 2027";
  const description =
    data?.description ||
    data?.subtext ||
    "Luxury Hajj 2027 Packages with 5-Star Hotels, VIP Services & Complete Spiritual Guidance.";

  const isHajjListingPage =
    pathname === "/hajj-packages" ||
    pathname === "/hajj" ||
    pathname?.startsWith("/hajj") ||
    pageData?.slug === "/hajj-packages" ||
    pageData?.slug === "hajj-packages";

  const isHomepage =
    pathname === "/" ||
    pathname === "" ||
    pathname === "/home" ||
    pageData?.slug === "/" ||
    pageData?.slug === "" ||
    pageData?.slug === "/home" ||
    pageData?.slug === "home" ||
    (!isHajjListingPage && (!pathname || pathname === "/"));

  const [pkgs, setPkgs] = useState<any[]>(initialPackages || []);
  const [loading, setLoading] = useState(!initialPackages);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPkgForBooking, setSelectedPkgForBooking] = useState<any>(null);

  useEffect(() => {
    const packageIds = data?.packageIds || [];

    // If we have initialPackages and no specific packageIds are selected, 
    // we don't need to fetch on mount, because the server already gave us all packages.
    if (initialPackages && packageIds.length === 0) {
      setPkgs(initialPackages);
      setLoading(false);
      return;
    }

    if (packageIds.length > 0) {
      getPackagesByIds(packageIds)
        .then((rows) => setPkgs(rows))
        .catch(() => setPkgs([]))
        .finally(() => setLoading(false));
    } else {
      getPackagesByType("hajj")
        .then((rows) => setPkgs(rows))
        .catch(() => setPkgs([]))
        .finally(() => setLoading(false));
    }
  }, [data?.packageIds, initialPackages]);

  const sectionClass = isHomepage
    ? "pb-12 md:pb-16 bg-white"
    : "pt-12 md:pb-16 bg-sage";

  return (
    <section className={sectionClass}>
      <div className="max-w-[1400px] mx-auto px-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="eyebrow">{eyebrow}</h3>
            <h2 className="section-heading text-primary">{title}</h2>
          </div>
          <div className="max-w-sm text-ink-soft text-sm leading-relaxed border-t-2 md:border-t-0 md:border-l-2 border-gray-200 pt-4 md:pt-0 pl-0 md:pl-4">
            {description}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-[240px] bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                  <div className="h-12 bg-gold/30 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No packages configured */}
        {!loading && pkgs.length === 0 && (
          <p className="text-center text-slate-400 py-12">
            No Hajj packages added to this section yet.
          </p>
        )}

        {/* Packages Grid */}
        {!loading && pkgs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pkgs.map((pkg: any, idx: number) => {
              let cd = pkg.cardData || {};
              if (typeof cd === 'string') {
                try {
                  cd = JSON.parse(cd);
                } catch (e) {
                  cd = {};
                }
              }
              const heroImage =
                cd.bannerImage ||
                pkg.featuredImage ||
                "/uploads/sections/hajj_1.jpg";
              const badgeTag = cd.badgeTag || "HAJJ 2027";
              const duration = cd.duration || `${pkg.durationDays || 14}Days`;
              const flightRoute =
                cd.flightRoute || "FROM CANADA ➔ TO SAUDIA";
              const operatorName = cd.operatorName || "King Travel";
              const operatorRating = cd.operatorRating || "4.4/5";
              const priceSubtext =
                cd.priceSubtext || "From £ / QUAD OCCUPANCY";
              const price = pkg.startingPrice
                ? Number(pkg.startingPrice).toLocaleString("en-CA", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                : "12,995";
              const makkahHotel = cd.makkahHotel;
              const madinahHotel = cd.madinahHotel;
              const aziziyaHotel = cd.aziziyaHotel;
              const minaHotel = cd.minaHotel;

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

              const inclusionsList = Array.isArray(cd.inclusions) && cd.inclusions.length > 0
                ? cd.inclusions
                : [
                  { icon: 'Plane', text: 'Return\nAir Tickets' },
                  { icon: 'FileCheck', text: 'Hajj Visa\nProcessing' },
                  { icon: 'Bed', text: 'Comfortable\nAccommodation' },
                  { icon: 'Utensils', text: 'All Meals\nIncluded' },
                  { icon: 'Bus', text: 'Transport in\nSaudi Arabia' },
                  { icon: 'MessageCircle', text: 'Guidance &\nSupport' },
                ];

              const eligibilityList = Array.isArray(cd.eligibility) && cd.eligibility.length > 0
                ? cd.eligibility
                : [
                  'Canadian & U.S. citizens with Pakistani passports.',
                  'Pakistani passport holders with Canadian PR or American Green Card.',
                  'All foreign passport holders with Pakistan passport.',
                  'Side trip to Pakistan or any other destination available with an additional cost.',
                ];

              return (
                <div
                  key={pkg.id || idx}
                  className="bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_25px_rgb(0,0,0,0.07)] border border-gray-100 flex flex-col"
                >
                  {/* Hero image */}
                  <div className="relative h-[230px] w-full">
                    <img
                      src={heroImage}
                      alt={pkg.title || "Hajj Package"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 text-white text-[11px] font-bold tracking-wider">
                      <LucideIcons.Shield className="w-3.5 h-3.5" /> {badgeTag}
                    </div>
                    <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-[11px] font-black tracking-wider flex items-center gap-1.5 shadow-sm">
                      <LucideIcons.Calendar className="w-3.5 h-3.5" /> {duration}
                    </div>

                    {/* Bottom text */}
                    <div className="absolute bottom-4 left-5 right-5">
                      <div className="text-gold text-[11px] font-black tracking-widest mb-1 flex items-center gap-1.5">
                        <LucideIcons.Plane className="w-3.5 h-3.5" /> {flightRoute}
                      </div>
                      <h3 className="text-white font-serif text-2xl leading-tight font-bold">
                        {pkg.title || "5 Star Deluxe Hajj Package 2027"}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="text-[11px] font-black text-primary uppercase tracking-widest mb-3">
                      ACCOMMODATIONS
                    </div>

                    {/* 2x2 Accommodations Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                      {defaultAccommodations.map((acc, aIdx) => (
                        <div
                          key={aIdx}
                          className="flex gap-3 p-2.5 rounded-2xl border border-[#eef0e4] bg-[#fcfdf9] items-start"
                        >
                          <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative flex items-center justify-center">
                            {acc.image ? (
                              <img
                                src={acc.image}
                                alt={acc.city}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <LucideIcons.Hotel className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          <div className="flex flex-col justify-center min-w-0 flex-1">
                            <h4 className="text-primary font-black text-xs uppercase tracking-wider leading-none mb-0.5">
                              {acc.city}
                            </h4>
                            <div className="text-gold font-serif font-bold text-[10px] uppercase tracking-wide truncate">
                              {acc.subtitle}
                            </div>
                            <div className="text-ink-soft text-[10px] flex items-center gap-1 mb-1.5 truncate">
                              <LucideIcons.MapPin className="w-3 h-3 text-ink-soft shrink-0" />
                              <span className="truncate">{acc.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {acc.badgeEnabled !== false && acc.badge && (
                                <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider flex items-center gap-1 shrink-0">
                                  <DynamicIcon name={acc.badgeIcon || 'Utensils'} className="w-2.5 h-2.5" />
                                  {acc.badge}
                                </span>
                              )}
                              {acc.durationEnabled !== false && acc.nights && (
                                <span className="bg-gold-lt text-white text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider flex items-center gap-1 shrink-0">
                                  {getDurationUnit(acc.nights) === 'days' ? (
                                    <LucideIcons.Sun className="w-2.5 h-2.5 text-white" />
                                  ) : (
                                    <LucideIcons.MoonStar className="w-2.5 h-2.5 text-white" />
                                  )}
                                  {acc.nights}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* PACKAGE INCLUSIONS (6 Badges Card) */}
                    <div className="relative mb-4 pt-3">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-primary uppercase font-serif tracking-wide px-4 py-1 rounded-full z-10 shadow-sm whitespace-nowrap">
                        PACKAGE INCLUSIONS
                      </div>
                      <div className="rounded-2xl border border-[#e5ebe3] bg-[#f9faf7] pt-6 pb-4 px-2">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                          {inclusionsList.map((inc: any, iIdx: number) => {
                            const iconName = inc.icon || 'CheckCircle';
                            const text = inc.text || '';
                            return (
                              <div key={iIdx} className="flex flex-col items-center justify-start group">
                                <div className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center mb-1.5 shadow-2xs group-hover:border-primary transition-colors">
                                  <DynamicIcon name={iconName} className="w-4 h-4 text-primary" />
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
                      <div className="rounded-2xl bg-[#f4f7f2] p-3.5 border border-[#e4ece0] mb-5">
                        <ul className="space-y-1.5">
                          {eligibilityList.map((item: string, eIdx: number) => (
                            <li key={eIdx} className="flex items-start gap-2 text-[11px] text-ink leading-snug">
                              <span className="w-3.5 h-3.5 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                                <LucideIcons.Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-4 flex items-end justify-between mb-5">
                      <div>
                        <div className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-1">
                          OPERATOR
                        </div>
                        <div className="text-sm font-bold text-ink flex items-center gap-2 whitespace-nowrap">
                          {operatorName}{" "}
                          <span className="bg-gold text-white text-[10px] px-1.5 py-0.5 rounded font-black">
                            {operatorRating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">
                          {priceSubtext}
                        </div>
                        <div className="text-2xl font-black text-primary leading-none">
                          {price}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <a
                        href={`/${pkg.slug}`}
                        className="flex-1 py-3.5 border-2 border-primary text-primary hover:bg-primary hover:text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors flex justify-center items-center gap-2"
                      >
                        <LucideIcons.Eye className="w-4 h-4" /> View Detail
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPkgForBooking(pkg);
                          setBookingModalOpen(true);
                        }}
                        className="flex-1 py-3.5 bg-gold hover:bg-white hover:border hover:border-gold text-white hover:text-gold text-xs font-black rounded-xl uppercase tracking-wider transition-colors flex justify-center items-center gap-2 shadow-sm"
                      >
                        <LucideIcons.BookOpen className="w-4 h-4" /> Book Hajj 2027
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PackageBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        pkg={selectedPkgForBooking}
      />
    </section>
  );
}