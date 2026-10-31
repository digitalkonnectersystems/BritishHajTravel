'use client';

import { useState } from 'react';
import { Plus, Trash2, Utensils, Eye, EyeOff } from 'lucide-react';
import TiptapEditor from './TiptapEditor';
import ImageUploadWidget from './ImageUploadWidget';
import DurationInput from './DurationInput';
import IconPicker from './IconPicker';
import { formatDuration } from '@/lib/packageHelpers';
import { getPackageHotelEntries, type PackageHotelCard } from '@/lib/packageHotelEntries';

export interface DetailPageData {
  durationText?: string;
  departure?: string;
  destination?: string;
  exclusiveBadge?: string;
  makkahHotel?: {
    name: string;
    location: string;
    badge: string;
    badgeIcon?: string;
    nights: string;
    nightsIcon?: string;
    image: string;
  };
  madinahHotel?: {
    name: string;
    location: string;
    badge: string;
    badgeIcon?: string;
    nights: string;
    nightsIcon?: string;
    image: string;
  };
  aziziyaHotel?: {
    name: string;
    location: string;
    badge: string;
    badgeIcon?: string;
    nights: string;
    nightsIcon?: string;
    image: string;
  };
  minaHotel?: {
    name: string;
    location: string;
    badge: string;
    badgeIcon?: string;
    nights: string;
    nightsIcon?: string;
    image: string;
  };
  hotelCards?: PackageHotelCard[];
  overview: {
    groupTitle: string;
    items: string[];
  }[];
  highlights: { text: string; isCross: boolean }[];
  eligibility: string[];
  importantBooking: string;
  faqs: { question: string; answer: string }[];
}

export const defaultDetailPageData: DetailPageData = {
  durationText: '',
  departure: '',
  destination: '',
  exclusiveBadge: '',
  makkahHotel: { name: '', location: '', badge: '', nights: '', image: '' },
  madinahHotel: { name: '', location: '', badge: '', nights: '', image: '' },
  aziziyaHotel: { name: '', location: '', badge: '', nights: '', image: '' },
  minaHotel: { name: '', location: '', badge: '', nights: '', image: '' },
  overview: [],
  highlights: [],
  eligibility: [],
  importantBooking: '',
  faqs: []
};

