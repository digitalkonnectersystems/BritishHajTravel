'use client';

import { Plus, Trash2 } from 'lucide-react';
import { type PackageHotelCard } from '@/lib/packageHotelEntries';
import ImageUploadWidget from './ImageUploadWidget';
import IconPicker from './IconPicker';
import DurationInput from './DurationInput';
import { formatDuration } from '@/lib/packageHelpers';

/** Reusable hotel list editor, including for per-CMS-section overrides. */
export default function PackageHotelCardsEditor({
  hotels, onChange, title = 'Accommodation cards',
}: { hotels: PackageHotelCard[]; onChange: (hotels: PackageHotelCard[]) => void; title?: string }) {
  const addHotel = () => onChange([...hotels, {
    id: `hotel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: 'New Hotel', name: '', location: '', image: '', badge: '', nights: '',
    isVisible: true, badgeEnabled: true, durationEnabled: true,
  }]);
  const updateAt = (index: number, key: keyof PackageHotelCard, value: any) =>
    onChange(hotels.map((h, i) => i === index ? { ...h, [key]: value } : h));
  const move = (index: number, delta: number) => {
    const next = [...hotels], target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const textInputClass = 'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900';
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h4 className="text-xs font-extrabold uppercase text-primary">{title}</h4>
      <button type="button" onClick={addHotel} className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">
        <Plus className="w-3.5 h-3.5" /> Add Hotel
      </button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {hotels.map((hotel, index) => <div key={hotel.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <strong className="text-xs text-primary">{hotel.name || hotel.label || `Hotel ${index + 1}`}</strong>
          <div className="flex items-center gap-2 text-xs">
            <button type="button" onClick={() => updateAt(index, 'isVisible', hotel.isVisible === false)} className="text-primary underline">{hotel.isVisible === false ? 'Show' : 'Hide'}</button>
            <button type="button" disabled={index === 0} onClick={() => move(index, -1)} title="Move hotel up" className="disabled:opacity-30">↑</button>
            <button type="button" disabled={index === hotels.length - 1} onClick={() => move(index, 1)} title="Move hotel down" className="disabled:opacity-30">↓</button>
            <button type="button" onClick={() => {
              if (window.confirm(`Remove ${hotel.name || hotel.label || 'this hotel'} from this section?`)) onChange(hotels.filter((_, i) => index !== i));
            }} title="Delete hotel" className="text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
        {([['label', 'Accommodation label'], ['name', 'Hotel name'], ['location', 'Location / distance'], ['description', 'Additional hotel details']] as const).map(([field, caption]) =>
          <label key={field} className="block text-[10px] font-bold text-slate-600 uppercase">{caption}
            <input type="text" value={hotel[field] || ''} onChange={e => updateAt(index, field, e.target.value)} className={textInputClass} />
          </label>
        )}
        <div><span className="text-[10px] font-bold text-slate-600 uppercase">Hotel image</span>
          <ImageUploadWidget value={hotel.image} onChange={url => updateAt(index, 'image', url)} compact subfolder="hotels" />
        </div>
        <div className="flex gap-2 items-end">
          <div className="w-32"><label className="text-[10px] font-bold text-slate-600">Badge icon</label><IconPicker value={hotel.badgeIcon || 'Utensils'} onChange={val => updateAt(index, 'badgeIcon', val)} /></div>
          <label className="flex-1 text-[10px] font-bold text-slate-600 uppercase">Board / meal badge
            <input type="text" value={hotel.badge} onChange={e => updateAt(index, 'badge', e.target.value)} className={textInputClass} />
          </label>
        </div>
        <div><span className="text-[10px] font-bold text-slate-600 uppercase">Stay duration</span>
          <DurationInput value={hotel.nights || ''} onChange={val => updateAt(index, 'nights', formatDuration(val))} defaultUnit="nights" />
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={hotel.badgeEnabled !== false} onChange={e => updateAt(index, 'badgeEnabled', e.target.checked)} /> Show badge</label>
          <label className="flex items-center gap-1.5"><input type="checkbox" checked={hotel.durationEnabled !== false} onChange={e => updateAt(index, 'durationEnabled', e.target.checked)} /> Show duration</label>
        </div>
      </div>)}
    </div>
    {hotels.length === 0 && <p className="text-xs text-slate-500">No hotel cards. Use Add Hotel to create one.</p>}
  </div>;
}
