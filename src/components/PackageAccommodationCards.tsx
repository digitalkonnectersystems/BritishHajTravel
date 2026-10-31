"use client";
import Image from 'next/image';
import { MapPin, MoonStar } from 'lucide-react';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { visiblePackageHotels } from '@/lib/packageHotelEntries';

export default function PackageAccommodationCards({ detail, card, pkg }: { detail: any; card?: any; pkg?: any }) {
  const hotels = visiblePackageHotels(detail, card, pkg);
  if (!hotels.length) return null;
  return <section>
    <h3 className="text-xl sm:text-2xl font-bold font-serif text-primary mb-5">Premium Accommodations</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {hotels.map((hotel) => <article key={hotel.id} className="bg-white rounded-2xl overflow-hidden border border-blue-100 shadow-md flex flex-col">
        <div className="relative h-48 bg-slate-100">
          {hotel.image ? <Image src={hotel.image} alt={hotel.name || hotel.label} fill unoptimized className="object-cover" /> : <div className="h-full flex items-center justify-center text-slate-400 text-xs">No image available</div>}
          <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">{hotel.label}</span>
        </div>
        <div className="p-5 flex-1 space-y-3">
          <h4 className="font-bold text-primary text-base">{hotel.name}</h4>
          {hotel.location && <p className="text-xs text-slate-600 flex gap-1 items-start"><MapPin className="w-4 h-4 shrink-0" /> {hotel.location}</p>}
          {hotel.description && <p className="text-sm text-slate-600 whitespace-pre-line">{hotel.description}</p>}
          <div className="flex flex-wrap gap-2 text-xs">
            {hotel.badgeEnabled !== false && hotel.badge && <span className="flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 px-2 py-1 text-primary"><DynamicIcon name={hotel.badgeIcon || 'Utensils'} className="w-3 h-3" />{hotel.badge}</span>}
            {hotel.durationEnabled !== false && hotel.nights && <span className="flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-slate-600"><MoonStar className="w-3 h-3" />{hotel.nights}</span>}
          </div>
        </div>
      </article>)}
    </div>
  </section>;
}
