"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getPackagesByType, getPackagesByIds } from "@/actions/packageActions";
import PackageBookingModal from "@/components/PackageBookingModal";
import PackageDetailModal from "@/components/PackageDetailModal";
import { isTbcPrice } from "@/lib/priceDisplay";
import HajjLandscapeCard from "@/components/HajjLandscapeCard";
import HajjPackagePager from "@/components/HajjPackagePager";
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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPkgForDetail, setSelectedPkgForDetail] = useState<any>(null);

  useEffect(() => {
    const packageIds = data?.packageIds || [];

    if (data?.isDestinationSection && initialPackages) {
      setPkgs(initialPackages);
      setLoading(false);
      return;
    }

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
    ? "pb-12 md:pb-16 md:pt-16 bg-white"
    : "pt-12 md:pb-16 bg-blue-lt";

  return (
    <section className={sectionClass}>
      <div className="max-w-[1400px] mx-auto px-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="eyebrow">{eyebrow}</h3>
            <h2 className="section-heading text-primary">{title}</h2>
          </div>
          <div className="max-w-sm text-primary text-sm leading-relaxed border-t-2 md:border-t-0 md:border-l-2 border-gray-300 pt-4 md:pt-0 pl-0 md:pl-4">
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
                  <div className="h-12 bg-red/30 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No packages configured */}
        {!loading && pkgs.length === 0 && (
          <p className="text-center text-white">
            No Hajj packages added to this section yet.
          </p>
        )}

        {/* Landscape cards: four packages per page, arrows only if there are more than four. */}
        {!loading && pkgs.length > 0 && (
          <HajjPackagePager
            items={pkgs}
            renderCard={(pkg: any, idx: number) => {
              let cd = pkg.cardData || {};
              if (typeof cd === 'string') {
                try {
                  cd = JSON.parse(cd);
                } catch (e) {
                  cd = {};
                }
              }
              let detailData = pkg.detailPageData || {};
              if (typeof detailData === "string") {
                try {
                  detailData = JSON.parse(detailData);
                } catch {
                  detailData = {};
                }
              }
              const heroImage =
                cd.bannerImage ||
                pkg.image ||
                pkg.featuredImage ||
                pkg.heroImage ||
                "/uploads/sections/hajj_1.jpg";
              const cleanText = (value: unknown) => String(value ?? "").trim();
              const titleCandidate = String(
                pkg.title || pkg.packageTitle || cd.packageTitle || ""
              ).trim();
              const packageTitle = data?.isDestinationSection && titleCandidate.length < 2
                ? cleanText(pkg.destinationTitle)
                : titleCandidate || cleanText(pkg.destinationTitle);
              const badgeTag = cleanText(cd.badgeTag || pkg.badgeTag || data?.badgeTag || pkg.destinationTitle);
              const duration = cleanText(cd.duration || pkg.badgeDuration || (pkg.durationDays ? `${pkg.durationDays} Days` : ""));
              const flightRoute = cleanText(cd.flightRoute || pkg.flightRoute);
              const operatorName = cleanText(cd.operatorName || pkg.operatorName);
              const operatorRating = cleanText(cd.operatorRating || pkg.operatorRating);
              const priceSubtext = cleanText(cd.priceSubtext || pkg.priceSubtext);
              const packageCode = cleanText(
                cd.packageCode || pkg.packageCode || detailData.packageCode
              );
              const quadPrice = Array.isArray(cd.packagePrices) ? cd.packagePrices.find((item: any) => /quad/i.test(item.packageType || item.type || "")) : null;
              const price = isTbcPrice(pkg.startingPrice, quadPrice?.priceStatus)
                ? "TBC"
                : pkg.startingPrice
                ? Number(pkg.startingPrice).toLocaleString("en-CA", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })
                : cleanText(pkg.price || cd.price);
              const makkahHotel = cd.makkahHotel || pkg.makkahHotel;
              const madinahHotel = cd.madinahHotel || pkg.madinahHotel;
              const aziziyaHotel = cd.aziziyaHotel || pkg.aziziyaHotel;
              const minaHotel = cd.minaHotel || pkg.minaHotel;

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

              const inclusionsList = (Array.isArray(cd.inclusions)
                ? cd.inclusions
                : Array.isArray(pkg.inclusions) ? pkg.inclusions
                : [
                  { icon: 'Plane', text: 'Return\nAir Tickets' },
                  { icon: 'FileCheck', text: 'Hajj Visa\nProcessing' },
                  { icon: 'Bed', text: 'Comfortable\nAccommodation' },
                  { icon: 'Utensils', text: 'All Meals\nIncluded' },
                  { icon: 'Bus', text: 'Transport in\nSaudi Arabia' },
                  { icon: 'MessageCircle', text: 'Guidance &\nSupport' },
                ]).filter((inc: any) => cleanText(typeof inc === "string" ? inc : inc?.text));

              const eligibilityList = (Array.isArray(cd.eligibility)
                ? cd.eligibility
                : Array.isArray(pkg.eligibility) ? pkg.eligibility
                : [
                  'British & U.S. citizens with Pakistani passports.',
                  'Pakistani passport holders with British PR or American Green Card.',
                  'All foreign passport holders with Pakistan passport.',
                  'Side trip to Pakistan or any other destination available with an additional cost.',
                ]).map(cleanText).filter(Boolean);

              return (
                <HajjLandscapeCard
                  key={pkg.id || idx}
                  heroImage={heroImage}
                  packageTitle={packageTitle}
                  badgeTag={data?.isDestinationSection ? "" : badgeTag}
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
                  bookLabel={data?.isDestinationSection ? (cd.btnLabel || "Book Now") : (data?.buttonLabel || "Book Hajj 2027")}
                  onViewDetail={() => {
                    if (data?.isDestinationSection) {
                      if (pkg.destinationSlug) window.location.href = `/destinations/${pkg.destinationSlug}`;
                    } else if (pkg.slug) {
                      window.location.href = `/${pkg.slug}`;
                    } else if (pkg.btnLink) {
                      window.location.href = pkg.btnLink;
                    }
                  }}
                  onBook={() => {
                    setSelectedPkgForBooking(pkg);
                    setBookingModalOpen(true);
                  }}
                />
              );
            }}
          />
        )}
      </div>

      <PackageBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        pkg={selectedPkgForBooking}
      />
      <PackageDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        pkg={selectedPkgForDetail}
      />
    </section>
  );
}