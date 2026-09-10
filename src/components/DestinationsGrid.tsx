'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DestinationsGrid({ destinations = [], title = 'Destinations' }: { destinations?: any[]; title?: string }) {
  const [activeImages, setActiveImages] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!destinations.some((destination) => destination.bannerImages?.length > 1)) return;
    const timer = window.setInterval(() => {
      setActiveImages((current) => {
        const next = { ...current };
        destinations.forEach((destination) => {
          const imageCount = destination.bannerImages?.length || 1;
          if (imageCount > 1) next[destination.id] = ((current[destination.id] || 0) + 1) % imageCount;
        });
        return next;
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [destinations]);

  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-[1150px] mx-auto px-3">
        <h1 className="text-center text-primary text-3xl md:text-4xl font-medium mb-9">{title}</h1>
        {destinations.length === 0 ? (
          <p className="text-center text-slate-500 py-12">Destinations coming soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-7 gap-y-8">
            {destinations.map((destination) => {
              const images = destination.bannerImages?.length ? destination.bannerImages : ['/img/sections/hajj_1.jpg'];
              const activeImage = activeImages[destination.id] || 0;
              return (
                <Link key={destination.id} href={`/destinations/${destination.slug}`} className="group border border-[#c8c8c8] bg-white no-underline overflow-hidden">
                  <div className="relative aspect-[1.7] overflow-hidden bg-slate-100">
                    {images.map((image: string, index: number) => <Image key={`${image}-${index}`} src={image} alt={index === activeImage ? destination.title : ''} fill unoptimized className={`object-cover transition-opacity duration-1000 ${index === activeImage ? 'opacity-100' : 'opacity-0'}`} />)}
                    {images.length > 1 && <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">{images.map((_: string, index: number) => <span key={index} className={`h-1.5 w-1.5 rounded-full ${index === activeImage ? 'bg-white' : 'bg-white/50'}`} />)}</div>}
                  </div>
                  <div className="min-h-[36px] px-2 py-2 flex items-center justify-center text-center text-[#142f91] font-extrabold uppercase text-base leading-tight">
                    {destination.title}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}