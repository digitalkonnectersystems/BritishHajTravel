"use client";

import { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import DynamicIcon from "@/components/ui/DynamicIcon";
import { getPackagesByIds, getSoldOutPackages } from "@/actions/packageActions";

export default function SoldOutPackagesSection({ data, initialPackages }: { data: any; initialPackages?: any[] }) {
  const eyebrow = data?.eyebrow || "";
  const title = data?.title || "Packages Officially<br />Sold Out";
  const description = data?.description || "";

  const packageIds: number[] = Array.isArray(data?.packageIds)
    ? data.packageIds.map(Number).filter(Boolean)
    : [];

  const [pkgs, setPkgs] = useState<any[]>(initialPackages || []);
  const [loading, setLoading] = useState(!(initialPackages && initialPackages.length > 0));

  useEffect(() => {
    if (initialPackages && initialPackages.length > 0) return;

    if (packageIds.length === 0) {
      getSoldOutPackages()
        .then((rows) => setPkgs(rows))
        .catch(() => setPkgs([]))
        .finally(() => setLoading(false));
      return;
    }

    getPackagesByIds(packageIds)
      .then((rows) => {
        if (rows.length === 0) {
          // If the hardcoded IDs are deleted/invalid, fallback to all sold out packages
          return getSoldOutPackages().then(setPkgs);
        }
        setPkgs(rows);
      })
      .catch(() => setPkgs([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.packageIds?.join?.(","), initialPackages]);

  if (!loading && pkgs.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-primary">
      <div className="max-w-[1400px] mx-auto px-5">
        {/* Header (Two Columns) */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="eyebrow">{eyebrow}</h3>
            <h2
              className="section-heading text-white"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </div>
          <div className="max-w-sm text-white/90 text-sm leading-relaxed border-t-2 md:border-t-0 md:border-l-2 border-gray-200 pt-4 md:pt-0 pl-0 md:pl-4">
            {description}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse"
              >
                <div className="h-[220px] bg-gray-200" />
                <div className="p-8 space-y-4">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-8 bg-gray-100 rounded w-1/2" />
                  <div className="space-y-2 pt-4">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-full" />
                    <div className="h-4 bg-gray-100 rounded w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cards Grid */}
        {!loading && pkgs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
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
                "https://images.unsplash.com/photo-1553755088-ef1973c7b4a1?auto=format&fit=crop&w=700&q=80";
              const typeName = pkg.type === "hajj" ? "HAJJ" : "UMRAH";

              // We could use `pkg.month` or `cd.duration` here, let's show the package type and duration
              const monthLabel = `${typeName} \u00B7 ${cd.duration || pkg.durationDays + ' Days'}`;

              const price = pkg.startingPrice
                ? `£ ${Number(pkg.startingPrice).toLocaleString("en-CA")}`
                : "£ 0";
              const rawPriceSubtext = cd.priceSubtext?.trim();
              const priceUnit = (!rawPriceSubtext || /occupancy|package|£\s*\/\s*quad/i.test(rawPriceSubtext))
                ? "/ Person"
                : (rawPriceSubtext.startsWith('/') ? rawPriceSubtext : `/ ${rawPriceSubtext.replace(/^from\s+/i, '')}`);
              const includesText = "PACKAGE INCLUDES";

              // Map some common text to icons based on the UI
              const getIconForText = (text: string, defaultIcon: string = "Check") => {
                const lower = text.toLowerCase();
                if (lower.includes("flight")) return "Plane";
                if (lower.includes("transport")) return "Bus";
                if (lower.includes("ihram")) return "Shirt";
                if (lower.includes("visa")) return "FileText";
                if (lower.includes("guide") || lower.includes("imam")) return "User";
                if (lower.includes("hotel")) return "Building";
                return defaultIcon;
              };

              // Use custom includes from cardData if available, otherwise fallback to defaults based on Hajj/Umrah
              const includes = Array.isArray(cd.includes) && cd.includes.length > 0
                ? cd.includes
                : [
                  { text: 'Return Flights from Toronto', icon: 'Plane' },
                  { text: 'Luxury Ground Transportation', icon: 'Bus' },
                  { text: '5 Star Hotels Makkah & Madinah', icon: 'Building' }
                ];

              return (
                <article
                  key={pkg.id || idx}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col group transition-shadow hover:shadow-md relative"
                >
                  {/* SOLD OUT BADGE OVERLAY */}
                  <div className="absolute top-4 right-4 z-10 bg-red-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1">
                    <LucideIcons.Ban className="w-3.5 h-3.5" /> SOLD OUT
                  </div>

                  {heroImage && (
                    <div className="relative h-[220px] w-full overflow-hidden shrink-0">
                      <img
                        src={heroImage}
                        alt={pkg.title || "Sold Out Package"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  )}

                  <div className="p-8 flex-1 flex flex-col">
                    <div className="ink-soft text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1">
                      {pkg.type === "hajj" ? <LucideIcons.Tent className="w-3.5 h-3.5" /> : <LucideIcons.MoonStar className="w-3.5 h-3.5" />}
                      {monthLabel}
                    </div>
                    <h3 className="text-2xl text-primary font-serif mb-2">
                      {pkg.title}
                    </h3>
                    <span className="text-xs font-medium text-ink-soft">
                      Starting From
                    </span>
                    <div className="text-gold font-black text-xl mb-6">
                      {price}{" "}
                      <span className="text-sm font-medium text-ink-soft">
                        {priceUnit}
                      </span>
                    </div>

                    <div className="incl-label">
                      {includesText}
                    </div>

                    {includes && includes.length > 0 && (
                      <ul className="space-y-4 mb-2 flex-1">
                        {includes.map((inc: any, j: number) => {
                          const isString = typeof inc === 'string';
                          const text = isString ? inc : (inc.text || "");
                          let iconName = (!isString && inc.icon) ? inc.icon : getIconForText(text);
                          return (
                            <li
                              key={j}
                              className="flex gap-4 items-center text-sm ink-soft"
                            >
                              <DynamicIcon
                                name={iconName}
                                className="w-4 h-4 ink-soft shrink-0"
                              />
                              <span>{text}</span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
