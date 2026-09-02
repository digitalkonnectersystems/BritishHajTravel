"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Calendar, User, Check, Star, MapPin, Utensils, Plane, AlertCircle, ChevronDown, ChevronUp, ArrowLeft, Sun, MoonStar } from "lucide-react";
import DynamicIcon from "./ui/DynamicIcon";
import { getDurationUnit } from "@/lib/packageHelpers";

export interface PackageDetailData {
  id?: string;
  title?: string;
  badgeTag?: string;
  duration?: string;
  durationText?: string;
  exclusiveBadge?: string;
  currencyCode?: string;
  flightRoute?: string;
  departure?: string;
  destination?: string;
  price?: string;
  priceSubtext?: string;
  heroImage?: string;
  operatorName?: string;
  operatorRating?: string;
  operatorReviews?: string;
  btnLabel?: string;
  btnLink?: string;
  makkahHotel?: {
    name?: string;
    location?: string;
    badge?: string;
    nights?: string;
    image?: string;
  };
  madinahHotel?: {
    name?: string;
    location?: string;
    badge?: string;
    nights?: string;
    image?: string;
  };
  overview?: string;
  highlights?: string;
  eligibility?: string;
  importantNotice?: string;
  faqs?: Array<{ question: string; answer: string }>;
  detailPageData?: any;
  cardData?: any;
  month?: string;
  startingPrice?: string | number;
  [key: string]: any;
}

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: PackageDetailData | null;
}

