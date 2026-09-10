"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { getDurationUnit } from "@/lib/packageHelpers";
import { getPackagesByIds } from "@/actions/packageActions";
import PackageBookingModal from "@/components/PackageBookingModal";

export default function DestinationsPageSection({
  data,
  initialPackages,
}: {
  data: any;
  initialPackages?: any[];
}) {
  const packageIds = Array.isArray(data?.packageIds) ? data.packageIds : [];
  const [packages, setPackages] = useState<any[]>(initialPackages || []);
  const [loading, setLoading] = useState(!initialPackages);
  const [bookingPackage, setBookingPackage] = useState<any>(null);

  useEffect(() => {
    if (initialPackages) {
      setPackages(initialPackages);
      setLoading(false);
      return;
    }

    if (packageIds.length === 0) {
      setLoading(false);
      return;
    }

    getPackagesByIds(packageIds)
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, [initialPackages, packageIds.join(",")]);

  const title = data?.title || "Packages for this destination";
  const description = data?.description || "Explore our carefully selected travel packages for this destination.";

  return (
    <section className="pt-12 pb-16 bg-sage">
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="eyebrow">DESTINATION PACKAGES</h3>
            <h2 className="section-heading text-primary">{title}</h2>
          </div>
          <p className="max-w-sm text-primary text-sm leading-relaxed border-t-2 md:border-t-0 md:border-l-2 border-gray-200 pt-4 md:pt-0 pl-0 md:pl-4">
            {description}
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                <div className="h-[230px] bg-gray-200" />
                <div className="p-6 space-y-4">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-16 bg-gray-100 rounded-2xl" />
                  <div className="h-12 bg-gold/30 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && packages.length === 0 && (
          <p className="text-center text-primary">No packages are available for this destination yet.</p>
        )}

        {!loading && packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => {
              let cardData = pkg.cardData || {};
              if (typeof cardData === "string") {
                try { cardData = JSON.parse(cardData); } catch { cardData = {}; }
              }

              const accommodations = [
                { city: "MAKKAH", ...cardData.makkahHotel },
                { city: "MADINA", ...cardData.madinahHotel },
                { city: "AZIZIYA", ...cardData.aziziyaHotel },
                { city: "MINA", ...cardData.minaHotel },
              ].filter((hotel) => hotel.name || hotel.location || hotel.image || hotel.nights || hotel.badge);

              const inclusions = Array.isArray(cardData.inclusions) && cardData.inclusions.length > 0
                ? cardData.inclusions
                : [
                  { icon: "Plane", text: "Return\nAir Tickets" },
                  { icon: "FileCheck", text: "Visa\nAssistance" },
                  { icon: "Bed", text: "Comfortable\nAccommodation" },
                  { icon: "Utensils", text: "Meals\nIncluded" },
                  { icon: "Bus", text: "Ground\nTransport" },
                  { icon: "MessageCircle", text: "Guidance &\nSupport" },
                ];
              const eligibility = Array.isArray(cardData.eligibility) ? cardData.eligibility : [];
              const heroImage = cardData.bannerImage || pkg.featuredImage || "/images_BHT/sections/hajj_1.jpg";
              const price = pkg.startingPrice
                ? Number(pkg.startingPrice).toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                : "Contact us";
              const destinationLabel = cardData.destination || pkg.destination || "Selected destination";
              const duration = cardData.duration || `${pkg.durationDays || 14} Days`;

              return (
                <article key={pkg.id || index} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_4px_25px_rgb(0,0,0,0.07)] border border-gray-100 flex flex-col">
                  <div className="relative h-[230px] w-full">
                    <img src={heroImage} alt={pkg.title || destinationLabel} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 text-white text-[11px] font-bold tracking-wider">
                      <LucideIcons.MapPin className="w-3.5 h-3.5" /> {destinationLabel}
                    </div>
                    <div className="absolute top-4 right-4 bg-gold text-white px-3 py-1 rounded-full text-[11px] font-black tracking-wider flex items-center gap-1.5 shadow-sm">
                      <LucideIcons.Calendar className="w-3.5 h-3.5" /> {duration}
                    </div>
                    <div className="absolute bottom-4 left-5 right-5">
                      <div className="text-white text-[11px] font-black tracking-widest mb-1 flex items-center gap-1.5">
                        <LucideIcons.Plane className="w-3.5 h-3.5" /> {cardData.flightRoute || `FROM ${pkg.departureCity || "UNITED KINGDOM"}`}
                      </div>
                      <h3 className="text-white font-serif text-2xl leading-tight font-bold">{pkg.title || "Destination Travel Package"}</h3>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    {accommodations.length > 0 && (
                      <>
                        <div className="text-[11px] font-black text-primary uppercase tracking-widest mb-3">ACCOMMODATIONS</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                          {accommodations.map((hotel: any, hotelIndex: number) => (
                            <div key={hotelIndex} className="flex gap-3 p-2.5 rounded-2xl border border-[#eef0e4] bg-[#fcfdf9] items-start">
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative flex items-center justify-center">
                                {hotel.image ? <img src={hotel.image} alt={hotel.city} className="w-full h-full object-cover" /> : <LucideIcons.Hotel className="w-6 h-6 text-slate-400" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="text-primary font-black text-xs uppercase tracking-wider leading-none mb-1">{hotel.city}</h4>
                                <div className="text-gold font-serif font-bold text-[10px] uppercase tracking-wide truncate">{hotel.name || "Accommodation"}</div>
                                <div className="text-ink-soft text-[10px] flex items-center gap-1 mb-1.5 truncate"><LucideIcons.MapPin className="w-3 h-3 shrink-0" />{hotel.location || "Selected location"}</div>
                                <div className="flex gap-1.5 flex-wrap">
                                  {hotel.badge && <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><DynamicIcon name={hotel.badgeIcon || "Utensils"} className="w-2.5 h-2.5" />{hotel.badge}</span>}
                                  {hotel.nights && <span className="bg-gold-lt text-white text-[9px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">{getDurationUnit(hotel.nights) === "days" ? <LucideIcons.Sun className="w-2.5 h-2.5" /> : <LucideIcons.MoonStar className="w-2.5 h-2.5" />}{hotel.nights}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="relative mb-4 pt-3">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-serif tracking-wide px-4 py-1 rounded-full z-10 shadow-sm whitespace-nowrap">PACKAGE INCLUSIONS</div>
                      <div className="rounded-2xl border border-[#e5ebe3] bg-[#f9faf7] pt-6 pb-4 px-2">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                          {inclusions.map((item: any, inclusionIndex: number) => <div key={inclusionIndex} className="flex flex-col items-center"><div className="w-10 h-10 rounded-full border border-slate-300 bg-white flex items-center justify-center mb-1.5"><DynamicIcon name={item.icon || "CheckCircle"} className="w-4 h-4 text-primary" /></div><span className="text-[8px] font-bold text-slate-800 leading-tight whitespace-pre-line">{item.text || "Included"}</span></div>)}
                        </div>
                      </div>
                    </div>

                    {eligibility.length > 0 && <div className="rounded-2xl bg-[#f4f7f2] p-3.5 border border-[#e4ece0] mb-5"><ul className="space-y-1.5">{eligibility.map((item: string, eligibilityIndex: number) => <li key={eligibilityIndex} className="flex items-start gap-2 text-[11px] text-ink leading-snug"><span className="w-3.5 h-3.5 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5"><LucideIcons.Check className="w-2.5 h-2.5 stroke-[3]" /></span><span>{item}</span></li>)}</ul></div>}

                    <div className="border-t border-gray-100 pt-4 flex items-end justify-between mb-5">
                      <div><div className="text-[10px] font-bold text-ink-soft uppercase tracking-widest mb-1">OPERATOR</div><div className="text-sm font-bold text-ink flex items-center gap-2">{cardData.operatorName || "British Hajj Travel"}<span className="bg-gold text-white text-[10px] px-1.5 py-0.5 rounded font-black">{cardData.operatorRating || "4.4/5"}</span></div></div>
                      <div className="text-right"><div className="text-[10px] font-bold text-gold uppercase tracking-widest mb-1">{cardData.priceSubtext || "FROM £ / PERSON"}</div><div className="text-2xl font-black text-primary leading-none">{price}</div></div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 mt-auto">
                      <Link href={`/package/${pkg.slug}`} className="flex-1 py-3.5 border-2 border-primary text-primary hover:bg-primary hover:text-white text-xs font-black rounded-xl uppercase tracking-wider transition-colors flex justify-center items-center gap-2"><LucideIcons.Eye className="w-4 h-4" /> View Detail</Link>
                      <button type="button" onClick={() => setBookingPackage(pkg)} className="flex-1 py-3.5 bg-gold hover:bg-white hover:border hover:border-gold text-white hover:text-gold text-xs font-black rounded-xl uppercase tracking-wider transition-colors flex justify-center items-center gap-2 shadow-sm"><LucideIcons.BookOpen className="w-4 h-4" /> Book Now</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <PackageBookingModal isOpen={Boolean(bookingPackage)} onClose={() => setBookingPackage(null)} pkg={bookingPackage} />
    </section>
  );
}