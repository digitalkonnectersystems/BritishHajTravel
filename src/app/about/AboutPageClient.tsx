"use client";

import Image from "next/image";
import PageBanner from "@/components/PageBanner";
import CertificationsFlipCardsSection from "@/components/CertificationsFlipCardsSection";
import PageSectionsRenderer from "@/components/PageSectionsRenderer";
import SafeRichText from "@/components/SafeRichText";

function SavedStats({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 mb-8">
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-slate-100">
      {items.filter(item => item?.label && item?.value !== undefined && item?.value !== '').map((item: any, i: number) => (
        <div key={i} className="flex flex-col items-center justify-center p-2">
          <h3 className="text-2xl md:text-3xl font-bold text-primary font-serif m-0">{String(item.value)}</h3>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 m-0">{item.label}</p>
        </div>
      ))}
    </div>
  </div>;
}

export default function AboutPageClient({ initialPageData, sectionContext }: { initialPageData?: any; sectionContext?: any }) {
  const pageData = initialPageData || null;

  let parsedSections: any[] = [];
  if (pageData?.sections) {
    try {
      const dbSecs = typeof pageData.sections === "string" ? JSON.parse(pageData.sections) : pageData.sections;
      if (Array.isArray(dbSecs) && dbSecs.length > 0) {
        parsedSections = dbSecs.filter((sec: any) => sec && sec.hidden !== true && sec.visible !== false);
      }
    } catch (e) {
      console.error("Error parsing about page sections:", e);
    }
  }

  return (
    <main>
      {/* ================= DYNAMIC HERO BANNER ================= */}
      <PageBanner
        title={pageData?.bannerTitle || pageData?.title || ""}
        description={pageData?.bannerDescription || ""}
        bgImage={pageData?.bannerBgImage}
        position={pageData?.bannerPosition}
        size={pageData?.bannerSize}
        heroSettings={pageData?.seoSettings}
      />

      {/* ================= RENDER DYNAMIC SECTIONS ================= */}
      {parsedSections.map((sec: any, idx: number) => {
        // Section Type 1: Stats Grid
        if (sec.type === "Stats Grid") {
          return <SavedStats key={idx} items={Array.isArray(sec.data?.items) ? sec.data.items : []} />;
        }

        // Section Type 2: Intro Banner Box
        if (sec.type === "Intro") {
          return (
            <div key={idx} className="wrap my-8">
              <div className="bg-primary border border-primary rounded-2xl p-8 max-w-7xl mx-auto shadow-xs">
                <span className="eyebrow">
                  {sec.data?.eyebrow || ""}
                </span>
                <h2 className="font-serif mb-3 text-white">
                  {sec.data?.title || ""}
                </h2>
                <p className="text-white/90 text-sm leading-relaxed font-normal m-0">
                  {sec.data?.description}
                </p>
              </div>
            </div>
          );
        }

        // Section Type 3: Image + Text (Why Choose Us)
        if (sec.type === "Image+Text" || sec.type === "Why Choose Us") {
          const feats = Array.isArray(sec.data?.features) ? sec.data.features : [];
          return (
            <div key={idx} className="wrap">
              <section className="about-section reveal">
                <div className="grid-2 about_page_why_choose">
                  <div className="about-image">
                    {sec.data?.image && <Image
                      src={sec.data.image}
                      alt={sec.data?.title || "Why Choose Us"}
                      width={800}
                      height={450}
                      unoptimized={/\.svg(?:[?#]|$)/i.test(sec.data.image)}
                      className="w-full h-auto"
                    />}
                  </div>
                  <div className="about-content">
                    <span className="eyebrow">{sec.data?.eyebrow || ""}</span>
                    <h2 className="section-title">{sec.data?.title || ""}</h2>
                    <p>{sec.data?.description}</p>
                    {sec.data?.subheading && (
                      <h4 className="text-sm font-bold text-slate-800 mt-4 mb-2">{sec.data.subheading}</h4>
                    )}
                    <ul className="features-list grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700 font-medium list-none p-0 mt-3">
                      {feats.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red font-bold">✓</span> {f}
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
          const svcs = Array.isArray(sec.data?.items) ? sec.data.items : [];
          if (!svcs.length && !sec.data?.title && !sec.data?.eyebrow && !sec.data?.description) return null;
          return (
            <section key={idx} className="services-section py-10">
              <div className="wrap">
                <div className="flex flex-col items-center text-center mb-4">
                  <span className="eyebrow mx-auto block">{sec.data?.eyebrow || ""}</span>
                  <h2 className="sectionpr-title">{sec.data?.title || ""}</h2>
                </div>
                {sec.data?.description && <p className="text-center text-sm text-slate-600 max-w-4xl mx-auto mb-6">{sec.data.description}</p>}
                {svcs.length > 0 && <div className="flex flex-col md:grid md:grid-cols-2 gap-6">
                  {svcs.map((item: any, i: number) => (
                    <div key={i} className="about-service-card">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="service-icon text-2xl p-2.5 rounded-xl bg-slate-50 border border-slate-100">{item.icon}</span>
                        <div>
                          <h3 className="text-[20px] font-bold head m-0">{item.title}</h3>
                          {item.subtitle && <span className="text-[14px] font-semibold text-red block mt-0.5">{item.subtitle}</span>}
                        </div>
                      </div>
                      <p className="text-[14px] text-ink-soft leading-relaxed font-normal m-0">{item.description}</p>
                    </div>
                  ))}
                </div>}
              </div>
            </section>
          );
        }
        // Section Type: Accreditations / Badges Bar (Lucide + FontAwesome)
        if (sec.type === "Accreditations Bar" || sec.type === "Badges Cards") {
          const badges = Array.isArray(sec.data?.items) ? sec.data.items : [];
          if (!badges.length) return null;
          return (
            <div key={idx} className="max-w-6xl mx-auto px-4 my-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((b: any, bI: number) => (
                  <div key={bI} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-50/80 flex items-center justify-center text-primary text-xl">
                      {b.iconType === 'image' && b.icon ? (
                        <Image src={b.icon} alt={b.title || 'Accreditation'} width={48} height={48} unoptimized={/\.svg(?:[?#]|$)/i.test(b.icon)} className="w-full h-full object-contain" />
                      ) : b.iconType === "fontawesome" || !b.iconType ? (
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
          const defaultPackages = Array.isArray(sec.data?.items) ? sec.data.items : [];
          if (!defaultPackages.length) return null;
          return (
            <section key={idx} className="py-10 max-w-7xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 min-[1025px]:grid-cols-3 gap-4 sm:gap-6">
                {defaultPackages.map((pkg: any) => (
                  <article key={pkg.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group">
                    <div className="relative h-56 overflow-hidden">
                      <Image src={pkg.heroImage} alt={pkg.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
                      <div className="absolute top-3 inset-x-3 flex justify-between items-center text-xs">
                        <span className="bg-[#0a422d]/90 text-white font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                          <i className="fa-solid fa-kaaba text-[#CBA25F]"></i> Umrah
                        </span>
                        <span className="bg-amber-500 text-slate-900 font-extrabold px-2.5 py-1 rounded-md">
                          {pkg.duration}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-wider block mb-0.5"></span>
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
                        <button className="bg-primary hover:bg-red text-white hover:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all">
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
        //     { src: "/img/a-6.png", alt: "Air UK" },
        //     { src: "/img/a-7.png", alt: "Emirates" },
        //     { src: "/img/a-8.png", alt: "Etihad" },
        //     { src: "/img/a-9.png", alt: "Turkish Airlines" },
        //   ];
        //   return (
        //     <section key={idx} id="flights" className="py-12">
        //       <div className="wrap">
        //         <div className="section-head center text-center mb-8">
        //           <div className="eyebrow uppercase text-xs font-bold tracking-widest text-red justify-center mb-1">
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
          const content: string = sec.data?.content || '';
          if (!content || content === '<p></p>') return null;
          return (
            <section key={sec.id || idx} className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 max-w-5xl mx-auto my-8 w-full">
              <SafeRichText html={content} className="prose prose-slate prose-headings:font-serif prose-headings:text-primary prose-a:text-primary prose-strong:text-slate-900 max-w-none text-sm leading-relaxed" />
            </section>
          );
        }

        if (sec.type === 'Certifications Flip Cards' || sec.type === 'Our Certifications') {
          return <CertificationsFlipCardsSection key={idx} data={sec.data || {}} />;
        }

        return <PageSectionsRenderer key={sec.id || idx} sections={[sec]} pageData={pageData} {...(sectionContext || {})} />;
      })}
    </main>
  );
}
