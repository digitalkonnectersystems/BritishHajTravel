'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getShareTools } from '@/actions/pageActions';

export default function FloatingShareBar() {
  const pathname = usePathname();
  const [shareConfig, setShareConfig] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [delayedShow, setDelayedShow] = useState(false);

  // Do not show floating share bar inside admin panel or login routes
  if (pathname?.startsWith('/admin') || pathname === '/letstravel') {
    return null;
  }

  const fetchConfig = () => {
    let localData: any = null;
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('king_travel_share_tools');
      if (local) {
        try {
          localData = JSON.parse(local);
          setShareConfig(localData);
        } catch (e) {}
      }
    }
    getShareTools().then((data) => {
      if (data) {
        let finalData = { ...data };
        if (localData && localData.enabled !== undefined) {
          finalData.enabled = localData.enabled;
        }
        setShareConfig(finalData);
      }
    });
  };

  useEffect(() => {
    fetchConfig();

    const handleUpdate = () => {
      fetchConfig();
    };

    window.addEventListener('share_tools_updated', handleUpdate);
    return () => window.removeEventListener('share_tools_updated', handleUpdate);
  }, [pathname]);

  const isShareEnabled = Boolean(
    shareConfig &&
    shareConfig.enabled !== false &&
    shareConfig.enabled !== 'false' &&
    shareConfig.enabled !== 0 &&
    shareConfig.enabled !== '0' &&
    (shareConfig.enabled === true || shareConfig.enabled === 'true' || shareConfig.enabled === 1 || shareConfig.enabled === '1')
  );

  // Handle Delay Before Showing
  useEffect(() => {
    if (!shareConfig || !isShareEnabled) {
      setDelayedShow(false);
      return;
    }

    const delay = Number(shareConfig.delayBeforeShowing || 0);
    if (delay > 0) {
      setDelayedShow(false);
      const timer = setTimeout(() => setDelayedShow(true), delay);
      return () => clearTimeout(timer);
    } else {
      setDelayedShow(true);
    }
  }, [shareConfig, isShareEnabled]);

  // Handle Hide on Scroll Down
  useEffect(() => {
    if (!shareConfig?.hideOnScrollDown) {
      setIsVisible(true);
      return;
    }

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shareConfig?.hideOnScrollDown]);

  if (!shareConfig || !isShareEnabled || !delayedShow) {
    return null;
  }

  // Check Exclude Pages
  if (shareConfig.excludePages) {
    const excludedList = shareConfig.excludePages
      .split(',')
      .map((p: string) => p.trim().toLowerCase())
      .filter(Boolean);

    const currentPath = (pathname || '/').toLowerCase();
    const isExcluded = excludedList.some((ex: string) => currentPath.startsWith(ex));
    if (isExcluded) return null;
  }

  // Determine Share URL
  let targetUrl = '';
  if (typeof window !== 'undefined') {
    targetUrl =
      shareConfig.urlToShare === 'custom' && shareConfig.customShareUrl
        ? shareConfig.customShareUrl
        : window.location.href;
  }

  if (shareConfig.utmParameters && targetUrl) {
    try {
      const urlObj = new URL(
        targetUrl,
        typeof window !== 'undefined' ? window.location.origin : 'https://kingtravelcan.com'
      );
      urlObj.searchParams.set('utm_source', 'share_sidebar');
      urlObj.searchParams.set('utm_medium', 'social');
      targetUrl = urlObj.toString();
    } catch (e) {}
  }

  const handleShareClick = (platformId: string, name: string) => {
    if (shareConfig.trackClicks && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', shareConfig.gaEventName || 'share_click', {
        platform: platformId,
        url: targetUrl,
      });
    }

    let shareLink = '';
    const encodedUrl = encodeURIComponent(targetUrl);
    const title = encodeURIComponent(typeof document !== 'undefined' ? document.title : 'King Travel');

    switch (platformId) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent('Check this out: ' + targetUrl)}`;
        break;
      case 'x':
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${title}&body=${encodedUrl}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'pinterest':
        shareLink = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${title}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${title}`;
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: document.title, url: targetUrl }).catch(() => {});
          return;
        }
        shareLink = targetUrl;
    }

    if (shareConfig.openBehavior === 'same-tab') {
      window.location.href = shareLink;
    } else {
      window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=500');
    }
  };

  const activePlatforms = (shareConfig.activePlatforms || []).filter((p: any) => p.enabled);
  if (activePlatforms.length === 0) return null;

  // Icon Style classes
  const getStyleRadius = () => {
    switch (shareConfig.iconStyle) {
      case 'circle':
        return 'rounded-full';
      case 'flat':
        return 'rounded-none';
      case 'minimal':
        return 'rounded-md shadow-none';
      default:
        return 'rounded-xl'; // rounded-square
    }
  };

  // Positioning: Left vs Right attachment
  const isRight = (shareConfig.sidebarEdge || 'right') === 'right';
  const edgeGap = shareConfig.gapFromEdge ?? 20;

  const verticalPos = shareConfig.verticalPosition || 'center';
  const topStyle = verticalPos === 'top' ? '20px' : verticalPos === 'bottom' ? 'auto' : '50%';
  const bottomStyle = verticalPos === 'bottom' ? '20px' : 'auto';
  const transformStyle = verticalPos === 'center' ? 'translateY(-50%)' : 'none';

  return (
    <div
      ref={(el) => {
        if (el) {
          if (isRight) {
            el.style.right = `${edgeGap}px`;
            el.style.left = 'auto';
          } else {
            el.style.left = `${edgeGap}px`;
            el.style.right = 'auto';
          }
          el.style.top = topStyle;
          el.style.bottom = bottomStyle;
          el.style.transform = transformStyle;
        }
      }}
      className={`fixed z-[9999] flex flex-col gap-2 p-2 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl border border-slate-200/80 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-x-0' : isRight ? 'opacity-0 translate-x-12' : 'opacity-0 -translate-x-12'
      }`}
    >
      {activePlatforms.map((p: any) => {
        let bg = p.color || '#004B39';
        let txtColor = '#ffffff';

        if (shareConfig.colorScheme === 'monochrome') {
          bg = '#1e293b';
        } else if (shareConfig.colorScheme === 'custom') {
          bg = shareConfig.customBgColor || '#004B39';
          txtColor = shareConfig.customTextColor || '#ffffff';
        }

        const iconSize = shareConfig.iconSize || 40;

        return (
          <button
            key={p.id}
            type="button"
            onClick={() => handleShareClick(p.id, p.name)}
            title={`Share on ${p.name}`}
            ref={(btn) => {
              if (btn) {
                btn.style.backgroundColor = bg;
                btn.style.color = txtColor;
                btn.style.minWidth = shareConfig.showLabels ? 'auto' : `${iconSize}px`;
                btn.style.minHeight = `${iconSize}px`;
                btn.style.paddingLeft = shareConfig.showLabels ? '12px' : '6px';
                btn.style.paddingRight = shareConfig.showLabels ? '14px' : '6px';
              }
            }}
            className={`flex items-center gap-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md border-none p-1.5 ${getStyleRadius()}`}
          >
            <div
              ref={(ic) => {
                if (ic) {
                  const sz = Math.max(16, iconSize - 16);
                  ic.style.width = `${sz}px`;
                  ic.style.height = `${sz}px`;
                }
              }}
              className="flex items-center justify-center font-bold text-xs"
            >
              {p.id === 'facebook' && <i className="fa-brands fa-facebook-f text-sm"></i>}
              {p.id === 'whatsapp' && <i className="fa-brands fa-whatsapp text-base"></i>}
              {(p.id === 'x' || p.id === 'twitter') && <i className="fa-brands fa-x-twitter text-sm"></i>}
              {p.id === 'email' && <i className="fa-solid fa-envelope text-xs"></i>}
              {p.id === 'linkedin' && <i className="fa-brands fa-linkedin-in text-sm"></i>}
              {p.id === 'pinterest' && <i className="fa-brands fa-pinterest text-sm"></i>}
              {p.id === 'telegram' && <i className="fa-brands fa-telegram text-sm"></i>}
              {!['facebook', 'whatsapp', 'x', 'twitter', 'email', 'linkedin', 'pinterest', 'telegram'].includes(p.id) && (
                <span>{p.name.charAt(0)}</span>
              )}
            </div>
            {shareConfig.showLabels && (
              <span className="text-xs font-bold whitespace-nowrap pr-1">{p.name}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
