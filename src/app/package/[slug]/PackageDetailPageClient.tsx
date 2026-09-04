"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Calendar, User, Check, Star, MapPin, Utensils, Plane, TicketPercent, AlertCircle, ChevronDown, ChevronUp, ArrowLeft, ChevronLeft, ChevronRight, Sun, MoonStar } from "lucide-react";
import { getPackageDetailsAction, getPageSeoAction } from "@/actions/pageActions";
import { submitPackageBookingEnquiryAction } from "@/actions/enquiryActions";
import PageSeoHead from "@/components/PageSeoHead";
import SubmissionSuccessModal from "@/components/SubmissionSuccessModal";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { getDurationUnit } from "@/lib/packageHelpers";

export default function PackageDetailPageClient({
  initialSlug,
  initialPackage,
  initialSeo,
}: {
  initialSlug: string;
  initialPackage?: any;
  initialSeo?: any;
}) {
  const rawSlug = initialSlug;
  const [pkg] = useState<any>(() => initialPackage || null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+1 ");
  const [email, setEmail] = useState("");
  const [adults, setAdults] = useState("1");
  const [childrenCount, setChildrenCount] = useState("0");
  const [infantsCount, setInfantsCount] = useState("0");
  const [selectedDate, setSelectedDate] = useState("");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const todayDateStr = new Date().toISOString().split("T")[0];
  const pkgSeo = initialSeo || null;

  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalRef, setModalRef] = useState("");
  const [galleryOpenIndex, setGalleryOpenIndex] = useState<number | null>(null);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: boolean } = {};
    if (!fullName.trim()) newErrors.fullName = true;
    if (!phone.trim()) newErrors.phone = true;
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = true;
    if (packagePrices.length > 0 && !effectivePackageType) {
      newErrors.selectedPackageType = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setBookingStatus("Submitting Booking...");
    try {
      const res = await submitPackageBookingEnquiryAction({
        packageId: pkg?.id ? parseInt(pkg.id, 10) || undefined : undefined,
        packageName: pkg?.title || "Umrah Package",
        packageType: effectivePackageType || undefined,
        fullName,
        phone,
        email,
        adults: parseInt(adults, 10),
        children: parseInt(childrenCount, 10),
        infants: parseInt(infantsCount, 10),
        startDate: selectedDate,
        totalPrice: estimatedTotalFormatted ? `${currencyCode} ${estimatedTotalFormatted}` : String(pkg?.startingPrice ?? pkg?.price ?? ""),
      });

      if (res.success) {
        const msg = res.message || "Thank you! Your package booking request has been received. Our team will contact you shortly.";
        setModalMsg(msg);
        if (res.bookingNumber) setModalRef(res.bookingNumber);
        setModalOpen(true);
        setBookingStatus(null);
        setFullName("");
        setEmail("");
        setSelectedDate("");
        setSelectedPackageType("");
      } else {
        setBookingStatus(res.error || "Submission failed.");
      }
    } catch {
      setBookingStatus("Failed to submit booking.");
    }
  };

  if (!pkg) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex flex-col justify-center items-center p-8 text-center">
        <h2 className="text-2xl font-bold font-serif text-slate-800 mb-2">Package Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">The requested package details could not be loaded.</p>
        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-xl font-extrabold text-xs">
          ← Back to Homepage
        </Link>
      </div>
    );
  }

  let title = pkg.title || "Economy Hajj Package 2027";
  const hasHajjOrUmrah = /hajj|umrah/i.test(title);
  if (!hasHajjOrUmrah) {
    const bTag = (pkg.badgeTag || "").toUpperCase();
    const slugLower = rawSlug.toLowerCase();
    if (bTag.includes("HAJJ") || slugLower.includes("hajj")) {
      title = /(20\d\d)/.test(title) ? title.replace(/(20\d\d)/, "Hajj $1") : `${title} Hajj`;
    } else if (bTag.includes("UMRAH") || slugLower.includes("umrah")) {
      title = /(20\d\d)/.test(title) ? title.replace(/(20\d\d)/, "Umrah $1") : `${title} Umrah`;
    } else {
      title = `${title} Package`;
    }
  }
  const parseJsonSafe = (val: any) => {
    if (!val) return {};
    if (typeof val === "object") return val;
    if (typeof val === "string") {
      try {
        return JSON.parse(val);
      } catch {
        return {};
      }
    }
    return {};
  };

  const [selectedPackageType, setSelectedPackageType] = useState<string>("");

  const detailData = parseJsonSafe(pkg.detailPageData);
  const cardData = parseJsonSafe(pkg.cardData);

  // Extract packagePrices from packageData, cardData, detailPageData, or relation
  const packagePrices: { packageType: string; price: number }[] = (() => {
    const rawList =
      cardData?.packagePrices ||
      detailData?.packagePrices ||
      pkg.packagePrices ||
      (Array.isArray(pkg.prices)
        ? pkg.prices.map((p: any) => ({
          packageType:
            p.occupancyType === 'quad'
              ? 'Quad Occupancy'
              : p.occupancyType === 'triple'
                ? 'Triple Occupancy'
                : p.occupancyType === 'double'
                  ? 'Double Occupancy'
                  : p.occupancyType === 'single'
                    ? 'Single Occupancy'
                    : p.notes || 'Package Type',
          price: Number(p.amount) || 0,
        }))
        : null);

    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList
        .map((item: any) => ({
          packageType: (typeof item === 'object' ? item.packageType || item.type || '' : '').trim(),
          price: Number(String(typeof item === 'object' ? item.price || item.amount || 0 : item).replace(/[^0-9.]/g, '')) || 0,
        }))
        .filter((item: any) => item.packageType && item.price > 0);
    }

    const legacyBase = Number(String(pkg.startingPrice ?? pkg.price ?? '2795').replace(/[^0-9.]/g, '')) || 2795;
    return [
      { packageType: 'Quad Occupancy', price: legacyBase },
      { packageType: 'Triple Occupancy', price: legacyBase + 400 },
      { packageType: 'Double Occupancy', price: legacyBase + 800 },
    ];
  })();

  // Find the minimum priced package type deterministically
  const minPriceItem = packagePrices.length > 0
    ? packagePrices.reduce((min, curr) => (curr.price < min.price ? curr : min), packagePrices[0])
    : { packageType: 'QUAD OCCUPANCY', price: Number(String(pkg.startingPrice ?? pkg.price ?? '2795').replace(/[^0-9.]/g, '')) || 2795 };

  const durationText = detailData.durationText || cardData.duration || pkg.durationText || `${pkg.duration || "14 DAYS"} / 13 NIGHTS`;
  const departure = detailData.departure || cardData.departure || pkg.departure || "CANADA";
  const destination = detailData.destination || cardData.destination || pkg.destination || "SAUDIA";

  const minFormattedPrice = minPriceItem.price.toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const bannerPrice = minFormattedPrice;
  const priceSubtext = `PER PERSON - ${minPriceItem.packageType.toUpperCase()}`;
  const exclusiveBadge = detailData.exclusiveBadge || cardData.exclusiveBadge || pkg.exclusiveBadge || "STARTING FROM";
  const currencyCode = pkg.currency || pkg.currencyCode || "£";

  // Default selected package type is the minimum priced package (or single price if only 1)
  useEffect(() => {
    if (packagePrices.length > 0 && !selectedPackageType) {
      setSelectedPackageType(minPriceItem.packageType);
    }
  }, [packagePrices, selectedPackageType, minPriceItem.packageType]);

  const effectivePackageType = selectedPackageType || (minPriceItem ? minPriceItem.packageType : (packagePrices[0]?.packageType || ""));

  // Selected package type price for booking calculation
  const selectedPriceItem = packagePrices.find((p) => p.packageType === effectivePackageType);
  const selectedPackagePrice = selectedPriceItem ? selectedPriceItem.price : null;
  const estimatedTotalFormatted = selectedPackagePrice !== null
    ? selectedPackagePrice.toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    : null;

  const price = bannerPrice;

  const operatorName = cardData.operatorName || pkg.operatorName || "King Travel";
  const operatorRating = cardData.operatorRating || pkg.operatorRating || "4.4/5";
  const operatorReviews = cardData.operatorReviews || pkg.operatorReviews || "942 verified reviews";

  // Hotel relation fallback if present
  const dbMakkahHotel = Array.isArray(pkg.hotels) ? pkg.hotels.find((h: any) => /makkah/i.test(h.city)) : null;
  const dbMadinahHotel = Array.isArray(pkg.hotels) ? pkg.hotels.find((h: any) => /madinah/i.test(h.city)) : null;

  const rawMakkahHotel = detailData.makkahHotel || cardData.makkahHotel || pkg.makkahHotel || {};
  const makkahImg = rawMakkahHotel.image || rawMakkahHotel.image_url || dbMakkahHotel?.imageUrl || "";
  const makkahName = rawMakkahHotel.name || dbMakkahHotel?.hotelName || "";
  const makkahLoc = rawMakkahHotel.location || dbMakkahHotel?.distanceFromHaram || "";
  const makkahBadge = rawMakkahHotel.badge || "";
  const makkahBadgeIcon = rawMakkahHotel.badgeIcon || "";
  const makkahNights = rawMakkahHotel.nights || (dbMakkahHotel?.nights ? `${dbMakkahHotel.nights} Nights Stay` : "");
  const makkahNightsIcon = rawMakkahHotel.nightsIcon || "";

  const rawMadinahHotel = detailData.madinahHotel || cardData.madinahHotel || pkg.madinahHotel || {};
  const madinahImg = rawMadinahHotel.image || rawMadinahHotel.image_url || dbMadinahHotel?.imageUrl || "";
  const madinahName = rawMadinahHotel.name || dbMadinahHotel?.hotelName || "";
  const madinahLoc = rawMadinahHotel.location || dbMadinahHotel?.distanceFromHaram || "";
  const madinahBadge = rawMadinahHotel.badge || "";
  const madinahBadgeIcon = rawMadinahHotel.badgeIcon || "";
  const madinahNights = rawMadinahHotel.nights || (dbMadinahHotel?.nights ? `${dbMadinahHotel.nights} Nights Stay` : "");
  const madinahNightsIcon = rawMadinahHotel.nightsIcon || "";

  const isHajjPkg = /hajj/i.test(title) || (pkg.type === 'hajj');

  const defaultHajjOverview = [
    {
      groupTitle: "DURING STAY AT MADINAH - Hotel close to Haram (Breakfast & Dinner)",
      items: [
        "01 Dhul-Hajjah Check in at Madinah hotel and spend time in Prophet's Mosque",
        "02 Dhul-Hajjah Spend time in Haram & prayers",
        "03 Dhul-Hajjah Guided Ziarat in Madinah at 08:00 am",
        "04 Dhul-Hajjah Check out from Madinah and leave for Makkah Aziziya by air-conditioned coach"
      ]
    },
    {
      groupTitle: "DURING STAY AT AZIZIYA - Hotel (Full Board)",
      items: [
        "04 - 07 Dhul-Hajjah Stay at Aziziya Accommodation & preparation for Hajj days."
      ]
    },
    {
      groupTitle: "DURING STAY AT MINA - Near Jamarat Maktab-A-Category (Full Board)",
      items: [
        "07 - 12 Dhul-Hajjah Rituals at Mina / Arafat / Muzdalifah."
      ]
    },
    {
      groupTitle: "DURING STAY AT AZIZIYA - Hotel - Maktab-A-Category (Full Board)",
      items: [
        "12 to 14 Dhul-Hajjah Stay, Tawaf Ziyarah, and preparation for departure.",
        "14 Dhul-Hajjah Check out from Aziziya and leave for Jeddah airport for departure to Toronto."
      ]
    }
  ];

  const defaultUmrahOverview = [
    {
      groupTitle: "DAY 01 - ARRIVAL IN SAUDIA (JEDDAH / MADINAH)",
      items: [
        "Meet and assist service at the airport by King Travel representative",
        "Comfortable transfer by air-conditioned private/executive coach to your luxury hotel",
        "Hotel check-in and leisure time to relax and perform initial prayers"
      ]
    },
    {
      groupTitle: "DAY 02-07 - MADINAH MUNAWWARAH (PROPHET'S MOSQUE)",
      items: [
        "Daily prayers at Masjid an-Nabawi and Rawdah Sharif visits",
        "Comprehensive guided Ziyarat tour to historical sites: Mount Uhud, Masjid Quba, Masjid Qiblatain, and Seven Mosques",
        "Group orientation seminar and spiritual guidance by experienced religious scholars"
      ]
    },
    {
      groupTitle: "DAY 08-14 - MAKKAH MUKARRAMAH (PERFORMING UMRAH)",
      items: [
        "Departure in Ahram towards Makkah via high-speed Haramain train / luxury air-conditioned coach",
        "Perform Umrah rituals under the step-by-step guidance of qualified guides",
        "Guided Ziyarat in Makkah: Cave of Hira (Jabal al-Nour), Jabal Thawr, Mina, and Arafat",
        "Tawaf al-Wada (Farewell Tawaf) and scheduled airport transfer for departure back to UK"
      ]
    }
  ];

  const defaultOverview = isHajjPkg ? defaultHajjOverview : defaultUmrahOverview;

  const rawOverview = detailData.overview || pkg.overview;
  let overviewArray: { heading: string; details: string[] }[] = [];

  if (Array.isArray(rawOverview) && rawOverview.length > 0) {
    overviewArray = rawOverview
      .map((block: any) => {
        if (!block) return null;
        if (typeof block === 'string') {
          return { heading: block, details: [] };
        }
        const heading = block.groupTitle || block.heading || block.title || "";
        const rawItems = block.items || block.details || [];
        const details = Array.isArray(rawItems)
          ? rawItems.filter(Boolean)
          : typeof rawItems === 'string'
            ? rawItems.split('\n').map((s: string) => s.trim()).filter(Boolean)
            : [];
        if (!heading && details.length === 0) return null;
        return { heading, details };
      })
      .filter(Boolean) as { heading: string; details: string[] }[];
  } else if (typeof rawOverview === 'string' && rawOverview.trim()) {
    overviewArray = rawOverview.split('\n\n').map(section => {
      const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
      return {
        heading: lines[0] || "Overview",
        details: lines.slice(1)
      };
    });
  }

  if (overviewArray.length === 0) {
    overviewArray = defaultOverview.map(g => ({ heading: g.groupTitle, details: g.items }));
  }

  const defaultHighlights = isHajjPkg
    ? [
      { text: "Group Will Be Led By A Qualified Imam & Guide", isCross: false },
      { text: "Free Complete Ahram Kit Provided To Pilgrims", isCross: false },
      { text: "Pre-departure Educational Seminar with Dinner & Guidance", isCross: false },
      { text: "Luxury 5-Star Accommodations near Haram", isCross: false },
      { text: "All Ground Transportation by Luxury Air-Conditioned VIP Coaches", isCross: false },
      { text: "Qurbani Not Included (Available upon request)", isCross: true }
    ]
    : [
      { text: "Round-trip Flights from Major Canadian Gateways (YYZ, YVR, YUL)", isCross: false },
      { text: "Official Saudi Umrah Tourist/EVisa Processing Included", isCross: false },
      { text: "5-Star Accommodations with Daily Buffet Breakfast & Dinner Options", isCross: false },
      { text: "Comprehensive Guided Ziyarat Tours in Makkah & Madinah", isCross: false },
      { text: "24/7 Dedicated Bilingual On-ground Support Staff in Saudia", isCross: false },
      { text: "Complimentary Zamzam Water & Travel Ahram Kit per Pilgrim", isCross: false }
    ];

  const rawHighlights = detailData.highlights || pkg.highlights;
  let highlightsList: { text: string; isCross: boolean }[] = [];
  if (Array.isArray(rawHighlights) && rawHighlights.length > 0) {
    highlightsList = rawHighlights.map((hl: any) => {
      if (typeof hl === 'string') return { text: hl, isCross: false };
      return { text: hl.text || '', isCross: !!hl.isCross };
    }).filter((hl: any) => !!hl.text);
  }
  if (highlightsList.length === 0) {
    highlightsList = defaultHighlights;
  }

  const defaultEligibility = [
    "Canadian & U.S. Citizens with Valid Passport (Minimum 6 Months Validity).",
    "Canadian Permanent Residents (PR Card Holders) and Work/Study Permit Holders.",
    "Pakistani & International Passport holders with valid Canadian residency or visas.",
    "Custom extensions, side trips, and stopovers available upon request."
  ];

  const rawEligibility = detailData.eligibility || pkg.eligibility;
  let eligibilityList: string[] = [];
  if (Array.isArray(rawEligibility) && rawEligibility.length > 0) {
    eligibilityList = rawEligibility.filter(Boolean);
  } else if (typeof rawEligibility === 'string' && rawEligibility.trim()) {
    eligibilityList = rawEligibility.split('\n').map((s: string) => s.trim()).filter(Boolean);
  }
  if (eligibilityList.length === 0) {
    eligibilityList = defaultEligibility;
  }

  const importantNotice = detailData.importantNotice || detailData.importantBooking || pkg.importantNotice ||
    (isHajjPkg
      ? "To secure your Hajj visa slot, please make sure your Canadian passport is valid for at least 6 months beyond travel dates, and you have completed all mandatory immunizations required by the Saudi Ministry of Hajj."
      : "Umrah packages and seat availability are subject to confirmation at the time of booking. Ensure your passport has minimum 6 months validity. Contact King Travel for custom flight dates and family room occupancy options.");

  // Gallery is intentionally Umrah-only. Existing Hajj pages are unchanged.
  const rawPackagesGallery = pkg.packagesGallery ?? [];
  const parseRawGallery = (raw: any): any[] => {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return [];
      }
    }
    return [];
  };

  const packagesGallery: string[] = parseRawGallery(rawPackagesGallery)
    .flatMap((url: any) => (typeof url === "string" ? url.split(",") : []))
    .map((url) => url.trim())
    .filter(Boolean);

  const showPreviousGalleryImage = () => {
    if (galleryOpenIndex === null || packagesGallery.length === 0) return;
    setGalleryOpenIndex((galleryOpenIndex - 1 + packagesGallery.length) % packagesGallery.length);
  };

  const showNextGalleryImage = () => {
    if (galleryOpenIndex === null || packagesGallery.length === 0) return;
    setGalleryOpenIndex((galleryOpenIndex + 1) % packagesGallery.length);
  };

  const defaultFaqs = isHajjPkg
    ? [
      {
        question: "Can I upgrade to double or triple occupancy?",
        answer: "Yes! Upgrades to Double or Triple room occupancy are available upon request. Please select your occupancy preference or contact our support team during booking."
      },
      {
        question: "Are flights included in the package price?",
        answer: "Yes, round-trip international flights from major Canadian cities to Saudi Arabia are fully included in the package pricing."
      },
      {
        question: "How does the visa application process work?",
        answer: "Our licensed team takes care of the entire visa documentation, Nusuk coordination, biometric requirements, and authorization with the Saudi Ministry of Hajj."
      }
    ]
    : [
      {
        question: "Can I customize the departure date and number of days?",
        answer: "Absolutely! We offer flexible departure dates, custom durations (7, 10, 14, 21 nights), and personalized hotel selections to suit your travel schedule."
      },
      {
        question: "What items are included with the package?",
        answer: "Our packages include visa processing, 5-star hotel accommodations near Haram, guided Ziyarat tours, airport & intercity transfers, and 24/7 on-ground assistance."
      },
      {
        question: "Is visa processing and medical insurance included?",
        answer: "Yes, standard tourist and Umrah eVisa processing along with mandatory Saudi health and travel insurance are included in the package cost."
      }
    ];

  const rawFaqs = detailData.faqs || pkg.faqs;
  let faqs: { question: string; answer: string }[] = [];
  if (Array.isArray(rawFaqs) && rawFaqs.length > 0) {
    faqs = rawFaqs.filter((f: any) => f && (f.question || f.answer));
  }
  if (faqs.length === 0) {
    faqs = defaultFaqs;
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen text-slate-800">
      <PageSeoHead
        pageTitle={title}
        metaTitle={pkgSeo?.metaTitle || `${title} UK | King Travel`}
        metaDescription={
          pkgSeo?.metaDescription ||
          `Book official ${title} packages with King Travel UK. ${durationText}, departure from ${departure}, starting price £ $${price}. Authorized visa, 5-star hotels & flight options.`
        }
        canonicalUrl={pkgSeo?.canonicalUrl || `/package/${rawSlug}`}
        ogImageUrl={pkgSeo?.ogImageUrl || pkg.heroImage || 'https://media.kingtravelcan.com/uploads/branding/logo.png'}
        jsonLdPayload={
          pkgSeo?.jsonLdPayload ||
          JSON.stringify(
            {
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: title,
              image: pkg.heroImage || 'https://media.kingtravelcan.com/uploads/branding/logo.png',
              description: `Official ${title} travel package provided by King Travel UK. Includes flights, 5-star accommodations, and verified visa processing.`,
              brand: {
                '@type': 'Brand',
                name: 'King Travel UK',
              },
              offers: {
                '@type': 'Offer',
                url: `/package/${rawSlug}`,
                priceCurrency: '£',
                price: String(pkg.startingPrice ?? pkg.price ?? price ?? '12995').replace(/,/g, ''),
                priceValidUntil: '2027-12-31',
                availability: 'https://schema.org/InStock',
                seller: {
                  '@type': 'Organization',
                  name: 'King Travel UK',
                },
              },
            },
            null,
            2
          )
        }
        seoData={pkgSeo}
      />
      {/* ================= FULL-WIDTH HEADER BANNER ================= */}
      <div className="w-full bg-primary text-white py-10 sm:py-14 shadow-lg border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-10 relative">
          <div className="max-w-4xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-white font-serif mb-2.5 leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-white/90 uppercase mb-5">
              DURATION: {durationText}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gold">
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/20">
                <Plane className="w-4 h-4 text-gold" /> DEPARTURE: <strong className="text-white">{departure}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/20">
                <Plane className="w-4 h-4 text-gold" /> DESTINATION: <strong className="text-white">{destination}</strong>
              </span>
            </div>
          </div>

          {/* Price Box Overlay on Right */}
          <div className="mt-8 md:mt-0 md:absolute md:top-1/2 md:-translate-y-1/2 md:right-10 bg-gold border-2 border-dashed border-gold rounded-2xl p-5 text-center min-w-[220px] backdrop-blur-md shadow-xl">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white block mb-1">
              {exclusiveBadge}
            </span>
            <div className="text-3xl font-black text-white font-serif">
              {currencyCode} {price}
            </div>
            <span className="text-[10px] font-medium text-white/90 uppercase tracking-wide block mt-1">
              {priceSubtext}
            </span>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT BODY (2-COL GRID) ================= */}
      <div className="max-w-7xl mx-auto pb-16">
        <div className="p-4 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">

          {/* LEFT COLUMN: Accommodations, Overview, Highlights, Eligibility, FAQs */}
          <div className="lg:col-span-8 flex flex-col gap-10">

            {/* 1. Premium Accommodations */}
            {(rawMakkahHotel.name || rawMakkahHotel.image || rawMadinahHotel.name || rawMadinahHotel.image) && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-800 mb-5 flex items-center gap-2">
                  Premium Accommodations
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Makkah Hotel Card */}
                  {(rawMakkahHotel.name || rawMakkahHotel.image) && (
                    <div className="bg-white rounded-2xl overflow-hidden border border-blue-100 shadow-md flex flex-col">
                      <div className="relative h-48 w-full bg-slate-200">
                        {makkahImg ? (
                          <Image
                            src={makkahImg}
                            alt={makkahName || "Makkah Hotel"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-900/10 flex items-center justify-center text-slate-400 text-xs">
                            No image available
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                          Makkah
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-primary text-base line-clamp-1">{makkahName}</h4>
                          {makkahLoc && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span>{makkahLoc}</span>
                            </p>
                          )}
                        </div>
                        {(makkahBadge || makkahNights) && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                            {makkahBadge && (
                              <span className="bg-blue-100 text-primary px-2.5 py-1 rounded-lg border border-primary/10 flex items-center gap-1 text-[11px]">
                                {makkahBadgeIcon ? <DynamicIcon name={makkahBadgeIcon} className="w-3 h-3" /> : <Utensils className="w-3 h-3" />} {makkahBadge}
                              </span>
                            )}
                            {makkahNights && (
                              <span className="bg-slate-100 text-slate-600 px-2.5 py-1 capitalize rounded-lg text-[11px] flex items-center gap-1">
                                {getDurationUnit(makkahNights) === 'days' ? (
                                  <Sun className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <MoonStar className="w-3 h-3 text-slate-600" />
                                )}
                                <span>{makkahNights}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Madinah Hotel Card */}
                  {(rawMadinahHotel.name || rawMadinahHotel.image) && (
                    <div className="bg-white rounded-2xl overflow-hidden border border-gold-soft shadow-md flex flex-col">
                      <div className="relative h-48 w-full bg-slate-200">
                        {madinahImg ? (
                          <Image
                            src={madinahImg}
                            alt={madinahName || "Madinah Hotel"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-amber-900/10 flex items-center justify-center text-slate-400 text-xs">
                            No image available
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-gold text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                          Madinah
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-gold text-base line-clamp-1">{madinahName}</h4>
                          {madinahLoc && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-gold" />
                              <span>{madinahLoc}</span>
                            </p>
                          )}
                        </div>
                        {(madinahBadge || madinahNights) && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                            {madinahBadge && (
                              <span className="bg-gold-soft text-gold px-2.5 py-1 rounded-lg border border-gold-lt flex items-center gap-1 text-[11px]">
                                {madinahBadgeIcon ? <DynamicIcon name={madinahBadgeIcon} className="w-3 h-3" /> : <Utensils className="w-3 h-3" />} {madinahBadge}
                              </span>
                            )}
                            {madinahNights && (
                              <span className="bg-slate-100 text-slate-600 px-2.5 py-1 capitalize rounded-lg text-[11px] flex items-center gap-1">
                                {getDurationUnit(madinahNights) === 'days' ? (
                                  <Sun className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <MoonStar className="w-3 h-3 text-slate-600" />
                                )}
                                <span>{madinahNights}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Package Overview (Timeline) */}
            {overviewArray.length > 0 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-primary mb-5">
                  Package Overview
                </h3>
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
                  {overviewArray.map((block: any, bIdx: number) => {
                    const heading = block.heading;
                    const details = block.details || [];

                    return (
                      <div key={bIdx} className="relative pl-6 border-l-2 border-primary space-y-2">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white" />
                        {heading && (
                          <h4 className="font-bold text-primary text-sm sm:text-base leading-snug">
                            {heading}
                          </h4>
                        )}
                        {details.length > 0 && (
                          <ul className="space-y-1.5 pt-1">
                            {details.map((d: string, dIdx: number) => (
                              <li key={dIdx} className="text-xs sm:text-sm text-slate-600 leading-relaxed flex items-start gap-2">
                                <span className="text-gold font-bold text-xs mt-0.5">•</span>
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Package Highlights & Eligibility (Side-by-Side Cards) */}
            {(highlightsList.length > 0 || eligibilityList.length > 0) && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-800 mb-5">
                  Highlights & Eligibility
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Highlights */}
                  {highlightsList.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md">
                      <h4 className="text-lg font-bold font-serif text-primary mb-4 flex items-center gap-2">
                        ⭐️
                        Package Highlights
                      </h4>
                      <ul className="space-y-3">
                        {highlightsList.map((hl: any, idx: number) => {
                          const isCross = !!hl.isCross;
                          return (
                            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                              {isCross ? (
                                <span className="text-red-500 font-bold shrink-0 text-base leading-none">✕</span>
                              ) : (
                                <span className="text-primary font-bold shrink-0 text-base leading-none">✦</span>
                              )}
                              <span className={isCross ? "text-red-500" : "font-medium"}>
                                {hl.text}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* Eligibility Requirements */}
                  {eligibilityList.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md">
                      <h4 className="text-lg font-bold font-serif text-primary mb-4 flex items-center gap-2">
                        📋
                        Eligibility Requirements
                      </h4>
                      <ul className="space-y-3">
                        {eligibilityList.map((el: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                            <span className="text-primary font-bold shrink-0 text-base leading-none">✓</span>
                            <span className="font-medium">{el}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Package Gallery */}
            {packagesGallery.length > 0 && (
              <div>
                <div className="flex items-end justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-800">
                      Package Gallery
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Click any image to view it in full size.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {packagesGallery.length} {packagesGallery.length === 1 ? "Photo" : "Photos"}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {packagesGallery.map((imageUrl, imageIdx) => (
                    <button
                      key={`${imageUrl}-${imageIdx}`}
                      type="button"
                      onClick={() => setGalleryOpenIndex(imageIdx)}
                      className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm group cursor-zoom-in"
                      aria-label={`Open gallery image ${imageIdx + 1}`}
                    >
                      <Image
                        src={imageUrl}
                        alt={`${title} gallery image ${imageIdx + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized
                      />
                      <span className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Important Booking Notice */}
            {importantNotice && (
              <div className="bg-gold-soft border border-gold-lt rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-sm">
                <div className="p-2.5 bg-gold-soft rounded-xl shrink-0">
                  <AlertCircle className="w-6 h-6 text-gold" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-gold text-sm">Important Booking Notice</h4>
                  <p className="text-xs text-gold-900/80 leading-relaxed font-medium">
                    {importantNotice}
                  </p>
                </div>
              </div>
            )}

            {/* 6. Frequently Asked Questions (Accordion) */}
            {faqs.length > 0 && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-primary mb-5">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {faqs.map((faq: any, idx: number) => {
                    const isOpenItem = openFaqIdx === idx;
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
                      >
                        <button
                          onClick={() => setOpenFaqIdx(isOpenItem ? null : idx)}
                          className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-bold text-primary text-sm sm:text-base">
                            {faq.question}
                          </span>
                          {isOpenItem ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                        </button>
                        {isOpenItem && (
                          <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Operator Badge & Booking Form (Sticky Sidebar) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-6">

              {/* Operator Badge Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-bold font-serif text-primary text-lg">{operatorName}</h4>
                  <p className="text-xs pt-1 text-ink-lt font-medium">{operatorReviews}</p>
                </div>
                <div className="bg-gold-soft text-gold font-extrabold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span>{operatorRating}</span>
                  <Star className="w-3 h-3 fill-gold text-gold" />
                </div>
              </div>

              {/* Booking Input Form */}
              <form onSubmit={handleBookingSubmit} noValidate className="space-y-4">
                {bookingStatus && (
                  <p className="text-xs font-bold text-primary bg-white border border-gray-200 p-2.5 rounded-xl text-center">
                    {bookingStatus}
                  </p>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: false }));
                    }}
                    className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  />
                  {errors.fullName && (
                    <span className="text-[10px] font-bold text-red-600 mt-1 block">Please fill out this field.</span>
                  )}
                </div>

                {/* Phone Number & Email Address */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      maxLength={11}
                      value={phone}
                      onChange={(e) => {
                        let val = e.target.value;
                        const startsWithPlus = val.startsWith("+");
                        const digits = val.replace(/[^0-9]/g, "");
                        val = (startsWithPlus ? "+" : "") + digits;
                        if (val.length > 11) val = val.slice(0, 11);
                        setPhone(val);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
                      }}
                      className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.phone ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                        }`}
                    />
                    {errors.phone && (
                      <span className="text-[10px] font-bold text-red-600 mt-1 block">Please fill out this field.</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: false }));
                      }}
                      className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.email ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                        }`}
                    />
                    {errors.email && (
                      <span className="text-[10px] font-bold text-red-600 mt-1 block">Please fill out this field.</span>
                    )}
                  </div>
                </div>

                {/* Adults, Children, Infants Dropdowns */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
                      Adults
                    </label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(e.target.value)}
                      className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat focus:border-emerald-800`}
                    >
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6+">6+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
                      Children
                    </label>
                    <select
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(e.target.value)}
                      className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat focus:border-emerald-800`}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
                      Infants
                    </label>
                    <select
                      value={infantsCount}
                      onChange={(e) => setInfantsCount(e.target.value)}
                      className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat focus:border-emerald-800`}
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                </div>

                {/* Travel Date (Only for Umrah packages) */}
                {!isHajjPkg && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estimated Travel Date
                    </label>
                    <div className="relative">
                      <div
                        className={`w-full flex items-center justify-between border border-line p-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium ${errors.selectedDate ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                          }`}
                      >
                        <span className={selectedDate ? "text-slate-900" : "text-slate-400"}>
                          {selectedDate
                            ? (() => {
                              const [year, month, day] = selectedDate.split('-');
                              return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
                            })()
                            : "e.g. March 25, 2025"}
                        </span>
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                      </div>
                      <input
                        type="date"
                        min={todayDateStr}
                        value={selectedDate}
                        onClick={(e) => {
                          try {
                            (e.target as HTMLInputElement).showPicker?.();
                          } catch { }
                        }}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          if (errors.selectedDate) setErrors((prev) => ({ ...prev, selectedDate: false }));
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    {errors.selectedDate && (
                      <span className="text-[10px] font-bold text-red-600 mt-1 block">Please select a valid start date.</span>
                    )}
                  </div>
                )}

                {/* Package Type Dropdown (only if 2 or more package types) */}
                {packagePrices.length > 1 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Package Type
                    </label>
                    <div className="relative">
                      <select
                        value={effectivePackageType}
                        onChange={(e) => {
                          setSelectedPackageType(e.target.value);
                          if (errors.selectedPackageType) setErrors((prev) => ({ ...prev, selectedPackageType: false }));
                        }}
                        className={`w-full border border-line p-3 pr-9 rounded-sm bg-white outline-none focus:border-gold transition-colors text-ink text-sm font-medium appearance-none cursor-pointer ${errors.selectedPackageType ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                          }`}
                      >
                        {packagePrices.map((item, idx) => (
                          <option key={idx} value={item.packageType} className="bg-white text-ink py-1">
                            £ {item.price ? item.price.toLocaleString("en-CA") : ""} - {item.packageType}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                    {errors.selectedPackageType && (
                      <span className="text-[10px] font-bold text-red-600 mt-1 block">Please select a package type.</span>
                    )}
                  </div>
                )}

                {/* Total Calculation Display */}
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-ink">Estimated Total</span>
                  <span className="text-xl font-black text-ink font-serif">
                    {estimatedTotalFormatted ? `${currencyCode} ${estimatedTotalFormatted}` : "—"}
                  </span>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  className="w-full bg-gold text-white font-extrabold py-3.5 px-6 rounded-sm shadow-md hover:bg-gold-lt hover:text-white active:scale-[0.99] transition-all duration-300 tracking-wider uppercase text-sm flex items-center justify-center cursor-pointer"
                >
                  <TicketPercent className="w-4 h-4 mr-2" />
                  <span>Book {pkg.badgeTag || "Package"}</span>
                </button>

                <p className="text-[10px] text-slate-600 text-center leading-normal pt-1">
                  *Hajj & Umrah Packages are subject to seat availability. Visa processing is included. Comprehensive medical insurance and Ahram Kit provided upon arrival.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {galleryOpenIndex !== null && packagesGallery[galleryOpenIndex] && (
        <div
          className="fixed inset-0 z-[100000] bg-black/90 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Package gallery viewer"
          onClick={() => setGalleryOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setGalleryOpenIndex(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer z-20"
            aria-label="Close gallery"
          >
            <X className="w-6 h-6" />
          </button>

          {packagesGallery.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showPreviousGalleryImage();
              }}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gold hover:bg-primary text-black hover:text-white flex items-center justify-center cursor-pointer z-20"
              aria-label="Previous gallery image"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>
          )}

          <div
            className="relative w-full max-w-5xl h-[70vh] sm:h-[82vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={packagesGallery[galleryOpenIndex]}
              alt={`${title} gallery image ${galleryOpenIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
              priority
            />
          </div>

          {packagesGallery.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                showNextGalleryImage();
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gold hover:bg-primary text-black hover:text-white flex items-center justify-center cursor-pointer z-20"
              aria-label="Next gallery image"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          )}

          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 text-black text-xs font-bold bg-gold px-3 py-1.5 rounded-full">
            {galleryOpenIndex + 1} / {packagesGallery.length}
          </div>
        </div>
      )}

      <SubmissionSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
        referenceNumber={modalRef}
      />
    </div>
  );
}