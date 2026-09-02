"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const DEFAULT_NAV_ITEMS = [
  { id: '1', label: 'Home', url: '/', level: 1, children: [] },
  { id: '2', label: 'About', url: '/about', level: 1, children: [] },
  { id: '3', label: 'Umrah Packages', url: '/umrah-packages', level: 1, children: [] },
  { id: '4', label: 'Hajj Packages', url: '/hajj-packages', level: 1, children: [] },
  { id: '5', label: 'Saudi Visa', url: '/saudi-visa', level: 1, children: [] },
  { id: '6', label: 'Flights', url: '/airlines', level: 1, children: [] },
  { id: '7', label: 'Contact', url: '/contact', level: 1, children: [] },
];

export default function Header({ initialNavItems = DEFAULT_NAV_ITEMS, initialIdentity = null }: { initialNavItems?: any[]; initialIdentity?: any }) {
  const [menuActive, setMenuActive] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navItems = initialNavItems?.length ? initialNavItems : DEFAULT_NAV_ITEMS;
  const identityData = initialIdentity;
  const pathname = usePathname();


  if (pathname?.startsWith("/admin") || pathname === "/letstravel") {
    return null;
  }

  return (
    <header className="sticky top-0 z-[1000] px-5 w-full bg-white backdrop-blur-md shadow-[0_2px_24px_-12px_rgba(19,39,35,0.18)]">
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between min-h-[80px] py-[10px]">
          {/* Logo */}
          <div className="block max-w-[250px] max-lg:max-w-[220px] max-sm:max-w-[180px] w-full">
            <Link href="/" onClick={() => setMenuActive(false)} className="block">
              {identityData?.logo ? (
                identityData.logo.startsWith('data:') ? (
                  <img
                    src={identityData.logo}
                    alt={identityData.logoAlt || identityData.siteName || "King Travel Logo"}
                    className="w-full h-auto max-h-[60px] object-contain"
                  />
                ) : (
                  <Image
                    src={identityData.logo}
                    alt={identityData.logoAlt || identityData.siteName || "King Travel Logo"}
                    width={250}
                    height={60}
                    priority
                    className="w-full h-auto"
                    unoptimized
                  />
                )
              ) : (
                <Image
                  src="/img/logo.png"
                  alt="King Travel Logo"
                  width={250}
                  height={60}
                  priority
                  className="w-full h-auto"
                />
              )}
            </Link>
          </div>

          {/* Desktop + Mobile Nav */}
          {/* <nav className={`flex gap-[20px] max-lg:gap-[10px] items-center max-xl:hidden max-lg:flex-col max-lg:absolute max-lg:top-full max-lg:left-0 max-lg:w-full max-lg:bg-white max-lg:p-[20px] max-lg:shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-lg:gap-y-[15px] max-lg:items-start ${menuActive ? "!flex" : ""}`} id="navLinks"> */}
            <nav className={`flex gap-[20px] max-xl:gap-[10px] items-center max-xl:hidden max-xl:flex-col max-xl:absolute max-xl:top-full max-xl:left-0 max-xl:w-full max-xl:bg-white max-xl:p-[20px] max-lg:shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-xl:gap-y-[15px] max-xl:items-start ${menuActive ? "!flex" : ""}`} id="navLinks">
            {navItems.map((item) => {
              const itemHref = item.url || item.href || '#';
              const itemLabel = item.label || item.title;
              const hasChildren = item.children && item.children.length > 0;
              const isParentActive = pathname === itemHref || (hasChildren && item.children.some((sub: any) => pathname === (sub.url || sub.href)));

              if (!hasChildren) {
                const isActive = pathname === itemHref;
                return (
                  <Link
                    key={item.id || itemHref}
                    href={itemHref}
                    onClick={() => setMenuActive(false)}
                    className={`text-[#333333] text-[16px] max-xl:text-[14px] max-xl:w-full max-xl:py-[8px] max-xl:border-b max-xl:border-[#eee] font-semibold uppercase tracking-normal transition-all duration-300 hover:text-gold ${isActive ? "!text-gold font-bold" : ""}`}
                  >
                    {itemLabel}
                  </Link>
                );
              }

              const mobKey = itemLabel;
              return (
                <div
                  key={item.id || itemHref}
                  className={`w-full xl:w-auto dropdown-parent${openDropdown === mobKey ? " mob-open" : ""}`}
                >
                  <span
                    className="cursor-pointer flex items-center xl:gap-0 gap-4"
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setOpenDropdown(openDropdown === mobKey ? null : mobKey);
                      }
                    }}
                  >
                    <Link
                      href={itemHref}
                      onClick={() => setMenuActive(false)}
                      className={`w-full xl:w-auto text-[#333333] text-[16px] max-xl:text-[14px] max-xl:w-full max-xl:py-[8px] max-xl:border-b max-xl:border-[#eee] font-semibold uppercase tracking-normal transition-all duration-300 hover:text-gold ${isParentActive ? "!text-gold font-bold" : ""}`}
                    >
                      {itemLabel}
                    </Link>
                    <i className="nav-arrow">▼</i>
                  </span>

                  <div className="dropdown-menu">
                    {item.children.map((sub: any) => {
                      const subHref = sub.url || sub.href || '#';
                      const isSubActive = pathname === subHref;
                      return (
                        <Link
                          key={sub.id || subHref}
                          href={subHref}
                          className={isSubActive ? "!text-gold font-bold" : ""}
                          onClick={() => {
                            setMenuActive(false);
                            setOpenDropdown(null);
                          }}
                        >
                          {sub.label || sub.title}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right: WhatsApp chip + hamburger */}
          <div className="flex items-center max-lg:order-2 max-lg:ml-auto">
            <div className="flex items-center gap-[5px] max-sm:hidden">
              <div className="w-[40px] max-sm:w-[24px] h-auto block">
                <Image
                  src="/img/whatsapp.svg"
                  alt="WhatsApp"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div className="text-[11px] text-[#666] uppercase tracking-[0.5px]">
                  {identityData?.whatsappHeaderLabel || 'Book Hajj & Umrah'}
                </div>
                <a
                  href={identityData?.whatsappHeaderUrl || "https://wa.me/19056248344?text=Hi,%20I'm%20interested%20in%20your%20services!"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] max-sm:text-[13px] font-bold text-[#25D366] no-underline"
                >
                  {identityData?.whatsappHeaderText || '+1 905-624-8344'}
                </a>
              </div>
            </div>

            <button
              className="hidden max-xl:flex ml-5 max-lg:order-3 flex-col gap-[5px] cursor-pointer bg-transparent border-none p-0"
              id="menuToggle"
              aria-label="Toggle menu"
              onClick={() => {
                setMenuActive(!menuActive);
                setOpenDropdown(null);
              }}
            >
              <span className="block w-[25px] h-[3px] bg-[#333] rounded-[2px]"></span>
              <span className="block w-[25px] h-[3px] bg-[#333] rounded-[2px]"></span>
              <span className="block w-[25px] h-[3px] bg-[#333] rounded-[2px]"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
