"use client";

import Image from 'next/image';
import Link from 'next/link';
import MarqueeTrack from '@/components/MarqueeTrack';
import DynamicIcon from '@/components/ui/DynamicIcon';
import ContactFormSection from '@/components/ContactFormSection';
import VisaSolutionsSection from '@/components/VisaSolutionsSection';
import HomepageHeroBanner from '@/components/HomepageHeroBanner';
import WhoWeAreSection from '@/components/WhoWeAreSection';
import UpcomingUmrahPackages from '@/components/UpcomingUmrahPackages';
import TravelServicesSection from '@/components/TravelServicesSection';
import WhatWeProvideSection from '@/components/WhatWeProvideSection';
import HajjPackagesSection from '@/components/HajjPackagesSection';
import ContactInfoCardsSection from '@/components/ContactInfoCardsSection';
import ContactMapsSection from '@/components/ContactMapsSection';
import CertificationsFlipCardsSection from '@/components/CertificationsFlipCardsSection';
import SoldOutPackagesSection from '@/components/SoldOutPackagesSection';
import Banner4GridsSection from '@/components/Banner4GridsSection';
import PackageBrochuresSection from '@/components/PackageBrochuresSection';
import DynamicSiteForm from '@/components/DynamicSiteForm';
import { RICH_TEXT_PROSE_CLASS } from '@/lib/richTextProseClass';
import { useEffect, useState } from "react";
export default function PageSectionsRenderer({ sections, pageData, initialPackageData }: { sections: any[], pageData?: any, initialPackageData?: any }) {
  if (!sections || !Array.isArray(sections)) return null;

  return (
    <div className="w-full">
      {sections.map((sec: any, idx: number) => {
        if (!sec || !sec.type) return null;
        if (sec.type === 'Package Brochure') {
          return <PackageBrochuresSection key={idx} data={sec.data || {}} pageData={pageData} />;
        }
        if (sec.type === 'Certifications Flip Cards' || sec.type === 'Our Certifications') {
          return <CertificationsFlipCardsSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Text Block (Rich Text)' || sec.type === 'Packages Content (Rich Text)') {
          let content: string = sec.data?.content || '';
          if (!content) return null;
          content = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, '\u00a0');
          // Ensure empty paragraphs (like those created by pressing Enter) don't collapse
          content = content.replace(/<p>\s*(?:<br\s*\/?>)?\s*<\/p>/gi, '<p>&nbsp;</p>');
          const innerM = content.match(/^<p>([\s\S]*)<\/p>$/);
          if (innerM) { const inner = innerM[1].trim(); if (/^<(h[1-6]|ul|ol|blockquote)/.test(inner)) content = inner; }
          if (!content || content === '<p></p>') return null;

          const isPackagesPage = pageData?.slug === '/umrah-packages' || pageData?.slug === 'umrah-packages' || pageData?.slug === '/hajj-packages' || pageData?.slug === 'hajj-packages';

          if (isPackagesPage) {
            return (
              <section key={idx} className="pb-12 md:pb-16 bg-sage px-4">
                <div className="section-rich bg-white rounded-3xl p-4 md:p-8 max-w-[1360px] mx-auto w-full">
                  <div
                    className={`${RICH_TEXT_PROSE_CLASS} max-w-none text-sm leading-relaxed`}
                    dangerouslySetInnerHTML={{ __html: content }}
                  />
                </div>
              </section>
            );
          }

          return (
            <section key={idx} className="section-rich bg-white rounded-3xl p-4 md:p-8 max-w-[1360px] mx-auto w-full">
              <div
                className={`${RICH_TEXT_PROSE_CLASS} max-w-none text-sm leading-relaxed`}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </section>
          );
        }

        if (sec.type === "Available Flights Grid" || sec.type === "Flights Cards") {
          const flights = (sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0)
            ? sec.data.items
            : [
              { code: "PIA", name: "Pakistan International Airlines", operatedBy: "Operated By PIA", originCode: "LHR", originCity: "London", destCode: "JED", destCity: "Jeddah", time: "14:20", price: "CAD 1,250.00" },
              { code: "SA", name: "Saudia Airlines", operatedBy: "Operated By Saudia", originCode: "LHR", originCity: "London", destCode: "MED", destCity: "Madinah", time: "18:45", price: "CAD 1,380.00" }
            ];

          return (
            <section key={idx} className="py-12 md:py-16 bg-sage">
              <div className="max-w-5xl mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-8">
                  <span className="eyebrow mx-auto block">
                    {sec.data?.eyebrow || "AVAILABLE FLIGHTS"}
                  </span>
                  <h2 className="section-heading font-serif tracking-tight">
                    {sec.data?.title || "BEST FARES, LIMITED AVAILABILITY FROM LONDON"}
                  </h2>
                </div>
                <div className="space-y-6">
                  {(sec.data?.items || [
                    { code: "PIA", name: "Pakistan International Airlines", operatedBy: "Operated By PIA", originCode: "LHR", originCity: "London", destCode: "JED", destCity: "Jeddah", time: "14:20", price: "CAD 1,250.00" },
                    { code: "SA", name: "Saudia Airlines", operatedBy: "Operated By Saudia", originCode: "LHR", originCity: "London", destCode: "MED", destCity: "Madinah", time: "18:45", price: "CAD 1,380.00" }
                  ]).map((flight: any, fIdx: number) => (
                    <div
                      key={fIdx}
                      className="bg-white shadow-lg rounded-2xl border border-gray-200/60 p-6 md:p-8 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
                        {/* Left: Airline Info */}
                        <div className="flex items-center gap-4 min-w-[280px]">
                          {flight.logo ? (
                            <div className="w-[54px] h-[44px] relative rounded overflow-hidden shadow-sm shrink-0">
                              <Image src={flight.logo} alt={flight.name || "Airline Logo"} fill className="object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="bg-emerald-900 text-white font-bold px-3 py-2 rounded text-base tracking-wide flex items-center justify-center min-w-[54px] h-[44px]">
                              {flight.code || "PIA"}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-gray-900 text-lg">{flight.name}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{flight.operatedBy || "Operated By PIA"}</p>
                          </div>
                        </div>

                        {/* Middle: Route & Times */}
                        <div className="flex flex-1 items-center justify-between max-w-md mx-auto w-full px-2">
                          <div className="text-center md:text-left">
                            <span className="block text-2xl font-bold text-gray-900">{flight.originCode || "LHR"}</span>
                            <span className="text-xs text-gray-400 font-medium">{flight.originCity || "London"}</span>
                          </div>

                          <div className="flex-1 flex items-center justify-center px-4 relative">
                            <div className="w-full border-t border-dashed border-gray-300 absolute"></div>
                            <div className="bg-gray-100 px-2 z-10 rounded-full py-1">
                              <i className="fa-solid fa-plane text-gold text-sm rotate-320"></i>
                            </div>
                          </div>

                          <div className="text-center md:text-left">
                            <span className="block text-2xl font-bold text-gray-900">{flight.destCode || "JED"}</span>
                            <span className="text-xs text-gray-400 font-medium">{flight.destCity || "Jeddah"}</span>
                          </div>

                          <div className="h-8 border-l border-gray-300 mx-6 hidden md:block"></div>

                          <div className="text-center ml-2 md:ml-0 md:text-left">
                            <span className="block text-[16px] md:text-xl font-bold text-gray-900">{flight.time || "14:20"}</span>
                            <span className="text-xs text-gray-400 font-medium uppercase">{flight.timeOriginCode || flight.originCode || "LHR"}</span>
                          </div>
                        </div>

                        {/* Right: Pricing & CTA */}
                        <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-0 pt-4 md:pt-0 border-gray-200">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 block md:hidden">Price</span>
                            <span suppressHydrationWarning className="whitespace-nowrap text-[16px] md:whitespace-normal md:text-2xl font-bold text-gray-900">{flight.price || "CAD 1,250.00"}</span>
                          </div>
                          <a
                            href={flight.bookingUrl || `https://wa.me/19056248344?text=Hi,%20I'm%20interested%20in%20booking%20this%20flight%20(${encodeURIComponent(flight.name || "PIA")})`}
                            target={pageData?.slug === "/cheap-flights-air-tickets" || pageData?.slug === "cheap-flights-air-tickets" ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            suppressHydrationWarning
                            className="bg-primary text-white hover:bg-primary-light font-bold py-3 px-6 md:px-8 rounded-md tracking-wide shadow-sm transition-all duration-150 cursor-pointer text-sm w-full md:w-auto inline-block text-center"
                          >
                            Booking
                          </a>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-300/80 pt-4 text-right">
                        <span className="text-xs font-medium text-gray-500">{flight.priceSubtext || "Price Per Person (Incl. Taxes & Fees)"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (sec.type === "Flight Assistance CTA" || sec.type === "Flight Desk CTA") {
          return (
            <section key={idx} className="tint mt-12 py-20">
              <div className="wrap text-center max-w-3xl mx-auto px-4">
                <h2 className=" mb-4">
                  {sec.data?.title || "Need Flight Booking Assistance?"}
                </h2>
                <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed font-light">
                  {sec.data?.description || "Speak directly with our ticketing specialists to get custom quotes, group flight discounts, and immediate confirmations."}
                </p>
                <Link href={sec.data?.btnLink || "/contact"} className="inline-block bg-primary hover:bg-gold text-white hover:text-slate-900 font-bold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm">
                  {sec.data?.btnLabel || "Contact Flight Desk"}
                </Link>
              </div>
            </section>
          );
        }

        const isDynamicForm = ["Quote Form", "Package Inquiry Form", "Package Detail Form", "Visa Consultation Form", "Flight Booking Form", "Contact Us Form", "Drop Us A Message Form"].includes(sec.type);
        if (isDynamicForm) {
          const formKeyMap: Record<string, string> = {
            "Quote Form": "quoteForm",
            "Package Inquiry Form": "packageInquiry",
            "Package Detail Form": "packageDetailForm",
            "Visa Consultation Form": "visaConsultation",
            "Flight Booking Form": "flightInquiry",
            "Contact Us Form": "contact",
            "Drop Us A Message Form": "dropUsMessage"
          };
          const isFlightBookingPage = pageData?.slug === "/airline-tickets-booking" || pageData?.slug === "airline-tickets-booking";
          const formKey = formKeyMap[sec.type];
          return (
            <section key={idx} className={`relative z-10 w-full flex justify-center ${isFlightBookingPage ? "bg-sage" : ""}`} suppressHydrationWarning>
              <DynamicSiteForm
                formKey={formKey}
                bgColor={isFlightBookingPage ? "transparent" : sec.data?.bgColor}
                forceNoPadding={isFlightBookingPage}
                cardContainer={isFlightBookingPage}
                maxWidth={sec.data?.maxWidth}
                eyebrow={sec.data?.eyebrow}
                title={sec.data?.title}
                description={sec.data?.description}
              />
            </section>
          );
        }

        if (sec.type === "Sold Out Packages") {
          const ids = Array.isArray(sec.data?.packageIds) ? sec.data.packageIds.map(Number).filter(Boolean) : [];
          let initialSoldOut = undefined;
          if (initialPackageData?.all) {
            initialSoldOut = ids.length > 0
              ? ids.map((id: number) => initialPackageData.all?.find((pkg: any) => Number(pkg.id) === id)).filter(Boolean)
              : initialPackageData.all.filter((pkg: any) => pkg.status === 'sold_out');
          }
          return <SoldOutPackagesSection key={idx} data={sec.data} initialPackages={initialSoldOut} />;
        }

        // ── Testimonials ──────────────────────────────────────────────────────
        if (sec.type === "Testimonials") {
          return (
            <section key={idx} className="py-12 md:py-16 bg-primary">
              <div className="max-w-[1400px] mx-auto px-5">
                <div className="text-center flex flex-col mb-10">
                  {sec.data?.eyebrow && (
                    <span className="eyebrow mx-auto">
                      {sec.data.eyebrow}
                    </span>
                  )}
                  <h2 className="text-3xl md:text-4xl font-serif text-white font-normal">
                    {sec.data?.title || "What our clients say"}
                  </h2>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
                  <div className="reviews-owner-details">
                    <img
                      src="/img/round-logo.png"
                      className="w-16 h-16 rounded-full border border-white/20 object-cover"
                      alt="King Travel logo"
                    />
                    <div className="reviews-owner">
                      <b>King Travel Can Ltd - Mississauga</b>
                      <div className="stars">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="lucide lucide-star"
                        >
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="lucide lucide-star"
                        >
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="lucide lucide-star"
                        >
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                          className="lucide lucide-star"
                        >
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="100%" height="100%" viewBox="0 0 16 15" version="1.1" xmlSpace="preserve" strokeMiterlimit="2" style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round' }}>
                          <g transform="matrix(1,0,0,1,-447.393,-260.031)">
                            <g transform="matrix(1.01647,0,0,1.01647,4.97715,-123.684)">
                              <path
                                d="M442.928,389.411C442.802,389.411 442.68,389.451 442.578,389.525L439.127,392.034C438.852,392.234 438.48,392.234 438.205,392.034C437.929,391.834 437.814,391.48 437.92,391.156L439.239,387.099C439.278,386.98 439.278,386.851 439.239,386.731C439.201,386.612 439.125,386.508 439.023,386.434L435.571,383.927C435.296,383.727 435.18,383.373 435.285,383.05C435.391,382.726 435.692,382.507 436.032,382.507L440.298,382.509C440.424,382.509 440.547,382.469 440.648,382.395C440.75,382.321 440.826,382.217 440.864,382.098L442.181,378.04C442.286,377.716 442.588,377.497 442.928,377.497L442.928,389.411Z"
                                style={{ fill: 'rgb(246,187,6)' }}
                              />
                            </g>
                            <g transform="matrix(-1.01647,0,0,1.01647,905.424,-123.684)">
                              <path
                                d="M442.928,389.411C442.802,389.411 442.68,389.451 442.578,389.525L439.127,392.034C438.852,392.234 438.48,392.234 438.205,392.034C437.929,391.834 437.814,391.48 437.92,391.156L439.239,387.099C439.278,386.98 439.278,386.851 439.239,386.731C439.201,386.612 439.125,386.508 439.023,386.434L435.571,383.927C435.296,383.727 435.18,383.373 435.285,383.05C435.391,382.726 435.692,382.507 436.032,382.507L440.298,382.509C440.424,382.509 440.547,382.469 440.648,382.395C440.75,382.321 440.826,382.217 440.864,382.098L442.181,378.04C442.286,377.716 442.588,377.497 442.928,377.497L442.928,389.411Z"
                                style={{ fill: 'rgb(204,204,204)' }}
                              />
                            </g>
                          </g>
                        </svg>
                      </div>
                      <span className="review-count">{sec.data?.reviewCount || "942"} Google reviews</span>
                      {sec.data?.reviewLink && (
                        <a
                          href={sec.data.reviewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-fit inline-block border border-white/40 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors"
                        >
                          {sec.data?.ctaLabel || "Write A Review"}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-3/4 w-full min-w-0">
                    <GoogleReviewsSlider />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ── Airlines ──────────────────────────────────────────────────────────
        if (sec.type === "Airlines") {
          let logos: { src: string; alt: string }[] = (sec.data?.logos || []).map((l: any) => ({
            src: l.src || "",
            alt: l.alt || "",
          }));

          if (logos.length === 0) {
            logos = [
              { src: '/img/a-1.png', alt: 'Saudi Airlines' },
              { src: '/img/a-2.png', alt: 'Emirates' },
              { src: '/img/a-3.png', alt: 'Qatar Airways' },
              { src: '/img/a-4.png', alt: 'Turkish Airlines' },
              { src: '/img/a-5.png', alt: 'Etihad Airways' },
              { src: '/img/a-6.png', alt: 'EgyptAir' },
              { src: '/img/a-7.png', alt: 'Royal Jordanian' },
              { src: '/img/a-8.png', alt: 'Gulf Air' },
              { src: '/img/a-9.png', alt: 'Air Canada' },
            ];
          }
          return (
            <section key={idx} className="py-12">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center flex flex-col mb-8">
                  {sec.data?.eyebrow && (
                    <span className="eyebrow mx-auto">
                      {sec.data.eyebrow}
                    </span>
                  )}
                  <h2 className="section-heading font-serif text-ink font-normal">
                    {sec.data?.title || "Airlines We Sourced Deals From"}
                  </h2>
                </div>
                {logos.length > 0 ? (
                  <MarqueeTrack
                    type="airline"
                    images={logos}
                    speedMs={sec.data?.speedMs || 30000}
                    direction={sec.data?.direction || "left"}
                  />
                ) : (
                  <p className="text-center text-red-600 font-semibold text-base">No Airline Logos Configured Yet.</p>
                )}
              </div>
            </section>
          );
        }

        // ── Travel Organization ───────────────────────────────────────────────
        if (sec.type === "Travel Organization") {
          let logos: { src: string; alt: string }[] = (sec.data?.logos || []).map((l: any) => ({
            src: l.src || "",
            alt: l.alt || "",
          }));

          if (logos.length === 0) {
            logos = [
              { src: '/img/orgs/acta.jpg', alt: 'ACTA' },
              { src: '/img/orgs/tico.png', alt: 'TICO' },
              { src: '/img/orgs/IATA-Logo.png', alt: 'IATA' },
              { src: '/img/orgs/sata.png', alt: 'SATA' },
              { src: '/img/orgs/hajj.png', alt: 'Ministry of Hajj' },
              { src: '/img/orgs/atac.png', alt: 'ATAC' },
              { src: '/img/orgs/asta.png', alt: 'ASTA' },
            ];
          }
          return (
            <section key={idx} className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-8">
                  {sec.data?.eyebrow && (
                    <span className="eyebrow mx-auto">
                      {sec.data.eyebrow}
                    </span>
                  )}
                  <h2 className="section-heading font-normal">
                    {sec.data?.title || "Trusted Travel Organizations"}
                  </h2>
                </div>
                {logos.length > 0 ? (
                  <MarqueeTrack
                    type="travel"
                    images={logos}
                    speedMs={sec.data?.speedMs || 30000}
                    direction={sec.data?.direction || "left"}
                    cardStyle={true}
                  />
                ) : (
                  <p className="text-center text-slate-400 text-sm">No organization logos configured yet.</p>
                )}
              </div>
            </section>
          );
        }

        // ── Visa Solutions ───────────────────────────────────────────────────
        if (sec.type === 'Visa Solutions' || sec.type === 'Visa Solutions Grid' || sec.type === 'Visa Cards') {
          return <VisaSolutionsSection key={idx} data={sec.data} />;
        }

        // ── Contact ───────────────────────────────────────────────────────────
        if (sec.type === "Contact Info Cards" || sec.type === "Contact Bar") {
          return <ContactInfoCardsSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === "Contact Maps" || sec.type === "Google Maps") {
          return <ContactMapsSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === "Contact Form" || sec.type === "Contact Form + Maps" || sec.type === "Contact") {
          return <ContactFormSection key={idx} data={sec.data || {}} />;
        }

        if (sec.type === "Homepage Hero Banner" || sec.type === "Hero Slider") {
          return <HomepageHeroBanner key={idx} data={sec.data} pageData={pageData} />;
        }

        if (sec.type === "Who We Are" || sec.type === "Image+Text" || sec.type === "Intro") {
          return <WhoWeAreSection key={idx} data={sec.data} />;
        }

        if (sec.type === "Upcoming Umrah Packages" || sec.type === "Umrah Packages" || sec.type === "Umrah Packages Grid") {
          return <UpcomingUmrahPackages key={idx} data={sec.data} initialPackages={initialPackageData?.umrah} pageData={pageData} />;
        }

        if (sec.type === "Travel Services" || sec.type === "Services Grid" || sec.type === "Umrah Services Grid" || sec.type === "Hajj Services Grid") {
          return <TravelServicesSection key={idx} data={sec.data} />;
        }

        if (sec.type === "What We Provide" || sec.type === "Why Choose Us" || sec.type === "Stats Grid" || sec.type === "Accreditations Bar") {
          return <WhatWeProvideSection key={idx} data={sec.data} />;
        }

        if (sec.type === "Hajj Packages" || sec.type === "Packages Grid") {
          return <HajjPackagesSection key={idx} data={sec.data} initialPackages={initialPackageData?.hajj} pageData={pageData} />;
        }

        if (sec.type === "Banner 4 Grids") {
          return <Banner4GridsSection key={idx} data={sec.data || {}} />;
        }

        // Return null for any unmapped sections
        return null;
      })}
    </div>
  );
}

function GoogleReviewsSlider() {
  const reviews = [
    {
      id: 1,
      name: "Tiha",
      avatarImg: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "3 months ago",
      review: "I am grateful Elhamdullilahi for this wonderful opportunity to preform Umrah on March 2026 with King Travel, also with huge support from our Imam. Everything was organized with great care, respect, and utmost professionalism from our initial flight departure up to our blessed return home to Canada.",
    },
    {
      id: 2,
      name: "Nimrah Suhaib",
      avatarImg: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "3 months ago",
      review: "We're so glad we booked our Umrah trip from King Travel. Mr. Jamil Latif provided exceptional service, prompt responses, and great hotel options near Haram. He went above and beyond to make sure our family had everything sorted from visa approvals to 24/7 on-ground assistance.",
    },
    {
      id: 3,
      name: "Dina",
      avatarImg: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "3 months ago",
      review: "Assalamu alaikum ❤️ I would like to sincerely thank King Travel for organizing such a smooth and blessed pilgrimage for my entire family. Our hotel rooms in Makkah and Madinah were spotless and right opposite the Haram gate, which made our daily prayers very convenient.",
    },
    {
      id: 4,
      name: "Tariq Mahmood",
      avatarImg: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "2 weeks ago",
      review: "Alhamdulillah! Booked our 15-day Deluxe Umrah package with King Travel Canada. Everything from the 5-star hotel near Haram to the luxury private transport was top-notch. Highly recommended for families looking for a stress-free experience!",
    },
    {
      id: 5,
      name: "Fatima Al-Zahra",
      avatarImg: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "a month ago",
      review: "The staff at King Travel Mississauga went above and beyond for our Saudi tourist visas and flight booking. Brother Imran answered all our late night questions patiently. May Allah bless your team for making our journey seamless.",
    },
    {
      id: 6,
      name: "Mohammad S. Khan",
      avatarImg: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "3 weeks ago",
      review: "Excellent service from start to finish! Our hotels in Makkah (Fairmont) and Madinah (Dar Al Taqwa) were literally steps away from the Haram courtyard. The historical Ziyarat tours were also very well guided with knowledgeable scholars.",
    },
    {
      id: 7,
      name: "Farhan Qureshi",
      avatarImg: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "1 month ago",
      review: "Transparent pricing with no hidden charges. Visa processing was done within 24 hours. The entire King Travel team in Mississauga is trustworthy and professional. 5 stars all the way for their honesty and dedication!",
    },
    {
      id: 8,
      name: "Zainab Rehman",
      avatarImg: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "2 months ago",
      review: "Best travel agency in Ontario for Hajj and Umrah. They kept us updated on flight schedules and provided proper training and guidance booklets before our departure. 10/10 service from their courteous representatives.",
    },
    {
      id: 9,
      name: "Bilal Ahmad",
      avatarImg: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&h=120&q=80",
      rating: 5,
      date: "2 months ago",
      review: "I have booked my Umrah with King Travel twice now. Both times the hotel vouchers, flights, and ground transportation were ready ahead of time. Reliable, honest, and caring team that treats you like family.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll 1 by 1 card every 5000ms (5 seconds)
  useEffect(() => {
    if (isPaused || expandedReviewId !== null) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, expandedReviewId, reviews.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  return (
    <div
      className="relative w-full px-4 md:px-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Floating Circular Prev Button */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Review"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-primary shadow-xl border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      {/* Floating Circular Next Button */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Review"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white text-primary shadow-xl border border-slate-200/80 flex items-center justify-center transition-all cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>

      {/* Reviews Cards Carousel (1-by-1 Slide) */}
      <div className="overflow-hidden rounded-3xl py-2">
        <div
          className="flex items-start transition-transform duration-700 ease-in-out gap-4"
          style={{
            transform: isMobile
              ? `translateX(calc(-${currentIndex} * (100% + 16px)))`
              : `translateX(calc(-${currentIndex} * (100% / 3 + 5.33px)))`,
          }}
        >
          {/* Render doubled reviews for continuous wrap-around carousel */}
          {[...reviews, ...reviews].map((r, idx) => {
            const isExpanded = expandedReviewId === r.id;

            return (
              <div
                key={`${r.id}-${idx}`}
                className="w-full sm:w-[calc((100%-32px)/3)] shrink-0 min-w-0 flex items-start"
              >
                <div
                  className={`w-full bg-white rounded-3xl p-6 shadow-md flex flex-col justify-between border border-slate-100/90 hover:shadow-xl transition-all duration-300 ${isExpanded ? "min-h-[235px] shadow-2xl z-10" : "h-[235px]"
                    }`}
                >
                  <div>
                    {/* User Header */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={r.avatarImg}
                          alt={r.name}
                          className="w-10 h-10 rounded-full object-cover shadow-xs border border-slate-200/80 shrink-0"
                        />
                        <div>
                          <h4 className="text-[14px] font-bold text-slate-900 leading-tight m-0 font-sans">{r.name}</h4>
                          <span className="text-xs text-slate-400 font-medium">{r.date}</span>
                        </div>
                      </div>
                      {/* Google Official Icon Badge */}
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    </div>

                    {/* Stars + Blue Verified Tick Badge */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, sIdx) => (
                          <svg
                            key={sIdx}
                            className="w-4 h-4 fill-amber-400 text-amber-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      {/* Blue Verified Checkmark Badge */}
                      <svg className="w-4 h-4 text-blue-500 fill-blue-500 ml-0.5" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>

                    {/* Review Text */}
                    <p
                      className={`text-[15px] text-slate-700 leading-relaxed m-0 font-normal ${isExpanded ? "" : "line-clamp-3"
                        }`}
                    >
                      {r.review}
                    </p>
                  </div>

                  {/* Read more / Read less Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedReviewId(isExpanded ? null : r.id)}
                      className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer font-medium transition-colors bg-transparent border-none p-0 inline-flex items-center gap-1"
                    >
                      {isExpanded ? "Read less" : "Read more"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
