"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { normalizeFlightUrl } from "@/lib/flightUrl";
import { Menu, X } from "lucide-react";

const DEFAULT_NAV_ITEMS: any[] = [];

export default function Header({ initialNavItems = DEFAULT_NAV_ITEMS, initialIdentity = null }: { initialNavItems?: any[]; initialIdentity?: any }) {
  const [menuActive, setMenuActive] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navItems = Array.isArray(initialNavItems) ? initialNavItems : DEFAULT_NAV_ITEMS;
  const identityData = initialIdentity;
  const pathname = usePathname();
  const activePathname = pathname === '/cheap-flights-air-tickets' || pathname === '/airlines'
    ? '/flights'
    : pathname;

  useEffect(() => {
    setMenuActive(false);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (!menuActive) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuActive(false);
        setOpenDropdown(null);
      }
    };

    const closeOnDesktop = () => {
      if (window.innerWidth >= 1280) {
        setMenuActive(false);
        setOpenDropdown(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnDesktop);
    };
  }, [menuActive]);

  useEffect(() => {
    if (!openDropdown) return;

    const dismissOnOutsidePointer = (event: PointerEvent) => {
      const dropdown = document.getElementById(openDropdown);
      if (event.target instanceof Node && dropdown?.parentElement && !dropdown.parentElement.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDropdown(null);
    };

    document.addEventListener("pointerdown", dismissOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openDropdown]);

  if (pathname?.startsWith("/admin") || pathname === "/letstravel") {
    return null;
  }

  const closeMenu = () => {
    setMenuActive(false);
    setOpenDropdown(null);
  };

  const whatsappUrl = identityData?.whatsappHeaderUrl || "";
  const whatsappText = identityData?.whatsappHeaderText || "";
  const whatsappLabel = identityData?.whatsappHeaderLabel || "";

  return (
    <>
      <header className="sticky top-0 z-[1000] w-full border-b border-gray-100 bg-white shadow-[0_2px_24px_-12px_rgba(19,39,35,0.18)]">
        <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between gap-2 px-5 pe-4 xl:pe-5 xl:gap-4">
          

          <div className="w-full max-w-[200px] shrink-0 transition-opacity hover:opacity-95 sm:max-w-[250px]">
            <Link href="/" onClick={closeMenu} className="block">
              {identityData?.logo ? (
                identityData.logo.startsWith("data:") ? (
                  <img
                    src={identityData.logo}
                    alt={identityData.logoAlt || identityData.siteName || "British Hajj Travel Logo"}
                    className="max-h-[60px] w-full object-contain"
                  />
                ) : (
                  <Image
                    src={identityData.logo}
                    alt={identityData.logoAlt || identityData.siteName || "British Hajj Travel Logo"}
                    width={250}
                    height={60}
                    priority
                    className="h-auto w-full"
                    unoptimized
                  />
                )
              ) : identityData?.siteName ? (
                <span className="font-semibold text-primary">{identityData.siteName}</span>
              ) : null}
            </Link>
          </div>

          <nav
            id="main-nav"
            aria-label="Main navigation"
            className={`fixed inset-y-0 left-0 z-[1001] flex h-dvh w-[min(88vw,360px)] flex-col justify-between overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out xl:static xl:h-auto xl:w-auto xl:flex-row xl:items-center xl:justify-end xl:gap-1 xl:overflow-visible xl:bg-transparent xl:p-0 xl:shadow-none xl:transition-none ${
              menuActive ? "translate-x-0" : "-translate-x-full"
            } xl:translate-x-0`}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 xl:hidden">
              <div className="w-full max-w-[200px] shrink-0 transition-opacity hover:opacity-95 sm:max-w-[250px]">
            <Link href="/" onClick={closeMenu} className="block">
              {identityData?.logo ? (
                identityData.logo.startsWith("data:") ? (
                  <img
                    src={identityData.logo}
                    alt={identityData.logoAlt || identityData.siteName || "British Hajj Travel Logo"}
                    className="max-h-[60px] w-full object-contain"
                  />
                ) : (
                  <Image
                    src={identityData.logo}
                    alt={identityData.logoAlt || identityData.siteName || "British Hajj Travel Logo"}
                    width={250}
                    height={60}
                    priority
                    className="h-auto w-full"
                    unoptimized
                  />
                )
              ) : identityData?.siteName ? (
                <span className="font-semibold text-primary">{identityData.siteName}</span>
              ) : null}
            </Link>
          </div>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Close navigation menu"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition hover:bg-[#ED1C24] hover:text-white"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-col space-y-1 pt-4 xl:flex-row xl:items-center xl:space-y-0 xl:pt-0 h-full gap-1">
              {navItems.map((item, index) => {
                const itemHref = normalizeFlightUrl(item.url || item.href || '#');
                const itemLabel = item.label || item.title;
                const hasChildren = item.children && item.children.length > 0;
                const isParentActive = activePathname === itemHref || (hasChildren && item.children.some((sub: any) => activePathname === normalizeFlightUrl(sub.url || sub.href || '#')));
                const dropdownId = `nav-dropdown-${index}`;
                const isDropdownOpen = openDropdown === dropdownId;
                const linkClasses = `block w-full rounded-lg px-3 py-3 text-left text-sm font-bold uppercase tracking-[0.02em] text-[var(--ink)] transition-colors hover:bg-gray-50 hover:text-[var(--red)] xl:w-auto xl:rounded-none xl:px-2 xl:py-6 xl:text-[clamp(0.75rem,0.92vw,1rem)] xl:hover:bg-transparent ${
                  isParentActive ? "!text-[#ED1C24]" : ""
                }`;

                if (!hasChildren) {
                  return (
                    <Link key={item.id || itemHref} href={itemHref} onClick={closeMenu} className={linkClasses}>
                      {itemLabel}
                    </Link>
                  );
                }

                return (
                  <div
                    key={item.id || itemHref}
                    className="relative xl:group"
                    onMouseEnter={() => {
                      if (window.matchMedia("(min-width: 1280px) and (hover: hover) and (pointer: fine)").matches) {
                        setOpenDropdown(dropdownId);
                      }
                    }}
                    onMouseLeave={() => {
                      if (window.matchMedia("(min-width: 1280px) and (hover: hover) and (pointer: fine)").matches) {
                        setOpenDropdown((current) => current === dropdownId ? null : current);
                      }
                    }}
                    onBlur={(event) => {
                      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        setOpenDropdown((current) => current === dropdownId ? null : current);
                      }
                    }}
                  >
                    <div className="flex items-center">
                      <Link
                        href={itemHref}
                        onClick={closeMenu}
                        onFocus={() => {
                          if (window.innerWidth >= 1280) setOpenDropdown(dropdownId);
                        }}
                        className={`${linkClasses} flex-1 xl:flex-none xl:pr-1 ${isParentActive ? "!text-[#ED1C24]" : ""}`}
                      >
                        {itemLabel}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Toggle ${itemLabel} submenu`}
                        aria-controls={dropdownId}
                        aria-expanded={isDropdownOpen}
                        onClick={() => setOpenDropdown((current) => current === dropdownId ? null : dropdownId)}
                        className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#2E3192] transition hover:bg-gray-50 hover:text-[#ED1C24] xl:ml-0 xl:h-auto xl:w-auto xl:rounded-none xl:hover:bg-transparent"
                      >
                        <span
                          aria-hidden="true"
                          className={`block h-0 w-0 border-x-[3px] border-t-[4px] border-x-transparent border-t-current transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                    <div
                      id={dropdownId}
                      className={`header-nav-dropdown ml-3 border-l-2 border-gray-100 pl-2 ${
                        isDropdownOpen ? "block xl:visible xl:pointer-events-auto xl:opacity-100" : "hidden xl:invisible xl:pointer-events-none xl:opacity-0"
                      } xl:absolute xl:left-0 xl:top-full xl:z-20 xl:ml-0 xl:block xl:min-w-48 xl:rounded-b-xl xl:border xl:border-gray-100 xl:bg-white xl:py-2 xl:pl-0 xl:shadow-xl xl:transition-opacity xl:duration-200`}
                    >
                      {item.children.map((sub: any) => {
                        const subHref = normalizeFlightUrl(sub.url || sub.href || "#");
                        const isSubActive = activePathname === subHref;
                        return (
                          <Link
                            key={sub.id || subHref}
                            href={subHref}
                            onClick={closeMenu}
                            className={`block rounded-md px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-red-50 hover:text-[#ED1C24] xl:rounded-none xl:px-4 ${
                              isSubActive ? "font-bold text-[#ED1C24]" : ""
                            }`}
                          >
                            {sub.label || sub.title}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {whatsappUrl ? <div className="border-t border-gray-100 pt-4 xl:hidden">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]">
                  <Image src="/img/whatsapp.svg" alt="" width={25} height={25} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase text-gray-400">{whatsappLabel}</span>
                  <span className="block text-sm font-extrabold text-[#25D366]">{whatsappText}</span>
                </span>
              </a>
            </div> : null}
          </nav>
          
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            
            {whatsappUrl ? <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${whatsappLabel}: ${whatsappText}`}
              className="group flex h-10 w-10 items-center justify-center transition-colors duration-300 hover:bg-[#25D366]"
            >
              <Image
                src="/img/whatsapp.svg"
                alt=""
                width={40}
                height={40}
                className="transition-opacity group-hover:opacity-80"
              />
            </a> : null}
            {whatsappText ? <div className="hidden flex-col text-left sm:flex gap-1">
              <span className="text-[9px] font-bold uppercase leading-tight tracking-wider text-gray-500 md:text-[10px]">
                {whatsappLabel}
              </span>
              <a
                href={`tel:${whatsappText.replace(/[^\d+]/g, "")}`}
                className="text-xs font-extrabold leading-tight tracking-tight text-[#25D366] hover:underline md:text-lg"
              >
                {whatsappText}
              </a>
            </div> : null}
            
            <button
              type="button"
              className="rounded-lg p-2 text-gray-700 transition hover:text-[#1E2B78] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E2B78]/30 xl:hidden"
              aria-label={menuActive ? "Close navigation menu" : "Open navigation menu"}
              aria-controls="main-nav"
              aria-expanded={menuActive}
              onClick={() => {
                setMenuActive((active) => !active);
                setOpenDropdown(null);
              }}
            >
              {menuActive ? <X size={23} aria-hidden="true" /> : <Menu size={23} aria-hidden="true" />}
            </button>

            
          </div>
        </div>
      </header>

      <button
        type="button"
        aria-label="Close navigation menu"
        tabIndex={menuActive ? 0 : -1}
        onClick={closeMenu}
        className={`fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          menuActive ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
    </>
  );
}
