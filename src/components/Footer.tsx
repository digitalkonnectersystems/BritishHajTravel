"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer({ initialFooterData = {} }: { initialFooterData?: any }) {
  const footerData = initialFooterData || {};
  const pathname = usePathname();


  if (pathname?.startsWith("/admin") || pathname === "/letstravel") {
    return null;
  }

  return (
    <footer id="footer-place" className="px-5 bg-[#2d2d2d] text-[#bccfc6] py-[70px] pb-[30px] text-[14px] md:text-[16px] [&_a]:text-[#bccfc6] [&_a:hover]:text-white">
      <div className="max-w-[1400px] mx-auto px-5 ">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-[1.8fr_0.9fr_0.9fr_1.4fr] gap-x-[20px] gap-y-[40px] lg:gap-[40px]">

          {/* ── Column 1: Brand + tagline + social + trust badges ── */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <div className="flex gap-[10px] items-center mb-[25px]">
              <Link href="/">
                {footerData.logo ? (
                  footerData.logo.startsWith('data:') ? (
                    <img src={footerData.logo} alt="British Haj Travel Logo" loading="lazy" className="w-[210px] h-auto" />
                  ) : (
                    <Image
                      src={footerData.logo}
                      alt="King Travel Logo"
                      width={210}
                      height={50}
                      className="w-[210px] h-auto"
                      unoptimized
                    />
                  )
                ) : (
                  <span className="font-serif font-bold text-xl text-white">British Hajj Travel</span>
                )}
              </Link>
            </div>
            <p className="max-w-[310px] sm:max-w-none lg:max-w-[310px] font-light leading-[1.7]">
              {footerData.tagline || 'A licensed Canadian agency dedicated to Hajj & Umrah travel — trusted, certified, and built for pilgrims.'}
            </p>

            {/* Social Links */}
            {footerData.socialLinks && footerData.socialLinks.length > 0 && (
              <div className="mt-[15px] flex items-center gap-[10px]">
                <b className="font-bold">Follow Us:</b>
                <ul className="flex gap-[10px] items-center p-0 m-0 list-none">
                  {footerData.socialLinks.map((item: any, idx: number) => (
                    <li key={idx} className="flex items-center mb-0">
                      <a
                        href={item.url || '#'}
                        target={item.openInNewTab ? "_blank" : "_self"}
                        rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                        className="opacity-50 hover:opacity-100 transition-all duration-300 ease-in-out inline-flex items-center justify-center"
                        title={item.name || 'Social Link'}
                      >
                        {item.icon ? (
                          <img
                            src={item.icon}
                            alt={item.name || 'Social Icon'}
                            loading="lazy"
                            className="w-[32px] h-[32px] max-w-[32px] max-h-[32px] block object-contain"
                          />
                        ) : (
                          <span className="text-xs font-bold text-white">{item.name}</span>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust Badges */}
            {footerData.trustBadges && footerData.trustBadges.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {footerData.trustBadges.map((badge: any, bIdx: number) => (
                  <div key={bIdx} className="bg-white rounded-lg flex items-center justify-center h-12 w-12 p-1 overflow-hidden" title={badge.name || 'Accreditation'}>
                    {badge.icon ? (
                      <img
                        src={badge.icon}
                        alt={badge.name || 'Trust Badge'}
                        loading="lazy"
                        className="max-h-7 max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[9px] font-extrabold text-primary text-center">{badge.name}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Column 2: Services ── */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <h5 className="text-[15px] tracking-[0.16em] uppercase text-white mb-[18px] font-semibold">{footerData.servicesTitle || 'SERVICES'}</h5>
            <ul className="list-none p-0 m-0 space-y-2.5">
              {(footerData.servicesLinks || []).map((link: any, sIdx: number) => (
                <li key={sIdx} className="font-light">
                  <Link href={link.url || '#'}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Sitemap ── */}
          <div className="col-span-1 md:col-span-1 lg:col-span-1">
            <h5 className="text-[15px] tracking-[0.16em] uppercase text-white mb-[18px] font-semibold">{footerData.sitemapTitle || 'SITEMAP'}</h5>
            <ul className="list-none p-0 m-0  space-y-2.5">
              {(footerData.sitemapLinks || []).map((link: any, mIdx: number) => (
                <li key={mIdx} className="font-light ">
                  <Link href={link.url || '#'}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Customer Support ── */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h5 className="text-[15px] tracking-[0.16em] uppercase text-white mb-[18px] font-semibold">{footerData.supportTitle || '24/7 CUSTOMER SUPPORT'}</h5>
            <ul className="list-none p-0 m-0 space-y-2.5">
              {(footerData.supportItems || []).map((item: any, cIdx: number) => {
                const phoneDisplay = item.phone || item.text || '';
                const labelDisplay = item.label || '';

                return (
                  <li key={cIdx} className="font-light whitespace-nowrap">
                    {item.url ? (
                      <div className="whitespace-nowrap inline-flex items-center gap-1.5">
                        <a
                          href={item.url}
                          target={item.openInNewTab ? "_blank" : "_self"}
                          rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                          className="footer-support-phone text-white-lt hover:text-white transition-colors"
                        >
                          {phoneDisplay}
                        </a>
                        {labelDisplay && (
                          <span className="footer-support-label font-normal text-xs">
                            - {labelDisplay}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="whitespace-nowrap text-md inline-flex items-center gap-1.5 text-white-lt">
                        <span className="footer-support-phone">{phoneDisplay}</span>
                        {labelDisplay && (
                          <span className="footer-support-label text-white-lt/80 font-normal text-xs">
                            - {labelDisplay}
                          </span>
                        )}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        <div className="mt-[20px] md:mt-[60px] pt-[24px] border-t border-white/20 flex flex-wrap justify-center md:justify-between gap-[12px] text-[12px] md:text-[14px] font-light text-[#bccfc6]">
          <span>{footerData.copyrightText || `© ${new Date().getFullYear()} King Travel Can LTD. All Rights Reserved.`}</span>
          <span>
            {footerData.developerText || 'Design & Developed by'}
            {footerData.developerUrl && (
              <> <a href={footerData.developerUrl} target="_blank" rel="noopener noreferrer">DKS</a></>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
