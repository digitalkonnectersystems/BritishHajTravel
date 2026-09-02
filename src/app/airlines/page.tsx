'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import MarqueeTrack from "@/components/MarqueeTrack";
import PageBanner from "@/components/PageBanner";
import { getPageBySlug } from "@/actions/pageActions";

const airlineLogos = [
  { src: "/img/a-1.png", alt: "Saudi Airlines" },
  { src: "/img/a-2.png", alt: "Emirates" },
  { src: "/img/a-3.png", alt: "Qatar Airways" },
  { src: "/img/a-4.png", alt: "Turkish Airlines" },
  { src: "/img/a-5.png", alt: "Etihad Airways" },
  { src: "/img/a-6.png", alt: "EgyptAir" },
  { src: "/img/a-7.png", alt: "Royal Jordanian" },
  { src: "/img/a-8.png", alt: "Gulf Air" },
  { src: "/img/a-9.png", alt: "Air Canada" },
];

const defaultFlights = [
  {
    code: "PIA",
    name: "Pakistan International Airlines",
    operatedBy: "Operated By PIA",
    originCode: "LHR",
    originCity: "London",
    destCode: "JED",
    destCity: "Jeddah",
    time: "14:20",
    price: "CAD 1,250.00",
  },
  {
    code: "PIA",
    name: "Pakistan International Airlines",
    operatedBy: "Operated By PIA",
    originCode: "LHR",
    originCity: "London",
    destCode: "JED",
    destCity: "Jeddah",
    time: "14:20",
    price: "CAD 1,250.00",
  },
  {
    code: "PIA",
    name: "Pakistan International Airlines",
    operatedBy: "Operated By PIA",
    originCode: "LHR",
    originCity: "London",
    destCode: "JED",
    destCity: "Jeddah",
    time: "14:20",
    price: "CAD 1,250.00",
  },
];

