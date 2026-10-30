"use client";
import { filterSectionPackages } from "@/lib/sectionPackageSelection";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPackagesByType, getPackagesByIds } from "@/actions/packageActions";
import PackageBookingModal from "@/components/PackageBookingModal";
import PackageDetailModal from "@/components/PackageDetailModal";
import { isTbcPrice } from "@/lib/priceDisplay";
import HajjLandscapeCard from "@/components/HajjLandscapeCard";
import { isPackageCardVisible, isAccommodationVisible } from "@/lib/packageCardVisibility";
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
  const title = data?.title || "Hajj Packages";
  const description =
    data?.description ||
    data?.subtext ||
    "";
  const isHajjListingPage =
    pathname === "/hajj-packages" ||
    pathname === "/nusuk-hajj-packages" ||
    pathname === "/hajj" ||
    pathname?.startsWith("/hajj") ||
    pageData?.slug === "/hajj-packages" ||
    pageData?.slug === "/nusuk-hajj-packages" ||
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
  const visiblePkgs = filterSectionPackages(pkgs, data, "hajj");
  const [loading, setLoading] = useState(!initialPackages);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPkgForBooking, setSelectedPkgForBooking] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPkgForDetail, setSelectedPkgForDetail] = useState<any>(null);
  useEffect(() => {
    const packageIds = data?.packageIds || [];
    if (isHajjListingPage) {
      if (initialPackages) { setPkgs(initialPackages); setLoading(false); return; }
      setLoading(true);
      getPackagesByType("hajj").then(setPkgs).catch(() => setPkgs([])).finally(() => setLoading(false));
      return;
    }
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
  }, [data?.packageIds, initialPackages, isHajjListingPage]);
  // One-card-at-a-time horizontal carousel. All cards retain their React state
  // when they move, including the independent hotel navigation inside each card.
  const sliderRef = useRef<HTMLDivElement>(null);
  const [sliderControls, setSliderControls] = useState({
    hasOverflow: false,
    canGoPrevious: false,
    canGoNext: false,
  });

  const updateSliderControls = useCallback(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
    const hasOverflow = maxScroll > 2;
    const canGoPrevious = slider.scrollLeft > 2;
    const canGoNext = slider.scrollLeft < maxScroll - 2;
    setSliderControls((previous) =>
      previous.hasOverflow === hasOverflow &&
        previous.canGoPrevious === canGoPrevious &&
        previous.canGoNext === canGoNext
        ? previous
        : { hasOverflow, canGoPrevious, canGoNext }
    );
  }, []);

  useEffect(() => {
    if (!isHomepage || loading || visiblePkgs.length === 0) return;
    const slider = sliderRef.current;
    if (!slider) return;

    // Start at the first package when the data set changes.
    slider.scrollLeft = 0;
    updateSliderControls();

    // Recompute arrow availability when the number of visible cards changes
    // (4 on desktop, 2 on tablet, 1 on mobile).
    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateSliderControls);
      resizeObserver.observe(slider);
      if (slider.firstElementChild) resizeObserver.observe(slider.firstElementChild);
      return () => resizeObserver.disconnect();
    }

    window.addEventListener("resize", updateSliderControls);
    return () => window.removeEventListener("resize", updateSliderControls);
  }, [loading, visiblePkgs.length, isHomepage, updateSliderControls]);

  const slideOnePackage = (direction: -1 | 1) => {
    const slider = sliderRef.current;
    if (!slider || slider.children.length < 2) return;

    // Distance from one card to the next includes the gap. This means one
    // arrow click always shifts one card, not a page of four cards.
    const first = slider.children[0] as HTMLElement;
    const second = slider.children[1] as HTMLElement;
    const step = second.offsetLeft - first.offsetLeft;
    if (step <= 0) return;

    const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
    const index = Math.round(slider.scrollLeft / step);
    const nextPosition = Math.min(maxScroll, Math.max(0, (index + direction) * step));

    slider.scrollTo({
      left: nextPosition,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const sectionClass = isHomepage
    ? "pb-12 md:pb-16 md:pt-16 bg-white"
    : "pt-12 md:pb-16 bg-white";
  return (
    <section className={sectionClass}>
      <div className="max-w-[1400px] mx-auto px-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-6 gap-6 text-center md:text-left">
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
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
        {!loading && visiblePkgs.length === 0 && (
          <p className="text-center text-primary">
            No Hajj packages added to this section yet.
          </p>
        )}
        {/* Four visible on desktop, sliding exactly one package per click. */}
        {!loading && visiblePkgs.length > 0 && (
          <div className="relative">
            <div
              ref={isHomepage ? sliderRef : undefined}
              role={isHomepage ? "region" : undefined}
              aria-roledescription={isHomepage ? "carousel" : undefined}
              aria-label="Hajj packages"
              tabIndex={0}
              onScroll={isHomepage ? updateSliderControls : undefined}
              className={isHomepage ? "flex items-stretch gap-5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory xl:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4"}
            >
              {visiblePkgs.map((pkg: any, idx: number) => {
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
                  <div
                    key={pkg.id ?? `hajj-${idx}`}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Package ${idx + 1} of ${visiblePkgs.length}`}
                    className={isHomepage ? "w-full min-w-0 shrink-0 snap-start md:w-[calc(50%-0.625rem)] xl:w-[calc(25%-0.75rem)]" : "min-w-0"}
                  >
                    <HajjLandscapeCard
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
                      bookLabel={data?.isDestinationSection ? (cd.btnLabel || "Book Now") : (data?.buttonLabel || "BOOK NOW")}
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
                  </div>
                );
              })}
            </div>
            {isHomepage && sliderControls.hasOverflow && (
              <>
                <button
                  type="button"
                  aria-label="Previous Hajj package"
                  onClick={() => slideOnePackage(-1)}
                  disabled={!sliderControls.canGoPrevious}
                  className="absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-x-1/4 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-lg transition hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-primary md:-translate-x-1/2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next Hajj package"
                  onClick={() => slideOnePackage(1)}
                  disabled={!sliderControls.canGoNext}
                  className="absolute right-0 top-1/2 z-20 flex h-11 w-11 translate-x-1/4 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-primary shadow-lg transition hover:bg-primary hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-primary md:translate-x-1/2"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
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
