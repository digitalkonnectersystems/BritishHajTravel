"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import PageBanner from "@/components/PageBanner";
import CertificationsFlipCardsSection from "@/components/CertificationsFlipCardsSection";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";

// --- Start of extracted animated counter component ---
function AnimatedStats() {
  const [counts, setCounts] = useState({
    travelers: 0,
    rating: 0.0,
    satisfaction: 0,
    experience: 0,
  });

  useEffect(() => {
    let start: number | null = null;
    const duration = 2500;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const easeProgress = progress * (2 - progress);

      setCounts({
        travelers: Math.floor(easeProgress * 72),
        rating: parseFloat((easeProgress * 4.4).toFixed(1)),
        satisfaction: Math.floor(easeProgress * 100),
        experience: Math.floor(easeProgress * 25),
      });

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCounts({
          travelers: 72,
          rating: 4.4,
          satisfaction: 100,
          experience: 25,
        });
      }
    };

    requestAnimationFrame(step);
  }, []);

  const items = [
    { value: `${counts.travelers}K+`, label: "Happy Travelers" },
    { value: counts.rating.toFixed(1), label: "Google Rating" },
    { value: `${counts.satisfaction}%`, label: "Client Satisfaction" },
    { value: `${counts.experience}+`, label: "Years Experience" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 mb-8">
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-slate-100">
        {items.map((it: any, i: number) => (
          <div key={i} className="flex flex-col items-center justify-center p-2">
            <h3 className="text-2xl md:text-3xl font-bold text-primary font-serif m-0">{it.value}</h3>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 m-0">{it.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
// --- End of extracted component ---

export default function AboutPageClient({ initialPageData }: { initialPageData?: any }) {
  const pageData = initialPageData || null;

  const defaultSections = [
    {
      type: "Stats Grid",
      data: {
        items: [] // Data handled internally by the AnimatedStats component now
      }
    },
    {
      type: "Intro",
      data: {
        eyebrow: "ABOUT",
        title: "King Travel",
        description: "For over 20 years, King Travel has been a trusted travel agency in Canada, offering Hajj and Umrah services, airline ticketing, and visa processing with unmatched expertise. We are Canada's No. 1 authorized PIA seller agency and an official agent licensed by the Ministry of Hajj & Umrah, IATA, TICO, OCTA, and ASTA."
      }
    },
    {
      type: "Image+Text",
      data: {
        eyebrow: "WHY CHOOSE US",
        title: "Your Trusted Partner for Pilgrimage & Global Travel",
        description: "Serving Ontario travelers for years, King Travel Can Ltd is certified by IATA, ACTA, TICO, ASTA, ATAC, and the Saudi Ministry of Hajj & Umrah. We've arranged thousands of successful journeys with fast response times and secure ID checks for every booking.",
        subheading: "Common Travel Needs We Solve",
        features: [
          "Securing all types of Saudi visas quickly.",
          "Coordinating family or group Hajj packages.",
          "Last-minute airline ticket changes or cancellations.",
          "5-Star Accommodations near the Haram.",
          "Managing itineraries with multiple destinations.",
          "Handling urgent travel during peak seasons."
        ],
        image: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80"
      }
    },
    {
      type: "Services Grid",
      data: {
        eyebrow: "WHAT WE PROVIDE",
        title: "Our Premium Travel Services",
        items: [
          { icon: "✈️", title: "Lowest Fares", subtitle: "We Offer the Lowest Fair on Air Ticketing around the Globe.", description: "As a partner with major airlines, including PIA, King Travel Can Ltd guarantees the lowest airfares for flights to Pakistan, Saudi Arabia, and beyond. Whether it's for religious travel or international vacations, we offer unbeatable rates to help you save." },
          { icon: "✨", title: "Special Deals", subtitle: "We Provide Best Prices Of All Inclusive Packages.", description: "We offer exclusive special deals on Umrah, Hajj, and international flight packages, tailored to fit your budget. These limited-time offers allow you to experience premium services without overspending, making your travel affordable and stress-free." },
          { icon: "🛡️", title: "Trusted & Certified", subtitle: "We are The Only Authorized Saudi Visa Providers Canada!", description: "Recognized by IATA, ACTA, TICO, ASTA, ATAC, and the Saudi Ministry of Hajj & Umrah, ensuring every journey meets the highest international standards." },
          { icon: "🕌", title: "Pilgrimage Experts", subtitle: "We Offer Best Accommodations & Transports In Saudia Arabia", description: "From visa processing and ticketing to 5-star accommodations and guided tours, King Travel provides a complete pilgrimage experience. Our services ensure a hassle-free journey, with everything taken care of from start to finish." }
        ]
      }
    }
  ];

  let parsedSections = defaultSections;
  if (pageData?.sections) {
    try {
      const dbSecs = JSON.parse(pageData.sections);
      if (Array.isArray(dbSecs) && dbSecs.length > 0) {
        parsedSections = dbSecs;
      }
    } catch (e) {
      console.error("Error parsing about page sections:", e);
    }
  }

  return (
    <main>
      {/* ================= DYNAMIC HERO BANNER ================= */}
      <PageBanner
        title={pageData?.bannerTitle || pageData?.title || "Your Trusted Partner for <span>Pilgrimage & Global Travel</span>"}
        description={pageData?.bannerDescription || "Over 25 years of unmatched expertise coordinating safe, seamless, and deeply spiritual journeys across the globe."}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
      />

      {/* ================= RENDER DYNAMIC SECTIONS ================= */}
      {parsedSections.map((sec: any, idx: number) => {
        // Section Type 1: Stats Grid
        if (sec.type === "Stats Grid") {
          return <AnimatedStats key={idx} />;
        }

        // Section Type 2: Intro Banner Box
        if (sec.type === "Intro") {
          return (
            <div key={idx} className="wrap my-8">
              <div className="bg-[#f2f5e8] border border-[#e4ebd3] rounded-2xl p-8 max-w-7xl mx-auto shadow-xs">
                <span className="eyebrow">
                  {sec.data?.eyebrow || "ABOUT"}
                </span>
                <h2 className="font-serif mb-3">
                  {sec.data?.title || "King Travel"}
                </h2>
                <p className="text-ink-soft text-sm leading-relaxed font-normal m-0">
                  {sec.data?.description}
                </p>
              </div>
            </div>
          );
        }

        // Section Type 3: Image + Text (Why Choose Us)
        if (sec.type === "Image+Text" || sec.type === "Why Choose Us") {
          const feats = sec.data?.features || [
            "Securing all types of Saudi visas quickly.",
            "Coordinating family or group Hajj packages.",
            "Last-minute airline ticket changes or cancellations.",
            "5-Star Accommodations near the Haram.",
            "Managing itineraries with multiple destinations.",
            "Handling urgent travel during peak seasons."
          ];
          return (
            <div key={idx} className="wrap">
              <section className="about-section reveal">
                <div className="grid-2 about_page_why_choose">
                  <div className="about-image">
                    <Image
                      src={sec.data?.image || "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80"}
                      alt={sec.data?.title || "Why Choose Us"}
                      width={800}
                      height={450}
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="about-content">
                    <span className="eyebrow">{sec.data?.eyebrow || "WHY CHOOSE US"}</span>
                    <h2 className="section-title">{sec.data?.title || "Your Trusted Partner for Pilgrimage & Global Travel"}</h2>
                    <p>{sec.data?.description}</p>
                    {sec.data?.subheading && (
                      <h4 className="text-sm font-bold text-slate-800 mt-4 mb-2">{sec.data.subheading}</h4>
                    )}
                    <ul className="features-list grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700 font-medium list-none p-0 mt-3">
                      {feats.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-gold font-bold">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          );
        }

        // Section Type 4: Services Grid (What We Provide)
        if (sec.type === "Services Grid" || sec.type === "What We Provide") {
          const svcs = sec.data?.items || [
            { icon: "✈️", title: "Lowest Fares", subtitle: "We Offer the Lowest Fair on Air Ticketing around the Globe.", description: "As a partner with major airlines, including PIA, King Travel Can Ltd guarantees the lowest airfares for flights to Pakistan, Saudi Arabia, and beyond. Whether it's for religious travel or international vacations, we offer unbeatable rates to help you save." },
            { icon: "✨", title: "Special Deals", subtitle: "We Provide Best Prices Of All Inclusive Packages.", description: "We offer exclusive special deals on Umrah, Hajj, and international flight packages, tailored to fit your budget. These limited-time offers allow you to experience premium services without overspending, making your travel affordable and stress-free." },
            { icon: "🛡️", title: "Trusted & Certified", subtitle: "We are The Only Authorized Saudi Visa Providers Canada!", description: "Recognized by IATA, ACTA, TICO, ASTA, ATAC, and the Saudi Ministry of Hajj & Umrah, ensuring every journey meets the highest international standards." },
            { icon: "🕌", title: "Pilgrimage Experts", subtitle: "We Offer Best Accommodations & Transports In Saudia Arabia", description: "From visa processing and ticketing to 5-star accommodations and guided tours, King Travel provides a complete pilgrimage experience. Our services ensure a hassle-free journey, with everything taken care of from start to finish." }
          ];
          return (
            <section key={idx} className="services-section py-10">
              <div className="wrap">
                <div className="flex flex-col items-center text-center mb-4">
                  <span className="eyebrow mx-auto block">{sec.data?.eyebrow || "WHAT WE PROVIDE"}</span>
                  <h2 className="section-title">{sec.data?.title || "Our Premium Travel Services"}</h2>
                </div>
                <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                  {svcs.map((item: any, i: number) => (
                    <div key={i} className="about-service-card">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="service-icon text-2xl p-2.5 rounded-xl bg-slate-50 border border-slate-100">{item.icon}</span>
                        <div>
                          <h3 className="text-[20px] font-bold text-ink m-0">{item.title}</h3>
                          {item.subtitle && <span className="text-[14px] font-semibold text-ink block mt-0.5">{item.subtitle}</span>}
                        </div>
                      </div>
                      <p className="text-[14px] text-ink-soft leading-relaxed font-normal m-0">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }
        // Section Type: Accreditations / Badges Bar (Lucide + FontAwesome)
        if (sec.type === "Accreditations Bar" || sec.type === "Badges Cards") {
          const badges = sec.data?.items || [
            { title: "ATOL PROTECTED", icon: "fa-solid fa-primary fa-shield-halved", iconType: "fontawesome" },
            { title: "SAUDI MINISTRY APPROVED", icon: "fa-solid fa-primary fa-mosque", iconType: "fontawesome" },
            { title: "IATA ACCREDITED", icon: "fa-solid fa-primary fa-plane-departure", iconType: "fontawesome" },
            { title: "ABTA BONDED", icon: "fa-solid fa-primary fa-stamp", iconType: "fontawesome" },
          ];
          return (
            <div key={idx} className="max-w-6xl mx-auto px-4 my-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((b: any, bI: number) => (
                  <div key={bI} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50/80 flex items-center justify-center text-primary text-xl">
                      {b.iconType === "fontawesome" || !b.iconType ? (
                        <i className={b.icon}></i>
                      ) : (
                        <span className="font-bold text-sm">{b.icon}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{b.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Section Type: Umrah Packages Grid Component
        if (sec.type === "Umrah Packages Grid" || sec.type === "Packages Grid") {
          const defaultPackages = [
            {
              id: "pkg-1",
              title: "Customize Umrah Package 2026",
              duration: "10, 15 Days",
              heroImage: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80",
              price: "$7,499",
              makkahHotel: { name: "5 Star Hotel in Makkah", location: "Near to Haram", nights: "6 Nights", badge: "Breakfast" },
              madinahHotel: { name: "5 Star Hotel in Madinah", location: "Near to Masjid Nabawi", nights: "6 Nights", badge: "Breakfast" }
            },
            {
              id: "pkg-2",
              title: "Elite Platinum Umrah 2026",
              duration: "15 Days",
              heroImage: "uploads\sections\hajj_1.jpg",
              price: "$10,950",
              makkahHotel: { name: "Fairmont Clock Royal Tower", location: "Zero distance (In Front)", nights: "8 Nights", badge: "Buffet Included" },
              madinahHotel: { name: "The Oberoi Madinah", location: "Adjacent to Courtyard", nights: "7 Nights", badge: "Buffet Included" }
            },
            {
              id: "pkg-3",
              title: "Express Custom Umrah 2026",
              duration: "10 Days",
              heroImage: "uploads\sections\hajj_1.jpg",
              price: "$5,850",
              makkahHotel: { name: "Hyatt Regency Makkah", location: "2 Mins Walk", nights: "5 Nights", badge: "Breakfast" },
              madinahHotel: { name: "Pullman Zamzam Madinah", location: "Walking Distance", nights: "5 Nights", badge: "Breakfast" }
            }
          ];

          return (
            <section key={idx} className="py-10 max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {defaultPackages.map((pkg) => (
                  <article key={pkg.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group">
                    <div className="relative h-56 overflow-hidden">
                      <Image src={pkg.heroImage} alt={pkg.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
                      <div className="absolute top-3 inset-x-3 flex justify-between items-center text-xs">
                        <span className="bg-[#0a422d]/90 text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                          <i className="fa-solid fa-kaaba text-[#CBA25F]"></i> Umrah 2026
                        </span>
                        <span className="bg-amber-500 text-slate-900 font-extrabold px-2.5 py-1 rounded-md">
                          {pkg.duration}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider block mb-0.5">FROM CANADA → TO SAUDIA</span>
                        <h3 className="text-lg font-bold text-white leading-tight">{pkg.title}</h3>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100/50 flex gap-3 items-center">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-800">{pkg.makkahHotel.name}</h4>
                            <p className="text-[10px] text-slate-500">{pkg.makkahHotel.location}</p>
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-100/50 flex gap-3 items-center">
                          <div className="flex-1">
                            <h4 className="text-xs font-bold text-slate-800">{pkg.madinahHotel.name}</h4>
                            <p className="text-[10px] text-slate-500">{pkg.madinahHotel.location}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">STARTING FROM</span>
                          <span className="text-lg font-extrabold text-primary">{pkg.price}</span>
                        </div>
                        <button className="bg-primary hover:bg-gold text-white hover:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all">
                          Book Package
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        // // Section Type 5: Airlines Marquee (Our Trusted Partners)
        // if (sec.type === "Airlines Marquee" || sec.type === "Partners Marquee" || sec.type === "Airlines we work with") {
        //   const defaultAirlines = [
        //     { src: "/img/a-1.png", alt: "PIA" },
        //     { src: "/img/a-2.png", alt: "Saudia" },
        //     { src: "/img/a-3.png", alt: "Air France" },
        //     { src: "/img/a-4.png", alt: "Qatar Airways" },
        //     { src: "/img/a-5.png", alt: "KLM" },
        //     { src: "/img/a-6.png", alt: "Air Canada" },
        //     { src: "/img/a-7.png", alt: "Emirates" },
        //     { src: "/img/a-8.png", alt: "Etihad" },
        //     { src: "/img/a-9.png", alt: "Turkish Airlines" },
        //   ];
        //   return (
        //     <section key={idx} id="flights" className="py-12">
        //       <div className="wrap">
        //         <div className="section-head center text-center mb-8">
        //           <div className="eyebrow uppercase text-xs font-bold tracking-widest text-gold justify-center mb-1">
        //             {sec.data?.eyebrow || "OUR TRUSTED PARTNERS"}
        //           </div>
        //           <h2 className="">
        //             {sec.data?.title || "Airlines we work with"}
        //           </h2>
        //         </div>
        //       </div>
        //       {/* <div className="marquee-widget">
        //         <div className="">
        //           <div className="marquee-track airline flex gap-8 items-center justify-around flex-wrap px-4">
        //             {defaultAirlines.map((img, i) => (
        //               <div key={i} className="marquee-item p-2">
        //                 <Image
        //                   src={img.src}
        //                   alt={img.alt}
        //                   width={140}
        //                   height={60}
        //                   className="w-auto h-[40px] object-contain"
        //                 />
        //               </div>
        //             ))}
        //           </div>
        //         </div>
        //       </div> */}
        //     </section>
        //   );
        // }

        if (sec.type === 'Text Block (Rich Text)') {
          let content: string = sec.data?.content || '';
          if (!content) return null;
          content = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, '\u00a0');
          const innerM = content.match(/^<p>([\s\S]*)<\/p>$/);
          if (innerM) { const inner = innerM[1].trim(); if (/^<(h[1-6]|ul|ol|blockquote)/.test(inner)) content = inner; }
          if (!content || content === '<p></p>') return null;
          return (
            <section key={idx} className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 max-w-5xl mx-auto my-8 w-full">
              <div
                className="prose prose-slate prose-headings:font-serif prose-headings:text-primary prose-a:text-primary prose-strong:text-slate-900 max-w-none text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </section>
          );
        }

        if (sec.type === 'Certifications Flip Cards' || sec.type === 'Our Certifications') {
          return <CertificationsFlipCardsSection key={idx} data={sec.data || {}} />;
        }

        return <PageSectionsRenderer key={idx} sections={[sec]} pageData={pageData} />;
      })}
    </main>
  );
}