export default function AirlinesPage() {
  const [pageData, setPageData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    getPageBySlug('/airlines').then(p => {
      if (p) {
        setPageData(p);
        if (p.sections) {
          try {
            const parsed = JSON.parse(p.sections);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSections(parsed);
            }
          } catch (e) {
            console.error("Error parsing airlines page sections:", e);
          }
        }
      }
    });
  }, []);

  return (
    <main className="bg-sage min-h-screen">
      {/* ================= DYNAMIC HERO BANNER ================= */}
      <PageBanner
        title={pageData?.bannerTitle || pageData?.title || "Find <span>Lowest Fare</span> Flights & Book Airline Tickets Across Canada"}
        description={pageData?.bannerDescription || "Compare flight prices, discover exclusive travel deals, and book domestic & international air tickets with ease. Fast booking, trusted fares, and 24/7 travel support."}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
      />

      {/* ================= DYNAMIC SECTIONS OR FALLBACK ================= */}
      {(() => {
        const handledTypes = ["Available Flights Grid", "Flights Cards", "Airlines Marquee", "Partners Marquee", "Logo Carousel", "Airlines Logo Carousel", "Flight Assistance CTA", "Flight Desk CTA"];
        const unhandledSections = sections.filter(s => !handledTypes.includes(s.type));

        return (
          <>
            {sections.length > 0 ? (
              sections.map((sec: any, idx: number) => {
                if (sec.type === "Available Flights Grid" || sec.type === "Flights Cards") {
                  const flights = (sec.data?.items && Array.isArray(sec.data.items) && sec.data.items.length > 0)
                    ? sec.data.items
                    : defaultFlights;

                  return (
                    <section key={idx} className="pt-14">
                      <div className="max-w-5xl mx-auto px-4">
                        <div className="text-center mb-8">
                          <span className="text-emerald-800 font-semibold uppercase tracking-wider text-sm block mb-1">
                            {sec.data?.eyebrow || "AVAILABLE FLIGHTS"}
                          </span>
                          <h2 className="text-3xl font-serif text-gray-900 tracking-tight">
                            {sec.data?.title || "BEST FARES, LIMITED AVAILABILITY FROM LONDON"}
                          </h2>
                        </div>

                        <div className="space-y-6 mb-12">
                          {flights.map((flight: any, fIdx: number) => (
                            <div
                              key={fIdx}
                              className="bg-white shadow-lg rounded-2xl border border-gray-200/60 p-6 md:p-8 hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
                                {/* Left: Airline Info */}
                                <div className="flex items-center gap-4 min-w-[280px]">
                                  <div className="bg-emerald-900 text-white font-bold px-3 py-2 rounded text-base tracking-wide flex items-center justify-center min-w-[54px] h-[44px]">
                                    {flight.code || "PIA"}
                                  </div>
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
                                      <i className="fa-solid fa-plane text-sky-400 text-sm rotate-45"></i>
                                    </div>
                                  </div>

                                  <div className="text-center md:text-left">
                                    <span className="block text-2xl font-bold text-gray-900">{flight.destCode || "JED"}</span>
                                    <span className="text-xs text-gray-400 font-medium">{flight.destCity || "Jeddah"}</span>
                                  </div>

                                  <div className="h-8 border-l border-gray-300 mx-6 hidden md:block"></div>

                                  <div className="text-center md:text-left">
                                    <span className="block text-xl font-bold text-gray-900">{flight.time || "14:20"}</span>
                                    <span className="text-xs text-gray-400 font-medium">{flight.originCode || "LHR"}</span>
                                  </div>
                                </div>

                                {/* Right: Pricing & CTA */}
                                <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-0 pt-4 md:pt-0 border-gray-200">
                                  <div>
                                    <span className="text-xs font-semibold text-gray-500 block md:hidden">Price</span>
                                    <span suppressHydrationWarning className="text-2xl font-bold text-gray-900">{flight.price || "CAD 1,250.00"}</span>
                                  </div>
                                  <a
                                    href={`https://wa.me/19056248344?text=Hi,%20I'm%20interested%20in%20booking%20this%20flight%20(${encodeURIComponent(flight.name)})`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    suppressHydrationWarning
                                    className="bg-emerald-900 text-white hover:bg-gold hover:text-slate-900 font-bold py-3 px-8 rounded-md tracking-wide shadow-sm transition-all duration-150 cursor-pointer text-sm w-full md:w-auto inline-block text-center"
                                  >
                                    Booking
                                  </a>
                                </div>
                              </div>

                              <div className="border-t border-dashed border-gray-300/80 pt-4 text-right">
                                <span className="text-xs font-medium text-gray-500">Price Per Person (Incl. Taxes &amp; Fees)</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  );
                }

                if (sec.type === "Airlines Marquee" || sec.type === "Partners Marquee" || sec.type === "Logo Carousel" || sec.type === "Airlines Logo Carousel") {
                  return (
                    <section key={idx} id="flights" className="py-12 bg-white">
                      <div className="wrap">
                        <div className="section-head center text-center mb-8">
                          <div className="eyebrow uppercase text-xs font-bold tracking-widest text-gold justify-center mb-1">
                            {sec.data?.eyebrow || "OUR TRUSTED PARTNERS"}
                          </div>
                          <h2 className="">
                            {sec.data?.title || "Airlines We Sourced Deals From"}
                          </h2>
                        </div>
                      </div>
                      <MarqueeTrack
                        type="airline"
                        images={(sec.data?.logos && Array.isArray(sec.data.logos) && sec.data.logos.length > 0) ? sec.data.logos : airlineLogos}
                        speedMs={sec.data?.speedMs}
                        direction={sec.data?.direction}
                      />
                    </section>
                  );
                }

                if (sec.type === "Flight Assistance CTA" || sec.type === "Flight Desk CTA") {
                  return (
                    <section key={idx} className="tint mt-12 py-20 bg-emerald-50/60 border-t border-emerald-100">
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

                return null;
              })
            ) : (
              <>
                <section className="pt-14 bg-sage">
                  <div className="max-w-5xl mx-auto px-4">
                    <div className="text-center mb-8">
                      <span className="text-emerald-800 font-semibold uppercase tracking-wider text-sm block mb-1">Available Flights</span>
                      <h2 className="text-3xl font-serif text-gray-900 tracking-tight">BEST FARES, LIMITED AVAILABILITY FROM LONDON</h2>
                    </div>
                    <div className="space-y-6 mb-12">
                      {defaultFlights.map((flight, idx) => (
                        <div key={idx} className="bg-white shadow-lg rounded-2xl border border-gray-200/60 p-6 md:p-8 hover:shadow-md transition-shadow duration-200">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
                            <div className="flex items-center gap-4 min-w-[280px]">
                              <div className="bg-emerald-900 text-white font-bold px-3 py-2 rounded text-base tracking-wide flex items-center justify-center min-w-[54px] h-[44px]">{flight.code}</div>
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">{flight.name}</h4>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">{flight.operatedBy}</p>
                              </div>
                            </div>
                            <div className="flex flex-1 items-center justify-between max-w-md mx-auto w-full px-2">
                              <div className="text-center md:text-left"><span className="block text-2xl font-bold text-gray-900">{flight.originCode}</span><span className="text-xs text-gray-400 font-medium">{flight.originCity}</span></div>
                              <div className="flex-1 flex items-center justify-center px-4 relative"><div className="w-full border-t border-dashed border-gray-300 absolute"></div><div className="bg-gray-100 px-2 z-10 rounded-full py-1"><i className="fa-solid fa-plane text-sky-400 text-sm rotate-45"></i></div></div>
                              <div className="text-center md:text-left"><span className="block text-2xl font-bold text-gray-900">{flight.destCode}</span><span className="text-xs text-gray-400 font-medium">{flight.destCity}</span></div>
                              <div className="h-8 border-l border-gray-300 mx-6 hidden md:block"></div>
                              <div className="text-center md:text-left"><span className="block text-xl font-bold text-gray-900">{flight.time}</span><span className="text-xs text-gray-400 font-medium">{flight.originCode}</span></div>
                            </div>
                            <div className="text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-0 pt-4 md:pt-0 border-gray-200">
                              <div><span className="text-2xl font-bold text-gray-900">{flight.price}</span></div>
                              <a href="https://wa.me/19056248344?text=Hi,%20I'm%20interested%20in%20booking%20this%20flight!" target="_blank" rel="noopener noreferrer" className="bg-emerald-900 text-white hover:bg-gold hover:text-slate-900 font-bold py-3 px-8 rounded-lg tracking-wide shadow-sm transition-colors duration-150 cursor-pointer text-sm w-full md:w-auto inline-block text-center">Booking</a>
                            </div>
                          </div>
                          <div className="border-t border-dashed border-gray-300/80 pt-4 text-right"><span className="text-xs font-medium text-gray-500">Price Per Person (Incl. Taxes &amp; Fees)</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section id="flights" className="py-12 bg-white">
                  <div className="wrap"><div className="section-head center text-center mb-8"><div className="eyebrow uppercase text-xs font-bold tracking-widest text-gold justify-center mb-1">Our Trusted Partners</div><h2 className="">Airlines We Sourced Deals From</h2></div></div>
                  <MarqueeTrack type="airline" images={airlineLogos} />
                </section>

                <section className="tint mt-12 py-20 bg-emerald-50/60 border-t border-emerald-100">
                  <div className="wrap text-center max-w-3xl mx-auto px-4">
                    <h2 className=" mb-4">Need Flight Booking Assistance?</h2>
                    <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed font-light">Speak directly with our ticketing specialists to get custom quotes, group flight discounts, and immediate confirmations.</p>
                    <Link href="/contact" className="inline-block bg-primary hover:bg-gold text-white hover:text-slate-900 font-extrabold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm">Contact Flight Desk</Link>
                  </div>
                </section>
              </>
            )}

            {unhandledSections.length > 0 && (
              <PageSectionsRenderer sections={unhandledSections} pageData={pageData} />
            )}
          </>
        );
      })()}
    </main>
  );
}
