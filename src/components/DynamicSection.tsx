"use client";

import Image from 'next/image';
import Link from 'next/link';
import MarqueeTrack from '@/components/MarqueeTrack';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';
import DynamicIcon from '@/components/ui/DynamicIcon';

export default function DynamicSection({ sec, idx }: { sec: any; idx: number }) {
  if (!sec || !sec.type) return null;

  return (
    <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
      {sec.title && <h2 className="text-2xl font-bold text-slate-800 mb-4">{sec.title}</h2>}
      {sec.data?.description && <p className="text-slate-600 leading-relaxed">{sec.data.description}</p>}
    </div>
  );
}
