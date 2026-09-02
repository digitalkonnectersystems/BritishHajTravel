'use client';

import React from 'react';
import DynamicIcon from '@/components/ui/DynamicIcon';

export default function Banner4GridsSection({ data }: { data: any }) {
  const items = data?.items || [
    { icon: 'Shield', title: 'ATOL PROTECTED' },
    { icon: 'Building', title: 'SAUDI MINISTRY APPROVED' },
    { icon: 'Plane', title: 'IATA ACCREDITED' },
    { icon: 'Award', title: 'ABTA BONDED' },
  ];

  return (
    <div className="w-full bg-sage">
      <section className="relative -mt-15 md:-mt-21 z-10 max-w-4xl w-[calc(100%-3rem)] md:w-full mx-auto !pb-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="bg-white rounded-lg px-2 py-8 flex flex-col items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-ink-soft mb-3 bg-gold/10">
                <DynamicIcon name={item.icon || 'Star'} className="w-8 h-8" />
              </div>
              <span className="text-[10px] md:text-xs font-bold text-ink tracking-wider text-center uppercase">{item.title}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