export default function DetailPageDataFields({
  data,
  onChange,
  onHotelSync,
  packagesGallery = [],
  onGalleryChange,
  cardData
}: {
  data: DetailPageData;
  onChange: (newData: DetailPageData) => void;
  onHotelSync?: (hotelKey: string, field: string, val: string) => void;
  packagesGallery?: string[];
  onGalleryChange?: (gallery: string[]) => void;
  cardData?: any;
}) {
  const d = data || defaultDetailPageData;

  const update = (field: keyof DetailPageData, val: any) => {
    onChange({ ...d, [field]: val });
  };

  const updateHotel = (hotelKey: keyof DetailPageData, field: string, val: any) => {
    const current = (d[hotelKey] as any) || { name: '', location: '', badge: '', nights: '', image: '' };
    update(hotelKey, { ...current, [field]: val });
    if (onHotelSync) onHotelSync(hotelKey as string, field, val);
  };

  return (
    <div className="col-span-full space-y-8 animate-in fade-in duration-300">

      {/* Top Banner Fields */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <h4 className="col-span-full text-sm font-extrabold text-slate-900 uppercase tracking-wide">Top Banner Info</h4>

        <div>
          <label className="text-[10px] font-bold text-ink-lt mb-1 block">DURATION TEXT</label>
          <input type="text" value={d.durationText || ''} onChange={e => update('durationText', e.target.value)} placeholder="e.g. 17 DAYS / 16 NIGHTS" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-ink-lt mb-1 block">DEPARTURE</label>
          <input type="text" value={d.departure || ''} onChange={e => update('departure', e.target.value)} placeholder="e.g. UK" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-ink-lt mb-1 block">DESTINATION</label>
          <input type="text" value={d.destination || ''} onChange={e => update('destination', e.target.value)} placeholder="e.g. SAUDIA" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
        </div>
        <div>
          <label className="text-[10px] font-bold text-ink-lt mb-1 block">EXCLUSIVE BADGE</label>
          <input type="text" value={d.exclusiveBadge || ''} onChange={e => update('exclusiveBadge', e.target.value)} placeholder="e.g. EXCLUSIVE PACKAGE" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
        </div>
      </div>

      {/* Editable hotel cards, migrated from legacy fixed accommodations on first save. */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-extrabold uppercase text-slate-900">Package Hotel Details</h4>
            <p className="text-xs text-slate-500">Edit, add, remove or reorder accommodations. Changes appear on the package detail page.</p>
          </div>
          <button type="button" onClick={() => update('hotelCards', [
            ...getPackageHotelEntries(d, cardData),
            { id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: 'New Hotel', name: '', location: '', badge: '', nights: '', image: '', isVisible: true, badgeEnabled: true, durationEnabled: true },
          ])} className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white">
            <Plus className="w-4 h-4" /> Add Hotel
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getPackageHotelEntries(d, cardData).map((hotel, index, hotels) => {
            const changeHotel = (key: keyof PackageHotelCard, val: any) => {
              update('hotelCards', hotels.map((entry, i) => i === index ? { ...entry, [key]: val } : entry));
            };
            return <div key={hotel.id} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <strong className="text-xs text-primary">{hotel.label || `Hotel ${index + 1}`}</strong>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => changeHotel('isVisible', hotel.isVisible === false)} className="text-xs text-primary underline">{hotel.isVisible === false ? 'Show' : 'Hide'}</button>
                  <button type="button" disabled={index === 0} onClick={() => { const next = [...hotels]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; update('hotelCards', next); }} className="text-xs disabled:opacity-40" title="Move up">↑</button>
                  <button type="button" disabled={index === hotels.length - 1} onClick={() => { const next = [...hotels]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; update('hotelCards', next); }} className="text-xs disabled:opacity-40" title="Move down">↓</button>
                  <button type="button" onClick={() => { if (window.confirm(`Remove ${hotel.name || hotel.label || 'this hotel'} from this package?`)) update('hotelCards', hotels.filter((_, i) => i !== index)); }} className="text-red-600" title="Remove hotel"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {([['label', 'Accommodation label'], ['name', 'Hotel name'], ['location', 'Location / distance'], ['description', 'Additional hotel details']] as const).map(([field, label]) => (
                <label key={field} className="block text-[10px] font-bold text-slate-600 uppercase">{label}
                  <input type="text" value={hotel[field] || ''} onChange={e => changeHotel(field, e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900" />
                </label>
              ))}
              <label className="block text-[10px] font-bold text-slate-600 uppercase">Hotel image
                <ImageUploadWidget value={hotel.image} onChange={url => changeHotel('image', url)} subfolder="hotels" compact />
              </label>
              <div className="flex gap-2 items-end">
                <div className="w-32"><label className="block text-[10px] font-bold text-slate-600 mb-1">Badge icon</label><IconPicker value={hotel.badgeIcon || 'Utensils'} onChange={val => changeHotel('badgeIcon', val)} /></div>
                <label className="flex-1 text-[10px] font-bold text-slate-600 uppercase">Board / badge<input type="text" value={hotel.badge} onChange={e => changeHotel('badge', e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" /></label>
              </div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase">Stay duration
                <DurationInput value={hotel.nights || ''} onChange={val => changeHotel('nights', formatDuration(val))} defaultUnit="nights" />
              </label>
              <div className="flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2"><input type="checkbox" checked={hotel.badgeEnabled !== false} onChange={e => changeHotel('badgeEnabled', e.target.checked)} /> Show badge</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={hotel.durationEnabled !== false} onChange={e => changeHotel('durationEnabled', e.target.checked)} /> Show duration</label>
              </div>
            </div>;
          })}
        </div>
        {getPackageHotelEntries(d, cardData).length === 0 && <p className="text-xs text-slate-500">No hotels. Click Add Hotel to create one.</p>}
      </div>

      {/* Overview Builder */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h4 className="text-sm font-extrabold text-slate-900 mb-4 uppercase tracking-wide">Package Overview</h4>
        <div className="space-y-4">
          {(d.overview || []).map((group, gIdx) => (
            <div key={gIdx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
              <button type="button" onClick={() => {
                const newO = [...d.overview];
                newO.splice(gIdx, 1);
                update('overview', newO);
              }} className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 rounded-md p-1.5">
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="mb-4 pr-10">
                <label className="text-[10px] font-bold text-ink-lt mb-1 block">GROUP TITLE (e.g. DURING STAY AT MADINAH)</label>
                <input
                  type="text"
                  value={group.groupTitle}
                  onChange={e => {
                    const newO = [...d.overview];
                    newO[gIdx].groupTitle = e.target.value;
                    update('overview', newO);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                  placeholder="Group Title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-ink-lt mb-1 block">TIMELINE ITEMS (One per line)</label>
                <textarea
                  value={(group.items || []).join('\n')}
                  onChange={e => {
                    const newO = [...d.overview];
                    newO[gIdx].items = e.target.value.split('\n');
                    update('overview', newO);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs min-h-[100px] outline-none focus:border-primary font-sans"
                  placeholder="01 Dhul-Hijjah Check in...&#10;02 Dhul-Hijjah Rest..."
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => {
            update('overview', [...(d.overview || []), { groupTitle: '', items: [''] }]);
          }} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Overview Group
          </button>
        </div>
      </div>

      {/* Highlights & Eligibility */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <h4 className="text-sm font-extrabold text-slate-900 mb-4 uppercase tracking-wide">Highlights</h4>
          <div className="space-y-2">
            {(d.highlights || []).map((hl, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={hl.text}
                  onChange={e => {
                    const newH = [...d.highlights];
                    newH[i].text = e.target.value;
                    update('highlights', newH);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 shrink-0 cursor-pointer">
                  <input type="checkbox" checked={hl.isCross} onChange={e => {
                    const newH = [...d.highlights];
                    newH[i].isCross = e.target.checked;
                    update('highlights', newH);
                  }} /> Cross?
                </label>
                <button type="button" onClick={() => {
                  const newH = [...d.highlights];
                  newH.splice(i, 1);
                  update('highlights', newH);
                }} className="text-red-400 hover:text-red-600 px-1 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              update('highlights', [...(d.highlights || []), { text: '', isCross: false }]);
            }} className="text-xs font-bold text-primary flex items-center gap-1 mt-2 hover:underline">
              <Plus className="w-3 h-3" /> Add Highlight
            </button>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
          <h4 className="text-sm font-extrabold text-slate-900 mb-4 uppercase tracking-wide">Eligibility</h4>
          <div className="space-y-2">
            {(d.eligibility || []).map((el, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={el}
                  onChange={e => {
                    const newE = [...d.eligibility];
                    newE[i] = e.target.value;
                    update('eligibility', newE);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
                <button type="button" onClick={() => {
                  const newE = [...d.eligibility];
                  newE.splice(i, 1);
                  update('eligibility', newE);
                }} className="text-red-400 hover:text-red-600 px-2 shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              update('eligibility', [...(d.eligibility || []), '']);
            }} className="text-xs font-bold text-primary flex items-center gap-1 mt-2 hover:underline">
              <Plus className="w-3 h-3" /> Add Eligibility Requirement
            </button>
          </div>
        </div>
      </div>

      {/* Package Gallery */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Package Gallery</h4>
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="bulk-gallery-upload"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;

                const uploadPromises = files.map(async (file) => {
                  const formData = new FormData();
                  formData.append('file', file);
                  formData.append('subfolder', 'packages');
                  try {
                    const res = await fetch('/api/admin/upload', {
                      method: 'POST',
                      body: formData,
                    });
                    const data = await res.json();
                    if (data.success && data.url) {
                      return data.url;
                    }
                  } catch (err) {
                    console.error('Bulk upload failed for', file.name, err);
                  }
                  return null;
                });

                const results = await Promise.all(uploadPromises);
                const newUrls = results.filter((url): url is string => url !== null);

                if (newUrls.length > 0) {
                  onGalleryChange?.([...packagesGallery.filter(url => url !== ''), ...newUrls]);
                }

                e.target.value = '';
              }}
            />
            <label
              htmlFor="bulk-gallery-upload"
              className="text-[10px] font-extrabold text-amber-700 border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer block"
            >
              + Add Bulk Images
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {packagesGallery.map((imageUrl: string, galleryIdx: number) => (
            <div key={galleryIdx} className="relative rounded-xl border border-slate-200 p-3 bg-white">
              <ImageUploadWidget
                value={imageUrl || ''}
                onChange={(url) => {
                  const next = [...packagesGallery];
                  next[galleryIdx] = url;
                  onGalleryChange?.(next);
                }}
                subfolder="packages"
                hideDeleteButton={true}
              />
              <button
                type="button"
                onClick={() => {
                  const next = packagesGallery.filter((_, idx) => idx !== galleryIdx);
                  onGalleryChange?.(next);
                }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center border-none cursor-pointer shadow"
                title="Remove gallery image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {packagesGallery.length === 0 && (
          <p className="text-xs text-slate-400 italic mt-2">No gallery images added yet.</p>
        )}
      </div>

      {/* Important Booking */}
      <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
        <h4 className="text-sm font-extrabold text-amber-900 mb-2 uppercase tracking-wide">Important Booking Note</h4>
        <div className="bg-white rounded-lg border border-amber-300 overflow-hidden">
          <TiptapEditor
            value={d.importantBooking || ''}
            onChange={(val) => update('importantBooking', val)}
          />
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h4 className="text-sm font-extrabold text-slate-900 mb-4 uppercase tracking-wide">FAQs</h4>
        <div className="space-y-4">
          {(d.faqs || []).map((faq, i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative pr-12">
              <button type="button" onClick={() => {
                const newF = [...d.faqs];
                newF.splice(i, 1);
                update('faqs', newF);
              }} className="absolute top-4 right-4 text-red-500 hover:text-red-700 bg-red-50 rounded-md p-1.5">
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="mb-2">
                <label className="text-[10px] font-bold text-ink-lt mb-1 block">QUESTION</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={e => {
                    const newF = [...d.faqs];
                    newF[i].question = e.target.value;
                    update('faqs', newF);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-ink-lt mb-1 block">ANSWER</label>
                <textarea
                  value={faq.answer}
                  onChange={e => {
                    const newF = [...d.faqs];
                    newF[i].answer = e.target.value;
                    update('faqs', newF);
                  }}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => {
            update('faqs', [...(d.faqs || []), { question: '', answer: '' }]);
          }} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add FAQ
          </button>
        </div>
      </div>

    </div>
  );
}
