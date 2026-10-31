"use client";

import Image from 'next/image';
import Link from 'next/link';
import { normalizeFlightUrl } from '@/lib/flightUrl';
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
import PackageCustomizationCTA from '@/components/PackageCustomizationCTA';
import ContactInfoCardsSection from '@/components/ContactInfoCardsSection';
import ContactMapsSection from '@/components/ContactMapsSection';
import CertificationsFlipCardsSection from '@/components/CertificationsFlipCardsSection';
import SoldOutPackagesSection from '@/components/SoldOutPackagesSection';
import SoldOutHajjPackagesSection from '@/components/SoldOutHajjPackagesSection';
import SoldOutUmrahPackagesSection from '@/components/SoldOutUmrahPackagesSection';
import Banner4GridsSection from '@/components/Banner4GridsSection';
import HajjRegistrationForm from '@/components/HajjRegistrationForm';
import YosrAlMashaerHajjForm from '@/components/YosrAlMashaerHajjForm';
import UmrahRegistrationForm from '@/components/UmrahRegistrationForm';
import PackageBrochuresSection from '@/components/PackageBrochuresSection';
import GallerySection from '@/components/GallerySection';
import DynamicSiteForm from '@/components/DynamicSiteForm';
import PackageDetailBlocksSection from '@/components/PackageDetailBlocksSection';
import UmrahVisaVisaApplicationSection, { RequirementsContentSection, UmrahVisaOrderFormSection } from '@/components/UmrahVisaApplicationSection';
import UmrahVisaServicesOverviewSection from '@/components/UmrahVisaServicesOverviewSection';
import UmrahVisaDocumentGuideSection from '@/components/UmrahVisaDocumentGuideSection';
import FaqSection from '@/components/FaqSection';
import DestinationsGrid from '@/components/DestinationsGrid';
import LatestBlogsSection from '@/components/LatestBlogsSection';
import AvailableFlightsSection from '@/components/AvailableFlightsSection';
import AvailableSeatsSection from '@/components/AvailableSeatsSection';
import GuideSection from '@/components/GuideSection';
import FlightAccommodationSection from '@/components/FlightAccommodationSection';
import ProcessStepsSection from '@/components/ProcessStepsSection';
import GuideVideoSection from '@/components/GuideVideoSection';
import SafeRichText from '@/components/SafeRichText';
import ElegantTextSection from '@/components/ElegantTextSection';
import HotelDirectorySection from '@/components/HotelDirectorySection';
import PlanYourOwnPackageSection from '@/components/PlanYourOwnPackageSection';
import FlightEnquirySection from '@/components/FlightEnquirySection';
import CmsBasicSection from '@/components/CmsBasicSections';
import type { DirectoryCategory } from '@/lib/hotelSectionSelection';
import { useEffect, useRef, useState } from "react";
export default function PageSectionsRenderer({ sections, pageData, initialPackageData, initialDestinationData, initialBlogData, initialGuideData, publishedVisaCards, publishedSitePaths, initialHotelDirectory = [] }: { sections: any[], pageData?: any, initialPackageData?: any, initialDestinationData?: any[], initialBlogData?: any[], initialGuideData?: any[], publishedVisaCards?: { slug: string; title: string }[], publishedSitePaths?: string[], initialHotelDirectory?: DirectoryCategory[] }) {
  if (!sections || !Array.isArray(sections)) return null;

  const whoWeAreSection = sections.find((section: any) =>
    section && ["Who We Are", "Image+Text", "Intro"].includes(section.type)
  );
  const heroBackgroundImage = typeof whoWeAreSection?.data?.backgroundImage === "string"
    && whoWeAreSection.data.backgroundImage.trim()
    ? whoWeAreSection.data.backgroundImage.trim()
    : "";

  return (
    <div className="bht-public-sections w-full">
      {sections.map((sec: any, idx: number) => {
        if (!sec || !sec.type) return null;
        if (sec.hidden === true || sec.visible === false) return null;
        // Legacy custom-builder data is intentionally not rendered after removal.
        if (sec.type === 'Custom Layout Builder') return null;
        if (['Stats Grid','Intro','Image+Text','Intro (Text + Image)','Why Choose Us','Services Grid','Accreditations Bar','Badges Cards'].includes(sec.type)) {
          return <CmsBasicSection key={sec.id || idx} type={sec.type} data={sec.data || {}} />;
        }
        if (sec.type === 'Plan Your Own Package Form' || sec.type === 'Flight Enquiry Form') {
          const path = typeof pageData?.slug === 'string' ? pageData.slug : '/';
          const sourcePage = '/' + path.split('/').filter(Boolean).join('/');
          return sec.type === 'Plan Your Own Package Form'
            ? <PlanYourOwnPackageSection key={sec.id || idx} data={sec.data || {}} sourcePage={sourcePage} />
            : <FlightEnquirySection key={sec.id || idx} data={sec.data || {}} sourcePage={sourcePage} />;
        }
        if (sec.type === 'Makkah Hotels Directory' || sec.type === 'Madinah Hotels Directory') {
          return <HotelDirectorySection key={sec.id || idx} type={sec.type} data={sec.data || {}} categories={initialHotelDirectory} />;
        }
        if (sec.type === 'Umrah Enquiry 2026-27 Form') {
          const rawSlug = typeof pageData?.slug === 'string' ? pageData.slug : '/';
          const sourcePage = `/${rawSlug.split('/').filter(Boolean).join('/')}/`;
          return <UmrahRegistrationForm
            key={sec.id || idx}
            sourcePage={sourcePage}
            heading={typeof sec.data?.title === 'string' ? sec.data.title : undefined}
          />;
        }
        if (sec.type === 'YOSR Al Mashaer Hajj Form') {
          const rawSlug = typeof pageData?.slug === 'string' ? pageData.slug : '/';
          const sourcePage = `/${rawSlug.split('/').filter(Boolean).join('/')}/`;
          return <YosrAlMashaerHajjForm
            key={sec.id || idx}
            sourcePage={sourcePage}
            heading={typeof sec.data?.title === 'string' ? sec.data.title : undefined}
          />;
        }
        if (sec.type === 'Hajj 2027 Registration Form') {
          const rawSlug = typeof pageData?.slug === 'string' ? pageData.slug : '/';
          const sourcePage = `/${rawSlug.split('/').filter(Boolean).join('/')}/`;
          return <HajjRegistrationForm
            key={sec.id || idx}
            sourcePage={sourcePage}
            branded={sec.data?.branded === true}
            heading={typeof sec.data?.title === 'string' ? sec.data.title : undefined}
          />;
        }
        if (['Package Detail Blocks', 'Package Flight Details', 'Package Hotel Details', 'Package Occupancy Prices', 'Package Inclusions', 'Package Detail Gallery'].includes(sec.type)) {
          return <PackageDetailBlocksSection key={sec.id || idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Destinations Grid') {
          return <DestinationsGrid key={idx} destinations={initialDestinationData || []} title={sec.data?.title} />;
        }
        if (sec.type === 'Umrah Visa Application') {
          return <UmrahVisaVisaApplicationSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Umrah Visa Requirements') {
          return <RequirementsContentSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Umrah Visa Order Form') {
          return <UmrahVisaOrderFormSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Umrah Visa Services Overview') {
          return <UmrahVisaServicesOverviewSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Umrah Visa Document Guide') {
          return <UmrahVisaDocumentGuideSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Guide') {
          return <GuideSection key={idx} data={{ ...(sec.data || {}), guides: initialGuideData || [] }} />;
        }
        if (sec.type === 'Video') {
          return <GuideVideoSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'FAQ') {
          return <FaqSection key={idx} data={{ ...(sec.data || {}), title: sec.data?.heading || sec.data?.title }} />;
        }
        if (sec.type === 'Flight & Accommodation') {
          return <FlightAccommodationSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'ProcessStepsSection' || sec.type === 'Visa Process Steps' || sec.type === '3 Easy Steps') {
          return <ProcessStepsSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Latest Blogs Grid' || sec.type === 'Blog Posts Carousel') {
          return <LatestBlogsSection key={idx} data={sec.data || {}} blogs={initialBlogData || []} isHomepage={pageData?.slug === '/'} />;
        }
        if (sec.type === 'Package Brochure') {
          return <PackageBrochuresSection key={idx} data={sec.data || {}} pageData={pageData} />;
        }
        if (sec.type === 'Gallery') {
          return <GallerySection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'FAQ') {
          return <FaqSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Certifications Flip Cards' || sec.type === 'Our Certifications') {
          return <CertificationsFlipCardsSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Elegant Text Content') {
          return <ElegantTextSection key={sec.id || idx} data={sec.data || {}} />;
        }
        if (sec.type === 'Text Block (Rich Text)' || sec.type === 'Packages Content (Rich Text)') {
          let content: string = sec.data?.content || '';
          if (!content) return null;
          // SafeRichText normalizes legacy encoded markup and sanitizes it in
          // the browser. Do not blindly decode every HTML entity here.
          if (!content || content === '<p></p>') return null;

          const isPackagesPage = pageData?.slug === '/umrah-packages' || pageData?.slug === 'umrah-packages' || pageData?.slug === '/hajj-packages' || pageData?.slug === 'hajj-packages';

          if (isPackagesPage) {
            return (
              <section key={idx} className="pb-12 md:pt-16 md:pb-16 bg-blue-lt px-4">
                <div className="section-rich bg-white rounded-3xl p-4 md:p-8 max-w-[1360px] mx-auto w-full">
                  <SafeRichText html={content} className="max-w-none text-sm leading-relaxed" />
                </div>
              </section>
            );
          }

          return (
            <section key={idx} className="section-rich bg-white rounded-3xl p-4 md:p-8 max-w-[1400px] mx-auto w-full">
              <SafeRichText html={content} className="max-w-none text-sm leading-relaxed" />
            </section>
          );
        }

        if (sec.type === "Available Flights Grid" || sec.type === "Flights Cards") {
          return <AvailableFlightsSection key={idx} data={sec.data || {}} />;
        }
        if (sec.type === "Available Seats") {
          return <AvailableSeatsSection key={idx} data={sec.data || {}} />;
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
                <Link href={sec.data?.btnLink || "/contact"} className="inline-block bg-primary hover:bg-red text-white hover:text-slate-900 font-bold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm">
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
            <section key={idx} className={`relative z-10 w-full flex justify-center ${isFlightBookingPage ? "bg-blue-lt" : ""}`} suppressHydrationWarning>
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

        if (sec.type === 'Sold Out Hajj Packages' || sec.type === 'Sold Out Umrah Packages') {
          const initialSoldOut = initialPackageData?.soldOut
            ?? initialPackageData?.all?.filter((pkg: any) => pkg.status === 'sold_out');
          return sec.type === 'Sold Out Hajj Packages'
            ? <SoldOutHajjPackagesSection key={sec.id || idx} data={sec.data || {}} initialPackages={initialSoldOut} />
            : <SoldOutUmrahPackagesSection key={sec.id || idx} data={sec.data || {}} initialPackages={initialSoldOut} />;
        }

        if (sec.type === "Sold Out Packages") {
          // Always use the database sold_out status. Do not use legacy manual packageIds.
          const initialSoldOut = initialPackageData?.soldOut
            ?? initialPackageData?.all?.filter((pkg: any) => pkg.status === 'sold_out');
          return <SoldOutPackagesSection key={idx} data={sec.data} initialPackages={initialSoldOut} />;
        }

        // ── Testimonials ──────────────────────────────────────────────────────
        if (sec.type === "Testimonials") {
          return (
            <section key={idx} className="py-8 md:py-10 bg-primary">
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
                      src="/images_BHT/bht-fav-logo.png"
                      className="w-16 h-16 rounded-full p-2 bg-white object-cover"
                      alt="British Hajj Travel logo"
                    />
                    <div className="reviews-owner">
                      <b>British Hajj Travel Ltd - United Kingdom</b>
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
                      {sec.data?.reviewCount != null && <span className="review-count">{sec.data.reviewCount} Google reviews</span>}
                      {sec.data?.reviewLink && (
                        <a
                          href={sec.data.reviewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-fit inline-block border-red text-white bg-red font-bold text-xs px-5 py-2.5 rounded-full hover:border-red hover:text-red hover:bg-white transition-colors"
                        >
                          {sec.data?.ctaLabel || "Write A Review"}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-3/4 w-full min-w-0">
                    <GoogleReviewsSlider reviews={Array.isArray(sec.data?.reviews) ? sec.data.reviews : []} />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // ── Airlines / Hotels logo carousels ─────────────────────────────────
        if (sec.type === "Airlines" || sec.type === "Hotels") {
          let logos: { src: string; alt: string }[] = (sec.data?.logos || []).map((l: any) => ({
            src: l.src || "",
            alt: l.alt || "",
          }));

          const carouselType = sec.type === "Hotels" ? "hotel" : "airline";
          return (
            <section key={idx} className="py-12 bg-blue-lt">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center flex flex-col mb-8">
                  {sec.data?.eyebrow && (
                    <span className="eyebrow mx-auto">
                      {sec.data.eyebrow}
                    </span>
                  )}
                  <h2 className="section-heading font-serif text-primary font-normal">
                    {sec.data?.title || (sec.type === "Hotels" ? "Our Recommended Hotels" : "Airlines We Sourced Deals From")}
                  </h2>
                </div>
                {logos.length > 0 ? (
                  <MarqueeTrack
                    type={carouselType}
                    images={logos}
                    speedMs={sec.data?.speedMs || 30000}
                    direction={sec.data?.direction || "left"}
                  />
                ) : (
                  <p className="text-center text-slate-400 text-sm">No {sec.type === "Hotels" ? "hotel" : "airline"} logos configured yet.</p>
                )}
                {sec.data?.viewAllSlug && (
                  <div className="mt-7 text-center">
                    <Link href={normalizeFlightUrl(sec.data.viewAllSlug)} className="inline-flex rounded-full bg-red px-5 py-2.5 text-md font-bold text-white hover:text-white transition-colors hover:bg-red-lt mt-7 text-center">
                      {sec.data.viewAllLabel || "View All"}
                    </Link>
                  </div>
                )}
              </div>
            </section>
          );
        }

        // ── Airlines & Hotels combined two-column section ─────────────────────
        if (sec.type === "Airlines & Hotels") {
          let airlineLogos: { src: string; alt: string }[] = (sec.data?.airlineLogos || []).map((l: any) => ({
            src: l.src || "",
            alt: l.alt || "",
          }));
          let hotelLogos: { src: string; alt: string }[] = (sec.data?.hotelLogos || []).map((l: any) => ({
            src: l.src || "",
            alt: l.alt || "",
          }));

          return (
            <section key={idx} className="py-12 bg-blue-lt">
              <div className="max-w-[1400px] mx-auto px-5 md:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">

                  {/* ── Left: Airlines only ── */}
                  <div className="min-w-0 overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 md:p-8 flex flex-col">
                    <div className="text-center flex flex-col mb-6">
                      {sec.data?.airlineEyebrow && (
                        <span className="eyebrow mx-auto">
                          {sec.data.airlineEyebrow}
                        </span>
                      )}
                      <h2 className="section-heading font-serif text-primary font-normal">
                        {sec.data?.airlineTitle || "Airlines We Sourced Deals From"}
                      </h2>
                    </div>

                    <div
                      className="relative w-full min-w-0 max-w-full overflow-hidden isolate"
                      style={{ contain: "layout paint" }}
                    >
                      {airlineLogos.length > 0 ? (
                        <MarqueeTrack
                          type="airline"
                          images={airlineLogos}
                          speedMs={sec.data?.airlineSpeedMs || 30000}
                          direction={sec.data?.airlineDirection || "left"}
                        />
                      ) : (
                        <p className="text-center text-slate-400 text-sm">No airline logos configured yet.</p>
                      )}
                    </div>

                    {sec.data?.airlineViewAllSlug && (
                      <div className="text-center">
                        <Link href={normalizeFlightUrl(sec.data.airlineViewAllSlug)} className="inline-flex rounded-full bg-red px-5 py-2.5 text-md font-bold text-white hover:text-white transition-colors hover:bg-red-lt mt-7 text-center">
                          {sec.data.airlineViewAllLabel || "View All Flights"}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* ── Right: Hotels only ── */}
                  <div className="min-w-0 overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 md:p-8 flex flex-col">
                    <div className="text-center flex flex-col mb-6">
                      {sec.data?.hotelEyebrow && (
                        <span className="eyebrow mx-auto">
                          {sec.data.hotelEyebrow}
                        </span>
                      )}
                      <h2 className="section-heading font-serif text-primary font-normal">
                        {sec.data?.hotelTitle || "Our Recommended Hotels"}
                      </h2>
                    </div>

                    <div
                      className="relative w-full min-w-0 max-w-full overflow-hidden isolate"
                      style={{ contain: "layout paint" }}
                    >
                      {hotelLogos.length > 0 ? (
                        <MarqueeTrack
                          type="hotel"
                          images={hotelLogos}
                          speedMs={sec.data?.hotelSpeedMs || 30000}
                          direction={sec.data?.hotelDirection || "left"}
                        />
                      ) : (
                        <p className="text-center text-slate-400 text-sm">No hotel logos configured yet.</p>
                      )}
                    </div>

                    {sec.data?.hotelViewAllSlug && (
                      <div className="text-center">
                        <Link href={sec.data.hotelViewAllSlug} className="inline-flex rounded-full bg-red px-5 py-2.5 text-md font-bold text-white hover:text-white transition-colors hover:bg-red-lt mt-7 text-center">
                          {sec.data.hotelViewAllLabel || "View All Hotels"}
                        </Link>
                      </div>
                    )}
                  </div>

                </div>
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

          return (
            <section key={idx} className="py-12 bg-white">
              <div className="w-full mx-auto px-0">
                <div className="flex flex-col items-center text-center mb-8">
                  {sec.data?.eyebrow && (
                    <span className="eyebrow mx-auto">
                      {sec.data.eyebrow}
                    </span>
                  )}
                  <h2 className="section-heading text-primary font-normal">
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
                {sec.data?.viewAllSlug && (
                  <div className="mt-7 text-center">
                    <Link href={normalizeFlightUrl(sec.data.viewAllSlug)} className="inline-flex rounded-full bg-red px-5 py-2.5 text-md font-bold text-white hover:text-white transition-colors hover:bg-red-lt">
                      {sec.data.viewAllLabel || "View All"}
                    </Link>
                  </div>
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
          return <HomepageHeroBanner key={idx} data={sec.data} backgroundImage={heroBackgroundImage} pageData={pageData} publishedVisaCards={publishedVisaCards} publishedSitePaths={publishedSitePaths} />;
        }

        if (sec.type === "Who We Are") {
          return <WhoWeAreSection key={idx} data={sec.data} />;
        }

        if (sec.type === "Upcoming Umrah Packages" || sec.type === "Umrah Packages" || sec.type === "Umrah Packages Grid") {
          return <div key={idx}><UpcomingUmrahPackages data={sec.data} initialPackages={initialPackageData?.umrah} pageData={pageData} />{pageData?.slug === '/umrah-packages' && !sections.slice(0,idx).some((p:any)=>['Upcoming Umrah Packages','Umrah Packages','Umrah Packages Grid'].includes(p.type) && p.hidden !== true) && <PackageCustomizationCTA journey='umrah' />}</div>;
        }

        if (sec.type === "Travel Services" || sec.type === "Umrah Services Grid" || sec.type === "Hajj Services Grid") {
          return <TravelServicesSection key={idx} data={sec.data} />;
        }

        if (sec.type === "What We Provide") {
          return <WhatWeProvideSection key={idx} data={sec.data} />;
        }

        if (sec.type === "Hajj Packages" || sec.type === "Packages Grid") {
          return <div key={idx}><HajjPackagesSection data={sec.data} initialPackages={initialPackageData?.hajj} pageData={pageData} />{pageData?.slug === '/hajj-packages' && !sections.slice(0,idx).some((p:any)=>['Hajj Packages','Packages Grid'].includes(p.type) && p.hidden !== true) && <PackageCustomizationCTA journey='hajj' />}</div>;
        }

        if (sec.type === "Banner 4 Grids") {
          return <Banner4GridsSection key={idx} data={sec.data || {}} isInnerBanner={pageData?.slug !== '/'} />;
        }

        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[CMS] No frontend renderer for section type "${sec.type}" on ${pageData?.slug || 'unknown page'}`);
        }
        return null;
      })}
    </div>
  );
}

function GoogleReviewsSlider({ reviews }: { reviews: any[] }) {
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
    if (isPaused || expandedReviewId !== null || reviews.length === 0) return;
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

  if (!reviews.length) return <p className="text-sm text-white/80">No approved reviews configured.</p>;
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
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full hover:bg-red hover:text-white bg-white text-primary shadow-xl border border-primary flex items-center justify-center transition-all"
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
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full  hover:bg-red hover:text-white bg-white text-primary shadow-xl border border-primary flex items-center justify-center transition-all cursor-pointer"
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
