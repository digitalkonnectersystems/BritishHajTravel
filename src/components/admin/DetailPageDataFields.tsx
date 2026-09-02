'use client';

import { useState } from 'react';
import { Plus, Trash2, Utensils, Eye, EyeOff } from 'lucide-react';
import TiptapEditor from './TiptapEditor';
import ImageUploadWidget from './ImageUploadWidget';
import DurationInput from './DurationInput';
import IconPicker from './IconPicker';
import { formatDuration } from '@/lib/packageHelpers';

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
  onGalleryChange
}: {
  data: DetailPageData;
  onChange: (newData: DetailPageData) => void;
  onHotelSync?: (hotelKey: string, field: string, val: string) => void;
  packagesGallery?: string[];
  onGalleryChange?: (gallery: string[]) => void;
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
          <input type="text" value={d.departure || ''} onChange={e => update('departure', e.target.value)} placeholder="e.g. CANADA" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
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

      {/* Premium Accommodations (Makkah, Madinah, Aziziya, Mina) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Makkah Hotel */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Makkah Hotel</h4>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">HOTEL NAME</label>
            <input type="text" value={d.makkahHotel?.name || ''} onChange={e => updateHotel('makkahHotel', 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">LOCATION</label>
            <input type="text" value={d.makkahHotel?.location || ''} onChange={e => updateHotel('makkahHotel', 'location', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-ink-lt mb-1 block">BOARD (BADGE)</label>
              <div className="flex items-center gap-2">
                <div className="w-32 shrink-0">
                  <IconPicker
                    value={d.makkahHotel?.badgeIcon || 'Utensils'}
                    onChange={(iconName) => updateHotel('makkahHotel', 'badgeIcon', iconName)}
                    placeholder="Icon"
                  />
                </div>
                <input
                  type="text"
                  value={d.makkahHotel?.badge || ''}
                  onChange={e => updateHotel('makkahHotel', 'badge', e.target.value)}
                  placeholder="e.g. Breakfast Included"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentEnabled = (d.makkahHotel as any)?.badgeEnabled !== false;
                    updateHotel('makkahHotel', 'badgeEnabled' as any, !currentEnabled);
                  }}
                  title={(d.makkahHotel as any)?.badgeEnabled !== false ? 'Hide board badge on frontend' : 'Display board badge on frontend'}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${(d.makkahHotel as any)?.badgeEnabled !== false
                    ? 'bg-emerald-50 text-[#004B39] border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-100 text-amber-500 border-amber-500 hover:bg-amber-200 hover:text-amber-600'
                    }`}
                >
                  {(d.makkahHotel as any)?.badgeEnabled !== false ? (
                    <Eye className="w-3 h-3 text-[#004B39]" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="text-[10px] font-bold">{(d.makkahHotel as any)?.badgeEnabled !== false ? 'Show' : 'Hide'}</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-lt mb-1 block">DURATION (DAYS / NIGHTS)</label>
              <DurationInput
                value={d.makkahHotel?.nights || '6 Nights'}
                onChange={(dur) => updateHotel('makkahHotel', 'nights', formatDuration(dur))}
                defaultUnit="nights"
                showToggle={true}
                enabled={(d.makkahHotel as any)?.durationEnabled !== undefined ? (d.makkahHotel as any)?.durationEnabled : (d.makkahHotel as any)?.enabled !== false}
                onToggleChange={(val) => {
                  updateHotel('makkahHotel', 'durationEnabled' as any, val as any);
                  updateHotel('makkahHotel', 'enabled' as any, val as any);
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">IMAGE URL</label>
            <ImageUploadWidget
              value={d.makkahHotel?.image || ''}
              onChange={(url) => updateHotel('makkahHotel', 'image', url)}
              subfolder="hotels"
              compact={true}
            />
          </div>
        </div>

        {/* Madinah Hotel */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Madinah Hotel</h4>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">HOTEL NAME</label>
            <input type="text" value={d.madinahHotel?.name || ''} onChange={e => updateHotel('madinahHotel', 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">LOCATION</label>
            <input type="text" value={d.madinahHotel?.location || ''} onChange={e => updateHotel('madinahHotel', 'location', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-ink-lt mb-1 block">BOARD (BADGE)</label>
              <div className="flex items-center gap-2">
                <div className="w-32 shrink-0">
                  <IconPicker
                    value={d.madinahHotel?.badgeIcon || 'Utensils'}
                    onChange={(iconName) => updateHotel('madinahHotel', 'badgeIcon', iconName)}
                    placeholder="Icon"
                  />
                </div>
                <input
                  type="text"
                  value={d.madinahHotel?.badge || ''}
                  onChange={e => updateHotel('madinahHotel', 'badge', e.target.value)}
                  placeholder="e.g. Breakfast Included"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentEnabled = (d.madinahHotel as any)?.badgeEnabled !== false;
                    updateHotel('madinahHotel', 'badgeEnabled' as any, !currentEnabled);
                  }}
                  title={(d.madinahHotel as any)?.badgeEnabled !== false ? 'Hide board badge on frontend' : 'Display board badge on frontend'}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${(d.madinahHotel as any)?.badgeEnabled !== false
                    ? 'bg-emerald-50 text-[#004B39] border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-100 text-amber-500 border-amber-500 hover:bg-amber-200 hover:text-amber-600'
                    }`}
                >
                  {(d.madinahHotel as any)?.badgeEnabled !== false ? (
                    <Eye className="w-3 h-3 text-[#004B39]" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="text-[10px] font-bold">{(d.madinahHotel as any)?.badgeEnabled !== false ? 'Show' : 'Hide'}</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-lt mb-1 block">DURATION (DAYS / NIGHTS)</label>
              <DurationInput
                value={d.madinahHotel?.nights || '6 Nights'}
                onChange={(dur) => updateHotel('madinahHotel', 'nights', formatDuration(dur))}
                defaultUnit="nights"
                showToggle={true}
                enabled={(d.madinahHotel as any)?.durationEnabled !== undefined ? (d.madinahHotel as any)?.durationEnabled : (d.madinahHotel as any)?.enabled !== false}
                onToggleChange={(val) => {
                  updateHotel('madinahHotel', 'durationEnabled' as any, val as any);
                  updateHotel('madinahHotel', 'enabled' as any, val as any);
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">IMAGE URL</label>
            <ImageUploadWidget
              value={d.madinahHotel?.image || ''}
              onChange={(url) => updateHotel('madinahHotel', 'image', url)}
              subfolder="hotels"
              compact={true}
            />
          </div>
        </div>

        {/* Aziziya Hotel */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Aziziya Hotel</h4>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">HOTEL NAME</label>
            <input type="text" value={d.aziziyaHotel?.name || ''} onChange={e => updateHotel('aziziyaHotel', 'name', e.target.value)} placeholder="e.g. HOTEL NEAR" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">LOCATION</label>
            <input type="text" value={d.aziziyaHotel?.location || ''} onChange={e => updateHotel('aziziyaHotel', 'location', e.target.value)} placeholder="e.g. Aziziya – Near to Mina" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-ink-lt mb-1 block">BOARD (BADGE)</label>
              <div className="flex items-center gap-2">
                <div className="w-32 shrink-0">
                  <IconPicker
                    value={d.aziziyaHotel?.badgeIcon || 'Utensils'}
                    onChange={(iconName) => updateHotel('aziziyaHotel', 'badgeIcon', iconName)}
                    placeholder="Icon"
                  />
                </div>
                <input
                  type="text"
                  value={d.aziziyaHotel?.badge || ''}
                  onChange={e => updateHotel('aziziyaHotel', 'badge', e.target.value)}
                  placeholder="e.g. Breakfast Included / Full Board"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentEnabled = (d.aziziyaHotel as any)?.badgeEnabled !== false;
                    updateHotel('aziziyaHotel', 'badgeEnabled' as any, !currentEnabled);
                  }}
                  title={(d.aziziyaHotel as any)?.badgeEnabled !== false ? 'Hide board badge on frontend' : 'Display board badge on frontend'}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${(d.aziziyaHotel as any)?.badgeEnabled !== false
                    ? 'bg-emerald-50 text-[#004B39] border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-100 text-amber-500 border-amber-500 hover:bg-amber-200 hover:text-amber-600'
                    }`}
                >
                  {(d.aziziyaHotel as any)?.badgeEnabled !== false ? (
                    <Eye className="w-3 h-3 text-[#004B39]" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="text-[10px] font-bold">{(d.aziziyaHotel as any)?.badgeEnabled !== false ? 'Show' : 'Hide'}</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-lt mb-1 block">DURATION (DAYS / NIGHTS)</label>
              <DurationInput
                value={d.aziziyaHotel?.nights || '3 Nights'}
                onChange={(dur) => updateHotel('aziziyaHotel', 'nights', formatDuration(dur))}
                defaultUnit="nights"
                showToggle={true}
                enabled={(d.aziziyaHotel as any)?.durationEnabled !== undefined ? (d.aziziyaHotel as any)?.durationEnabled : (d.aziziyaHotel as any)?.enabled !== false}
                onToggleChange={(val) => {
                  updateHotel('aziziyaHotel', 'durationEnabled' as any, val as any);
                  updateHotel('aziziyaHotel', 'enabled' as any, val as any);
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">IMAGE URL</label>
            <ImageUploadWidget
              value={d.aziziyaHotel?.image || ''}
              onChange={(url) => updateHotel('aziziyaHotel', 'image', url)}
              subfolder="hotels"
              compact={true}
            />
          </div>
        </div>

        {/* Mina Maktab / Camp */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">Mina Maktab / Camp</h4>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">CAMP / HOTEL NAME</label>
            <input type="text" value={d.minaHotel?.name || ''} onChange={e => updateHotel('minaHotel', 'name', e.target.value)} placeholder="e.g. MAKTAB – A" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">LOCATION</label>
            <input type="text" value={d.minaHotel?.location || ''} onChange={e => updateHotel('minaHotel', 'location', e.target.value)} placeholder="e.g. Mina – Maktab A Camps" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-ink-lt mb-1 block">BOARD (BADGE)</label>
              <div className="flex items-center gap-2">
                <div className="w-32 shrink-0">
                  <IconPicker
                    value={d.minaHotel?.badgeIcon || 'Utensils'}
                    onChange={(iconName) => updateHotel('minaHotel', 'badgeIcon', iconName)}
                    placeholder="Icon"
                  />
                </div>
                <input
                  type="text"
                  value={d.minaHotel?.badge || ''}
                  onChange={e => updateHotel('minaHotel', 'badge', e.target.value)}
                  placeholder="e.g. Breakfast Included / Full Board"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const currentEnabled = (d.minaHotel as any)?.badgeEnabled !== false;
                    updateHotel('minaHotel', 'badgeEnabled' as any, !currentEnabled);
                  }}
                  title={(d.minaHotel as any)?.badgeEnabled !== false ? 'Hide board badge on frontend' : 'Display board badge on frontend'}
                  className={`px-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${(d.minaHotel as any)?.badgeEnabled !== false
                    ? 'bg-emerald-50 text-[#004B39] border-emerald-300 hover:bg-emerald-100'
                    : 'bg-amber-100 text-amber-500 border-amber-500 hover:bg-amber-200 hover:text-amber-600'
                    }`}
                >
                  {(d.minaHotel as any)?.badgeEnabled !== false ? (
                    <Eye className="w-3 h-3 text-[#004B39]" />
                  ) : (
                    <EyeOff className="w-3 h-3 text-slate-400" />
                  )}
                  <span className="text-[10px] font-bold">{(d.minaHotel as any)?.badgeEnabled !== false ? 'Show' : 'Hide'}</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-ink-lt mb-1 block">DURATION (DAYS / NIGHTS)</label>
              <DurationInput
                value={d.minaHotel?.nights || '2 Nights'}
                onChange={(dur) => updateHotel('minaHotel', 'nights', formatDuration(dur))}
                defaultUnit="nights"
                showToggle={true}
                enabled={(d.minaHotel as any)?.durationEnabled !== undefined ? (d.minaHotel as any)?.durationEnabled : (d.minaHotel as any)?.enabled !== false}
                onToggleChange={(val) => {
                  updateHotel('minaHotel', 'durationEnabled' as any, val as any);
                  updateHotel('minaHotel', 'enabled' as any, val as any);
                }}
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">IMAGE URL</label>
            <ImageUploadWidget
              value={d.minaHotel?.image || ''}
              onChange={(url) => updateHotel('minaHotel', 'image', url)}
              subfolder="hotels"
              compact={true}
            />
          </div>
        </div>
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
                  formData.append('subfolder', 'packages/gallery');
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
                subfolder="packages/gallery"
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
