'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { getDisclaimerSettings } from '@/actions/pageActions';

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

export default function DisclaimerPopupModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState('');
  const [altText, setAltText] = useState('');

  useEffect(() => {
    // 1. Popup MUST only display on frontend Homepage ('/')
    if (pathname !== '/') {
      setOpen(false);
      return;
    }

    // 2. Check 12-Hour Interval & Max 2 Times display limit
    try {
      const now = Date.now();
      const rawHistory = localStorage.getItem('disclaimer_impressions_v1');
      let history = rawHistory ? JSON.parse(rawHistory) : null;

      if (!history || now - history.windowStart > TWELVE_HOURS_MS) {
        history = { count: 0, windowStart: now };
      }

      // If user has already seen popup 2 times in the last 12 hours, do NOT display
      if (history.count >= 2) {
        return;
      }

      getDisclaimerSettings().then((settings) => {
        if (settings && settings.enabled && settings.image) {
          setImage(settings.image);
          setAltText(settings.altText || 'Disclaimer Popup');
          setOpen(true);

          // Increment impression counter
          history.count += 1;
          localStorage.setItem('disclaimer_impressions_v1', JSON.stringify(history));
        }
      });
    } catch (err) {
      console.warn('Disclaimer popup impression check error:', err);
    }

    const handleDisclaimerUpdate = (e: CustomEvent) => {
      if (e.detail && pathname === '/') {
        if (e.detail.enabled && e.detail.image) {
          setImage(e.detail.image);
          setAltText(e.detail.altText || 'Disclaimer Popup');
          setOpen(true);
        } else {
          setOpen(false);
        }
      }
    };

    window.addEventListener('disclaimer_updated' as any, handleDisclaimerUpdate);
    return () => {
      window.removeEventListener('disclaimer_updated' as any, handleDisclaimerUpdate);
    };
  }, [pathname]);

  const handleClose = () => {
    setOpen(false);
  };

  if (!open || !image || pathname !== '/') return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-w-lg w-full relative flex flex-col items-center p-4 lg:p-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center transition-colors cursor-pointer border-none"
          title="Close Disclaimer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-full rounded-2xl overflow-hidden mb-4 max-h-[70vh] flex items-center justify-center bg-slate-100">
          <img src={image} alt={altText} className="w-full h-auto object-contain" />
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="w-full bg-primary hover:bg-[#00382B] text-white font-extrabold text-xs py-3 rounded-xl transition-colors cursor-pointer shadow-md"
        >
          I Understand & Close
        </button>
      </div>
    </div>
  );
}
