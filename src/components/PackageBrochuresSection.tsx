'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react';

interface PackageBrochureItem {
  image: string;
  alt?: string;
  title?: string;
  link?: string;
  url?: string;
}

interface PackageBrochuresSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    description?: string;
    images?: (string | PackageBrochureItem)[];
    items?: PackageBrochureItem[];
  };
  pageData?: any;
}

export default function PackageBrochuresSection({ data, pageData }: PackageBrochuresSectionProps) {
  const [popupIdx, setPopupIdx] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  // Drag-to-pan state for zoomed image
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch pan tracking (separate from swipe-to-slide)
  const [touchPanStart, setTouchPanStart] = useState<{ x: number; y: number } | null>(null);
  const [touchPanOffset, setTouchPanOffset] = useState({ x: 0, y: 0 });

  // Double-tap tracking for mobile zoom toggle
  const lastTapRef = useRef<number>(0);

  const eyebrow = data?.eyebrow;
  const title = data?.title;
  const description = data?.description;

  const rawList: (string | PackageBrochureItem)[] =
    (Array.isArray(data?.images) && data.images.length > 0)
      ? data.images
      : (Array.isArray(data?.items) && data.items.length > 0)
        ? data.items
        : [];

  const brochures: { src: string; alt: string; link?: string }[] = rawList
    .map((item) => {
      if (typeof item === 'string') {
        return { src: item.trim(), alt: 'Package Brochure' };
      }
      if (item && typeof item === 'object' && item.image) {
        return {
          src: item.image.trim(),
          alt: item.alt || item.title || 'Package Brochure',
          link: item.link || item.url || '',
        };
      }
      return null;
    })
    .filter((b): b is { src: string; alt: string; link?: string } => Boolean(b && b.src));

  const total = brochures.length;

  const nextSlide = useCallback(() => {
    if (popupIdx !== null && total > 1) {
      setPopupIdx((popupIdx + 1) % total);
      setZoomed(false);
      setDragOffset({ x: 0, y: 0 });
      setTouchPanOffset({ x: 0, y: 0 });
    }
  }, [popupIdx, total]);

  const prevSlide = useCallback(() => {
    if (popupIdx !== null && total > 1) {
      setPopupIdx((popupIdx - 1 + total) % total);
      setZoomed(false);
      setDragOffset({ x: 0, y: 0 });
      setTouchPanOffset({ x: 0, y: 0 });
    }
  }, [popupIdx, total]);

  const closePopup = useCallback(() => {
    setPopupIdx(null);
    setZoomed(false);
    setDragOffset({ x: 0, y: 0 });
    setTouchPanOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (popupIdx === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
      else if (e.key === 'ArrowRight') nextSlide();
      else if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [popupIdx, nextSlide, prevSlide, closePopup]);

  if (brochures.length === 0) return null;

  const isSingle = brochures.length === 1;

  return (
    <>
      <section className="pt-12 md:pt-16 pb-0 bg-sage">
        <div className="max-w-[1400px] mx-auto px-5">
          {(eyebrow || title || description) && (
            <div className="flex flex-col items-center text-center mb-10 md:mb-12">
              {eyebrow && (
                <span className="eyebrow mx-auto mb-2 text-primary font-bold text-xs uppercase tracking-widest">
                  {eyebrow}
                </span>
              )}
              {title && (
                <h2
                  className="section-heading text-2xl md:text-4xl font-extrabold uppercase text-primary tracking-tight"
                  dangerouslySetInnerHTML={{ __html: title }}
                />
              )}
              {description && (
                <p className="max-w-2xl mx-auto text-slate-600 text-sm md:text-base mt-2 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          )}

          {isSingle ? (
            <div className="flex justify-center items-center w-full">
              <div
                onClick={() => setPopupIdx(0)}
                className="w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 transition-all duration-300 hover:shadow-2xl group cursor-pointer"
              >
                <img
                  src={brochures[0].src}
                  alt={brochures[0].alt}
                  className="w-full h-auto block select-none transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
              {brochures.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setPopupIdx(idx)}
                  className="w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full group cursor-pointer"
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-full object-cover block select-none flex-1 transition-transform duration-500 group-hover:scale-[1.01]"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popup Modal — plain dark overlay, no backdrop blur */}
      {popupIdx !== null && brochures[popupIdx] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999999] bg-black/85 flex flex-col items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={closePopup}
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 45) diff > 0 ? nextSlide() : prevSlide();
            setTouchStartX(null);
          }}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white pb-3 px-1 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              {total > 1 && (
                <span className="bg-gold px-3 py-1 rounded-full text-xs font-bold text-ink tracking-widest uppercase">
                  {popupIdx + 1} / {total}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Magnifying glass 1x / 2x zoom toggle pill */}
              <button
                type="button"
                onClick={() => {
                  if (zoomed) { setZoomed(false); setDragOffset({ x: 0, y: 0 }); }
                  else setZoomed(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors shadow cursor-pointer select-none"
                title={zoomed ? 'Zoom Out (1x)' : 'Zoom In (2x)'}
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0" />
                <span className={`transition-all duration-200 ${!zoomed ? 'underline underline-offset-2' : 'opacity-40'}`}>1x</span>
                <span className="opacity-30 mx-0.5">|</span>
                <span className={`transition-all duration-200 ${zoomed ? 'underline underline-offset-2' : 'opacity-40'}`}>2x</span>
              </button>

              {brochures[popupIdx].link && (
                <a
                  href={
                    brochures[popupIdx].link?.startsWith('wa.me')
                      ? `https://${brochures[popupIdx].link}`
                      : brochures[popupIdx].link
                  }
                  target={
                    brochures[popupIdx].link?.startsWith('http') || brochures[popupIdx].link?.startsWith('wa.me')
                      ? '_blank'
                      : undefined
                  }
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary hover:bg-[#00382B] text-white text-xs font-bold transition-colors shadow"
                >
                  <span>Open Link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                type="button"
                onClick={closePopup}
                className="w-9 h-9 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Image + Nav Area */}
          <div
            className="relative w-full max-w-4xl flex items-center justify-center"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {total > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                className="absolute left-2 sm:-left-12 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold hover:bg-primary text-white flex items-center justify-center transition-all shadow-lg border border-white/20 cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Draggable pan container when zoomed, normal view when default */}
            <div
              className="rounded-xl shadow-2xl bg-white select-none overflow-hidden flex items-center justify-center"
              style={{
                maxHeight: '80vh',
                maxWidth: '100%',
                cursor: zoomed ? (isDragging ? 'grabbing' : 'grab') : 'default',
              }}
              onMouseDown={zoomed ? (e) => {
                setIsDragging(true);
                setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
                e.preventDefault();
              } : undefined}
              onMouseMove={zoomed && isDragging ? (e) => {
                setDragOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
              } : undefined}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchStart={(e) => {
                if (zoomed && e.touches.length === 1) {
                  // Start finger pan
                  const t = e.touches[0];
                  setTouchPanStart({ x: t.clientX - touchPanOffset.x, y: t.clientY - touchPanOffset.y });
                  setIsDragging(true);
                  e.stopPropagation(); // prevent outer swipe handler
                }
              }}
              onTouchMove={(e) => {
                if (zoomed && isDragging && touchPanStart && e.touches.length === 1) {
                  const t = e.touches[0];
                  const newOffset = { x: t.clientX - touchPanStart.x, y: t.clientY - touchPanStart.y };
                  setTouchPanOffset(newOffset);
                  setDragOffset(newOffset);
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              onTouchEnd={(e) => {
                setIsDragging(false);
                setTouchPanStart(null);
                // Double-tap to toggle zoom on mobile
                const now = Date.now();
                const gap = now - lastTapRef.current;
                if (gap < 300 && gap > 0) {
                  if (zoomed) { setZoomed(false); setDragOffset({ x: 0, y: 0 }); setTouchPanOffset({ x: 0, y: 0 }); }
                  else setZoomed(true);
                  e.stopPropagation();
                }
                lastTapRef.current = now;
              }}
            >
              <img
                src={brochures[popupIdx].src}
                alt={brochures[popupIdx].alt}
                className="block select-none"
                style={{
                  transform: zoomed
                    ? `scale(2) translate(${dragOffset.x / 2}px, ${dragOffset.y / 2}px)`
                    : 'scale(1)',
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                  maxHeight: zoomed ? 'none' : '80vh',
                  maxWidth: zoomed ? 'none' : '100%',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
                draggable={false}
              />
            </div>

            {total > 1 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                className="absolute right-2 sm:-right-12 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gold hover:bg-primary text-white flex items-center justify-center transition-all shadow-lg border border-white/20 cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