export default function PackageDetailModal({ isOpen, onClose, pkg }: PackageDetailModalProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPackageType, setSelectedPackageType] = useState<string>("");
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

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

  const detailData = pkg ? parseJsonSafe(pkg.detailPageData) : {};
  const cardData = pkg ? parseJsonSafe(pkg.cardData) : {};

  // Extract packagePrices from packageData, cardData, detailPageData, or relation
  const packagePrices: { packageType: string; price: number }[] = (() => {
    if (!pkg) return [];
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
    : { packageType: 'QUAD OCCUPANCY', price: Number(String(pkg?.startingPrice ?? pkg?.price ?? '2795').replace(/[^0-9.]/g, '')) || 2795 };

  // Default selected package type is the minimum priced package (or single price if only 1)
  useEffect(() => {
    if (packagePrices.length > 0 && !selectedPackageType) {
      setSelectedPackageType(minPriceItem.packageType);
    }
  }, [packagePrices, selectedPackageType, minPriceItem.packageType]);

  if (!isOpen || !pkg) return null;

  const effectivePackageType = selectedPackageType || (minPriceItem ? minPriceItem.packageType : (packagePrices[0]?.packageType || ""));

  const title = pkg.title || "ECONOMY HAJJ PACKAGE 2027";
  const isHajj = pkg.type === "hajj" || /hajj/i.test(title);
  const durationText = detailData.durationText || cardData.duration || pkg.durationText || `${pkg.duration || pkg.month || "14 DAYS"} / 13 NIGHTS`;
  const departure = detailData.departure || cardData.departure || pkg.departure || "CANADA";
  const destination = detailData.destination || cardData.destination || pkg.destination || "SAUDIA";

  const minFormattedPrice = minPriceItem.price.toLocaleString("en-CA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const bannerPrice = minFormattedPrice;
  const priceSubtext = `PER PERSON - ${minPriceItem.packageType.toUpperCase()}`;
  const exclusiveBadge = detailData.exclusiveBadge || cardData.exclusiveBadge || pkg.exclusiveBadge || "STARTING FROM";
  const currencyCode = detailData.currencyCode || pkg.currencyCode || "CAD";

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

  const makkahHotel = detailData.makkahHotel || cardData.makkahHotel || pkg.makkahHotel || {};
  const makkahImg = makkahHotel?.image || makkahHotel?.image_url || "";
  const makkahName = makkahHotel?.name || "";
  const makkahLoc = makkahHotel?.location || "";
  const makkahBadge = makkahHotel?.badge || "";
  const makkahNights = makkahHotel?.nights || "";

  const madinahHotel = detailData.madinahHotel || cardData.madinahHotel || pkg.madinahHotel || {};
  const madinahImg = madinahHotel?.image || madinahHotel?.image_url || "";
  const madinahName = madinahHotel?.name || "";
  const madinahLoc = madinahHotel?.location || "";
  const madinahBadge = madinahHotel?.badge || "";
  const madinahNights = madinahHotel?.nights || "";

  const aziziyaHotel = detailData.aziziyaHotel || cardData.aziziyaHotel || pkg.aziziyaHotel || {};
  const aziziyaImg = aziziyaHotel?.image || aziziyaHotel?.image_url || "";
  const aziziyaName = aziziyaHotel?.name || "";
  const aziziyaLoc = aziziyaHotel?.location || "";
  const aziziyaBadge = aziziyaHotel?.badge || "";
  const aziziyaNights = aziziyaHotel?.nights || "";

  const minaHotel = detailData.minaHotel || cardData.minaHotel || pkg.minaHotel || {};
  const minaImg = minaHotel?.image || minaHotel?.image_url || "";
  const minaName = minaHotel?.name || "";
  const minaLoc = minaHotel?.location || "";
  const minaBadge = minaHotel?.badge || "";
  const minaNights = minaHotel?.nights || "";
  const isMakkahDurationVisible = (makkahHotel?.durationEnabled ?? makkahHotel?.enabled) !== false && Boolean(makkahNights);
  const isMadinahDurationVisible = (madinahHotel?.durationEnabled ?? madinahHotel?.enabled) !== false && Boolean(madinahNights);
  const isAziziyaDurationVisible = (aziziyaHotel?.durationEnabled ?? aziziyaHotel?.enabled) !== false && Boolean(aziziyaNights);
  const isMinaDurationVisible = (minaHotel?.durationEnabled ?? minaHotel?.enabled) !== false && Boolean(minaNights);

  const isMakkahVisible = Boolean(makkahHotel?.name || makkahHotel?.image || makkahHotel?.location || makkahHotel?.badge || (isMakkahDurationVisible && makkahNights));
  const isMadinahVisible = Boolean(madinahHotel?.name || madinahHotel?.image || madinahHotel?.location || madinahHotel?.badge || (isMadinahDurationVisible && madinahNights));
  const isAziziyaVisible = Boolean(aziziyaHotel?.name || aziziyaHotel?.image || aziziyaHotel?.location || aziziyaHotel?.badge || (isAziziyaDurationVisible && aziziyaNights));
  const isMinaVisible = Boolean(minaHotel?.name || minaHotel?.image || minaHotel?.location || minaHotel?.badge || (isMinaDurationVisible && minaNights));

  const overviewText = detailData.overview || pkg.overview || `DURING STAY AT MADINAH - Hotel close to Haram (Breakfast & Dinner)
01 Dhul-Hajjah Check in at Madinah hotel and spend time in Prophet's Mosque
02 Dhul-Hajjah Spend time in Haram
03 Dhul-Hajjah Leave for Ziarat in Madinah at 08:00 am
04 Dhul-Hajjah Check out from Madinah and Leave for Makkah Aziziya by air-conditioned coach

DURING STAY AT AZIZIYA - Hotel (Full Board)
04 - 07 Dhul-Hajjah Stay at Aziziya Accommodation.

DURING STAY AT MINA - Near Jamarat Maktab-A-Category (Full Board)
07 - 12 Dhul-Hajjah Rituals at Mina / Arafat / Muzalfa.

DURING STAY AT AZIZIYA - Hotel - Maktab-A-Category (Full Board)
12 to 14 Dhul-Hajjah Stay and preparation for departure.
14 Dhul-Hajjah Check out from Aziziya and leave for Jeddah airport for departure to Toronto.`;

  const defaultHighlights = [
    { text: "Group Will Be Led By A Qualified Imam", isCross: false },
    { text: "Free Complete Ahram Kit Provided To Pilgrims", isCross: false },
    { text: "Before Departure we offer Seminar with Dinner & Hajj under the Imam Guidance", isCross: false },
    { text: "Flexible Dates are Available", isCross: false },
    { text: "Qurbani Not Included", isCross: true }
  ];
  const activeHighlights = (detailData.highlights && detailData.highlights.length > 0) ? detailData.highlights : defaultHighlights;

  const defaultEligibility = [
    "Canadian & U.S. citizens with Pakistan Passports.",
    "Pakistani Passport holders with Canadian PR or American Green Cards.",
    "All Foreign Passport holders with Pakistan Passports.",
    "Side trips to Pakistan or any other destination available with an additional cost."
  ];
  const activeEligibility = (detailData.eligibility && detailData.eligibility.length > 0) ? detailData.eligibility : defaultEligibility;

  const importantNotice = detailData.importantBooking || pkg.importantNotice || "To secure your Hajj visa slot, please make sure your Canadian passport is valid for at least 6 months beyond travel dates, and you have completed all mandatory immunizations required by the Saudi Ministry of Hajj.";

  const defaultFaqs = [
    {
      question: "Can I upgrade to double or triple occupancy?",
      answer: "Yes! Upgrades to Double or Triple occupancy are available upon request. Please select your occupancy preference or contact our support team during booking."
    },
    {
      question: "Are flights included in the CAD 12,995 price?",
      answer: "Yes, round-trip flights from Canada to Saudi Arabia are fully included in the package pricing."
    }
  ];
  const faqs = (detailData.faqs && detailData.faqs.length > 0) ? detailData.faqs : ((pkg.faqs && pkg.faqs.length > 0) ? pkg.faqs : defaultFaqs);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPriceStr = estimatedTotalFormatted ? `${currencyCode} ${estimatedTotalFormatted}` : `${currencyCode} ${price}`;
    const msg = `Hi King Travel! I want to book: ${title} (${formattedPriceStr}). Departure: ${departure}, Date: ${selectedDate || "Flexible"}, Package Type: ${effectivePackageType || "Standard"}.`;
    window.open(`https://wa.me/19056248344?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-[#faf7f2] w-full h-full min-h-screen animate-in fade-in duration-200">
      {/* Top Back Navigation Bar */}
      <div className="bg-[#00382B] text-white px-4 sm:px-8 py-3.5 flex justify-between items-center border-b border-emerald-900 sticky top-0 z-50 shadow-md">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-xs font-bold text-emerald-200 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-gold" />
          <span>← BACK TO PACKAGES</span>
        </button>
        <div className="text-xs font-extrabold text-gold uppercase tracking-widest hidden sm:block">
          KING TRAVEL • PACKAGE DETAILS VIEW
        </div>
        <button
          onClick={onClose}
          className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors cursor-pointer"
          title="Close Page"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto pb-16">
        {/* ================= HEADER BANNER ================= */}
        <div className="bg-primary text-white p-6 sm:p-10 md:p-14 relative overflow-hidden shadow-lg">
          <div className="max-w-4xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase text-white font-serif mb-2.5 leading-tight">
              {title}
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-emerald-200 uppercase mb-5">
              DURATION: {durationText}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-emerald-100">
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/20">
                <Plane className="w-4 h-4 text-gold" /> DEPARTURE: <strong className="text-white">{departure}</strong>
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3.5 py-2 rounded-xl border border-white/20">
                <Plane className="w-4 h-4 text-gold" /> DESTINATION: <strong className="text-white">{destination}</strong>
              </span>
            </div>
          </div>

          {/* Price Box Overlay on Right */}
          <div className="mt-8 md:mt-0 md:absolute md:top-10 md:right-14 bg-[#00382B]/90 border-2 border-dashed border-gold rounded-2xl p-5 text-center min-w-[220px] backdrop-blur-md shadow-xl">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gold block mb-1">
              {exclusiveBadge}
            </span>
            <div className="text-3xl font-black text-white font-serif">
              {currencyCode} {price}
            </div>
            <span className="text-[10px] font-medium text-emerald-200 uppercase tracking-wide block mt-1">
              {priceSubtext}
            </span>
          </div>
        </div>

        {/* ================= MAIN CONTENT BODY (2-COL GRID) ================= */}
        <div className="p-4 sm:p-8 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 items-start">

          {/* LEFT COLUMN: Accommodations, Overview, Highlights, Eligibility, FAQs */}
          <div className="lg:col-span-8 flex flex-col gap-10">            {/* 1. Premium Accommodations */}
            {(isMakkahVisible || isMadinahVisible || isAziziyaVisible || isMinaVisible) && (
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-800 mb-5 flex items-center gap-2">
                  Premium Accommodations
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Makkah Hotel Card */}
                  {isMakkahVisible && (
                    <div className="bg-white rounded-2xl overflow-hidden border border-emerald-100 shadow-md flex flex-col">
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
                          <div className="w-full h-full bg-emerald-900/10 flex items-center justify-center text-slate-400 text-xs">
                            No image available
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                          Makkah
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base line-clamp-1">{makkahName}</h4>
                          {makkahLoc && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span>{makkahLoc}</span>
                            </p>
                          )}
                        </div>
                        {(makkahBadge || isMakkahDurationVisible) && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                            {makkahBadge && (
                              <span className="bg-emerald-50 text-primary px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1 text-[11px]">
                                {makkahHotel?.badgeIcon ? <DynamicIcon name={makkahHotel.badgeIcon} className="w-3 h-3" /> : <Utensils className="w-3 h-3" />} {makkahBadge}
                              </span>
                            )}
                            {isMakkahDurationVisible && (
                              <span className="bg-slate-100 text-slate-600 capitalize px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1">
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
                  {isMadinahVisible && (
                    <div className="bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-md flex flex-col">
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
                        <span className="absolute top-3 left-3 bg-gold text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                          Madinah
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base line-clamp-1">{madinahName}</h4>
                          {madinahLoc && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-gold" />
                              <span>{madinahLoc}</span>
                            </p>
                          )}
                        </div>
                        {(madinahBadge || isMadinahDurationVisible) && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                            {madinahBadge && (
                              <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1 text-[11px]">
                                {madinahHotel?.badgeIcon ? <DynamicIcon name={madinahHotel.badgeIcon} className="w-3 h-3" /> : <Utensils className="w-3 h-3" />} {madinahBadge}
                              </span>
                            )}
                            {isMadinahDurationVisible && (
                              <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg capitalize text-[11px] flex items-center gap-1">
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

                  {/* Aziziya Hotel Card */}
                  {isAziziyaVisible && (
                    <div className="bg-white rounded-2xl overflow-hidden border border-emerald-100 shadow-md flex flex-col">
                      <div className="relative h-48 w-full bg-slate-200">
                        {aziziyaImg ? (
                          <Image
                            src={aziziyaImg}
                            alt={aziziyaName || "Aziziya Hotel"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-emerald-900/10 flex items-center justify-center text-slate-400 text-xs">
                            No image available
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                          Aziziya
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base line-clamp-1">{aziziyaName}</h4>
                          {aziziyaLoc && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-primary" />
                              <span>{aziziyaLoc}</span>
                            </p>
                          )}
                        </div>
                        {(aziziyaBadge || isAziziyaDurationVisible) && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                            {aziziyaBadge && (
                              <span className="bg-emerald-50 text-primary px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1 text-[11px]">
                                {aziziyaHotel?.badgeIcon ? <DynamicIcon name={aziziyaHotel.badgeIcon} className="w-3 h-3" /> : <Utensils className="w-3 h-3" />} {aziziyaBadge}
                              </span>
                            )}
                            {isAziziyaDurationVisible && (
                              <span className="bg-slate-100 text-slate-600 capitalize px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1">
                                {getDurationUnit(aziziyaNights) === 'days' ? (
                                  <Sun className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <MoonStar className="w-3 h-3 text-slate-600" />
                                )}
                                <span>{aziziyaNights}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mina Maktab / Hotel Card */}
                  {isMinaVisible && (
                    <div className="bg-white rounded-2xl overflow-hidden border border-amber-100 shadow-md flex flex-col">
                      <div className="relative h-48 w-full bg-slate-200">
                        {minaImg ? (
                          <Image
                            src={minaImg}
                            alt={minaName || "Mina Camp / Hotel"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-amber-900/10 flex items-center justify-center text-slate-400 text-xs">
                            No image available
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-gold text-slate-950 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                          Mina
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base line-clamp-1">{minaName}</h4>
                          {minaLoc && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-gold" />
                              <span>{minaLoc}</span>
                            </p>
                          )}
                        </div>
                        {(minaBadge || isMinaDurationVisible) && (
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-600">
                            {minaBadge && (
                              <span className="bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200/60 flex items-center gap-1 text-[11px]">
                                {minaHotel?.badgeIcon ? <DynamicIcon name={minaHotel.badgeIcon} className="w-3 h-3" /> : <Utensils className="w-3 h-3" />} {minaBadge}
                              </span>
                            )}
                            {isMinaDurationVisible && (
                              <span className="bg-slate-100 text-slate-600 px-2.5 py-1 capitalize rounded-lg text-[11px] flex items-center gap-1">
                                {getDurationUnit(minaNights) === 'days' ? (
                                  <Sun className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <MoonStar className="w-3 h-3 text-slate-600" />
                                )}
                                <span>{minaNights}</span>
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
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-800 mb-5">
                Package Overview
              </h3>
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
                {(!detailData.overview || detailData.overview.length === 0) ? (
                  <div className="text-sm text-slate-500">No overview data provided.</div>
                ) : (
                  detailData.overview.map((group: any, bIdx: number) => {
                    if (!group.groupTitle) return null;
                    const details = group.items ? group.items.filter(Boolean) : [];
                    return (
                      <div key={bIdx} className="relative pl-6 border-l-2 border-primary space-y-2">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-white" />
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {group.groupTitle}
                        </h4>
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
                  })
                )}
              </div>
            </div>

            {/* 3. Package Highlights & Eligibility (Side-by-Side Cards) */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-primary mb-5">
                Highlights & Eligibility
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Highlights */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md">
                  <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-500" /> Package Highlights
                  </h3>
                  <ul className="space-y-3">
                    {activeHighlights.map((hl: any, idx: number) => {
                      const isNotIncluded = hl.isCross;
                      return (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                          {isNotIncluded ? (
                            <span className="text-red-500 font-bold shrink-0 text-base leading-none">✕</span>
                          ) : (
                            <span className="text-amber-500 font-bold shrink-0 text-base leading-none">✦</span>
                          )}
                          <span className={isNotIncluded ? "text-red-500" : "font-medium"}>
                            {hl.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Eligibility Requirements */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-md">
                  <h3 className="text-lg font-bold font-serif text-slate-900 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" /> Eligibility Requirements
                  </h3>
                  <ul className="space-y-3">
                    {activeEligibility.map((el: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                        <span className="text-primary font-bold shrink-0 text-base leading-none">✓</span>
                        <span className="font-medium">{el}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. Important Booking Notice */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-5 sm:p-6 flex items-start gap-4 shadow-sm">
              <div className="p-2.5 bg-amber-500/10 rounded-xl shrink-0">
                <AlertCircle className="w-6 h-6 text-amber-700" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-amber-950 text-sm">Important Booking Notice</h4>
                <div
                  className="text-xs text-amber-900/80 leading-relaxed font-medium prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: importantNotice }}
                />
              </div>
            </div>

            {/* 5. Frequently Asked Questions (Accordion) */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-slate-800 mb-5 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
              </h3>
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
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
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
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

          </div>

          {/* RIGHT COLUMN: Operator Badge & Booking Form (Sticky Sidebar) */}
          <div className="lg:col-span-4 sticky top-20 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl space-y-6">

              {/* Operator Badge Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <h4 className="font-bold font-serif text-slate-900 text-lg">{operatorName}</h4>
                  <p className="text-xs text-slate-400 font-medium">{operatorReviews}</p>
                </div>
                <div className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span>{operatorRating}</span>
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                </div>
              </div>

              {/* Booking Input Form */}
              <form onSubmit={handleBookingSubmit} className="space-y-4">

                {/* Date Picker (Only for Umrah packages) */}
                {!isHajj && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Estimated Travel Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={selectedDate}
                        onClick={(e) => {
                          try {
                            (e.target as HTMLInputElement).showPicker?.();
                          } catch { }
                        }}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Package Type Dropdown (only if 2 or more package types) */}
                {packagePrices.length > 1 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Package Type
                    </label>
                    <div className="relative">
                      <select
                        value={effectivePackageType}
                        onChange={(e) => setSelectedPackageType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 pr-9 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                      >
                        {packagePrices.map((item, idx) => (
                          <option key={idx} value={item.packageType} className="bg-white text-slate-900">
                            CAD {item.price ? item.price.toLocaleString("en-CA") : ""} - {item.packageType}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Total Calculation Display */}
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Estimated Total</span>
                  <span className="text-xl font-black text-slate-900 font-serif">
                    {estimatedTotalFormatted ? `${currencyCode} ${estimatedTotalFormatted}` : "—"}
                  </span>
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  className="w-full bg-gold hover:bg-[#c48c26] text-slate-950 font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all duration-300 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Book {pkg.badgeTag || "Package"} Now</span>
                  <span className="group-hover:translate-x-1 transition-transform">➔</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center leading-normal pt-1">
                  *Hajj & Umrah Packages are subject to seat availability. Visa processing is included. Comprehensive medical insurance and Ahram Kit provided upon arrival.
                </p>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
