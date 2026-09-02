'use client';

import { useState } from 'react';
import { updatePackageAction } from '@/actions/packageActions';
import { Edit2, ArrowLeft, BookOpen, Hotel, Plane, X, Utensils, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import DetailPageDataFields from '@/components/admin/DetailPageDataFields';
import MonthYearPicker from '@/components/admin/MonthYearPicker';
import DurationInput from '@/components/admin/DurationInput';
import IconPicker from '@/components/admin/IconPicker';
import { formatTravelMonth, formatDuration } from '@/lib/packageHelpers';

const defaultHajjCardData = {
  bannerImage: '',
  badgeTag: 'HAJJ 2027',
  duration: '14Days',
  flightRoute: 'FROM CANADA ➔ TO SAUDIA',
  operatorName: 'King Travel',
  operatorRating: '4.4/5',
  btnLabel: 'Book Hajj 2027',
  btnLink: '/contact',
  priceSubtext: 'FROM CAD / QUAD OCCUPANCY',
  makkahHotel: { image: '', name: '5 STAR HOTEL', location: 'Near to Haram', badge: 'Breakfast Included', nights: '13 Nights' },
  madinahHotel: { image: '', name: '5 STAR HOTEL', location: 'Near to Masjid Nabawi', badge: 'Breakfast Included', nights: '4 Nights' },
  aziziyaHotel: { image: '', name: 'HOTEL NEAR', location: 'Aziziya – Near to Mina', badge: 'Breakfast Included', nights: '3 Nights' },
  minaHotel: { image: '', name: 'MAKTAB – A', location: 'Mina – Maktab A Camps', badge: 'Breakfast Included', nights: '2 Nights' },
  inclusions: [
    { icon: 'Plane', text: 'Return Air Tickets' },
    { icon: 'FileCheck', text: 'Hajj Visa Processing' },
    { icon: 'Bed', text: 'Comfortable Accommodation' },
    { icon: 'Utensils', text: 'All Meals Included' },
    { icon: 'Bus', text: 'Transport in Saudi Arabia' },
    { icon: 'MessageCircle', text: 'Guidance & Support' },
  ],
  eligibility: [
    'Canadian & U.S. citizens with Pakistani passports.',
    'Pakistani passport holders with Canadian PR or American Green Card.',
    'All foreign passport holders with Pakistan passport.',
    'Side trip to Pakistan or any other destination available with an additional cost.',
  ],
};

const defaultUmrahCardData = {
  bannerImage: '',
  isActiveCard: false,
  btnLabel: 'BOOK NOW',
  btnLink: '/contact',
  includes: [
    { icon: 'Plane', text: 'Return Flights from Toronto' },
    { icon: 'Hotel', text: '5 Star Hotel in Makkah' },
    { icon: 'Hotel', text: '5 Star Hotel in Madinah' },
    { icon: 'FileCheck', text: 'Visa & Registration' },
    { icon: 'Users', text: 'Imam & Guide' },
  ],
  makkahHotel: { image: '', name: '5 Star Hotel in Makkah', location: 'Near to Haram', badge: 'Breakfast', nights: '5 Nights' },
  madinahHotel: { image: '', name: '5 Star Hotel in Madinah', location: 'Near to Masjid Nabawi', badge: 'Breakfast', nights: '5 Nights' },
};

function getDefaultCardData(type: 'hajj' | 'umrah') {
  return type === 'hajj' ? { ...defaultHajjCardData } : { ...defaultUmrahCardData };
}

type IncludeItem = {
  icon: string;
  text: string;
};

function HajjCardFields({ pkgData, setPkgData }: { pkgData: any; setPkgData: (v: any) => void }) {
  const cd = pkgData.cardData || defaultHajjCardData;
  const updateCD = (f: string, v: any) => setPkgData({ ...pkgData, cardData: { ...cd, [f]: v } });

  const updateHotel = (hotelKey: string, field: string, value: any) => {
    const updatedHotel = { ...(cd[hotelKey] || {}), [field]: value };
    setPkgData({
      ...pkgData,
      cardData: { ...cd, [hotelKey]: updatedHotel },
      detailPageData: { ...(pkgData.detailPageData || {}), [hotelKey]: updatedHotel }
    });
  };

  const inclusions: IncludeItem[] = Array.isArray(cd.inclusions)
    ? cd.inclusions.map((item: any) =>
      typeof item === 'string'
        ? { icon: '', text: item }
        : {
          icon: item?.icon || '',
          text: item?.text || '',
        }
    )
    : [];

  const updateInclusions = (idx: number, val: IncludeItem) => {
    const next = [...inclusions];
    next[idx] = val;
    updateCD('inclusions', next);
  };

  const addInclusion = () => {
    updateCD('inclusions', [...inclusions, { icon: '', text: '' }]);
  };

  const removeInclusion = (idx: number) => {
    updateCD('inclusions', inclusions.filter((_, i) => i !== idx));
  };

  const eligibility: string[] = Array.isArray(cd.eligibility)
    ? cd.eligibility
    : (Array.isArray(pkgData.detailPageData?.eligibility) ? pkgData.detailPageData.eligibility : []);

  const updateEligibility = (idx: number, val: string) => {
    const next = [...eligibility];
    next[idx] = val;
    setPkgData({
      ...pkgData,
      cardData: { ...cd, eligibility: next },
      detailPageData: { ...(pkgData.detailPageData || {}), eligibility: next }
    });
  };

  const addEligibility = () => {
    const next = [...eligibility, ''];
    setPkgData({
      ...pkgData,
      cardData: { ...cd, eligibility: next },
      detailPageData: { ...(pkgData.detailPageData || {}), eligibility: next }
    });
  };

  const removeEligibility = (idx: number) => {
    const next = eligibility.filter((_, i) => i !== idx);
    setPkgData({
      ...pkgData,
      cardData: { ...cd, eligibility: next },
      detailPageData: { ...(pkgData.detailPageData || {}), eligibility: next }
    });
  };

  const hotels = [
    { key: 'makkahHotel', label: 'Makkah Hotel', defaultLocation: 'Near to Haram' },
    { key: 'madinahHotel', label: 'Madina Hotel', defaultLocation: 'Near to Masjid Nabawi' },
    { key: 'aziziyaHotel', label: 'Aziziya Hotel', defaultLocation: 'Aziziya – Near to Mina' },
    { key: 'minaHotel', label: 'Mina Camp', defaultLocation: 'Mina – Maktab A Camps' },
  ];

  return (
    <div className="col-span-full space-y-5 p-5 border border-amber-200 bg-amber-50/40 rounded-2xl">
      <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider border-b border-amber-200 pb-2 flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5" /> Dynamic Card Details
      </h4>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <label className="text-[10px] font-bold text-ink-lt mb-1 block">BANNER IMAGE</label>
          <ImageUploadWidget value={cd.bannerImage || ''} onChange={(url) => updateCD('bannerImage', url)} subfolder="packages" />
        </div>
        <div className="md:w-2/3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">TOP LEFT BADGE</label>
            <input type="text" value={cd.badgeTag || ''} onChange={e => updateCD('badgeTag', e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">DURATION BADGE</label>
            <DurationInput
              value={cd.duration || '14 Days'}
              onChange={(d) => updateCD('duration', formatDuration(d))}
              defaultUnit="days"
            />
          </div>
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">FLIGHT ROUTE TAGLINE</label>
            <input type="text" value={cd.flightRoute || ''} onChange={e => updateCD('flightRoute', e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">OPERATOR NAME</label>
            <input type="text" value={cd.operatorName || ''} onChange={e => updateCD('operatorName', e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">OPERATOR RATING</label>
            <input type="text" value={cd.operatorRating || ''} onChange={e => updateCD('operatorRating', e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">PRICE SUBTEXT</label>
            <input type="text" value={cd.priceSubtext || ''} onChange={e => updateCD('priceSubtext', e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">BUTTON LABEL</label>
            <input type="text" value={cd.btnLabel || ''} onChange={e => updateCD('btnLabel', e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </div>
        </div>
      </div>

      {/* 4 Accommodations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hotels.map((h) => {
          const hotelObj = cd[h.key] || {};
          return (
            <div key={h.key} className="bg-white p-4 rounded-xl border border-slate-200">
              <h5 className="text-[10px] font-extrabold text-slate-700 mb-3 flex items-center gap-1.5">
                <Hotel className="w-3 h-3 text-amber-600" /> {h.label}
              </h5>
              <div className="space-y-2.5">
                <ImageUploadWidget value={hotelObj.image || ''} onChange={(url) => updateHotel(h.key, 'image', url)} subfolder="packages" />
                <div>
                  <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">HOTEL NAME</label>
                  <input
                    type="text"
                    value={hotelObj.name || ''}
                    onChange={e => updateHotel(h.key, 'name', e.target.value)}
                    placeholder="e.g. 5 STAR HOTEL / MAKTAB - A"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">LOCATION (Near To)</label>
                  <input
                    type="text"
                    value={hotelObj.location || ''}
                    onChange={e => updateHotel(h.key, 'location', e.target.value)}
                    placeholder={`e.g. ${h.defaultLocation}`}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">BOARD / MEAL BADGE</label>
                    <div className="flex items-center gap-1.5">
                      <div className="w-40 shrink-0">
                        <IconPicker
                          value={hotelObj.badgeIcon || 'Utensils'}
                          onChange={(iconName) => updateHotel(h.key, 'badgeIcon', iconName)}
                          placeholder="Icon"
                        />
                      </div>
                      <input
                        type="text"
                        value={hotelObj.badge || ''}
                        onChange={e => updateHotel(h.key, 'badge', e.target.value)}
                        placeholder="e.g. Breakfast Included"
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const currentEnabled = hotelObj.badgeEnabled !== false;
                          updateHotel(h.key, 'badgeEnabled', !currentEnabled);
                        }}
                        title={hotelObj.badgeEnabled !== false ? 'Hide board badge on frontend' : 'Display board badge on frontend'}
                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${hotelObj.badgeEnabled !== false
                          ? 'bg-emerald-50 text-[#004B39] border-emerald-300 hover:bg-emerald-100'
                          : 'bg-amber-100 text-amber-500 border-amber-500 hover:bg-amber-200 hover:text-amber-600'
                          }`}
                      >
                        {hotelObj.badgeEnabled !== false ? (
                          <Eye className="w-3 h-3 text-[#004B39]" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-amber-500" />
                        )}
                        <span className="text-[10px] font-bold">{hotelObj.badgeEnabled !== false ? 'Show' : 'Hide'}</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">DURATION (DAYS / NIGHTS)</label>
                    <DurationInput
                      value={hotelObj.nights || '3 Nights'}
                      onChange={(d) => updateHotel(h.key, 'nights', formatDuration(d))}
                      defaultUnit="nights"
                      showToggle={true}
                      enabled={hotelObj.durationEnabled !== undefined ? hotelObj.durationEnabled : (hotelObj.enabled !== false)}
                      onToggleChange={(val) => {
                        updateHotel(h.key, 'durationEnabled', val);
                        updateHotel(h.key, 'enabled', val);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Package Inclusions (Card Grid Icons) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-ink-lt uppercase tracking-wider">
            PACKAGE INCLUSIONS (ICONS WITH LABELS)
          </label>
          <button
            type="button"
            onClick={addInclusion}
            className="text-[10px] font-extrabold text-amber-800 border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
          >
            + Add Inclusion
          </button>
        </div>
        <div className="space-y-2">
          {inclusions.map((inc: IncludeItem, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-48 shrink-0">
                <IconPicker
                  value={inc.icon || ''}
                  onChange={(iconName) => updateInclusions(idx, { ...inc, icon: iconName })}
                  placeholder="Select Icon"
                />
              </div>
              <input
                type="text"
                value={inc.text || ''}
                onChange={e => updateInclusions(idx, { ...inc, text: e.target.value })}
                placeholder="e.g. Return Air Tickets"
                className="flex-1 px-2.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => removeInclusion(idx)}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center border-none cursor-pointer shrink-0 transition-colors"
                title="Remove inclusion"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {inclusions.length === 0 && (
            <p className="text-xs text-slate-400 italic">No inclusions configured. Default inclusions will be shown.</p>
          )}
        </div>
      </div>

      {/* Eligibility / Bullet Points */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-ink-lt uppercase tracking-wider">
            PACKAGE ELIGIBILITY / NOTES (CHECKED BULLET POINTS)
          </label>
          <button
            type="button"
            onClick={addEligibility}
            className="text-[10px] font-extrabold text-amber-800 border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
          >
            + Add Point
          </button>
        </div>
        <div className="space-y-2">
          {eligibility.map((point: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={point}
                onChange={e => updateEligibility(idx, e.target.value)}
                placeholder="e.g. Canadian & U.S. citizens with Pakistani passports."
                className="flex-1 px-2.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => removeEligibility(idx)}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center border-none cursor-pointer shrink-0 transition-colors"
                title="Remove note"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UmrahCardFields({ pkgData, setPkgData }: { pkgData: any; setPkgData: (v: any) => void }) {
  const cd = pkgData.cardData || defaultUmrahCardData;
  const updateCD = (f: string, v: any) => setPkgData({ ...pkgData, cardData: { ...cd, [f]: v } });

  const updateMak = (f: string, v: any) => {
    const updatedHotel = { ...(cd.makkahHotel || {}), [f]: v };
    setPkgData({
      ...pkgData,
      cardData: { ...cd, makkahHotel: updatedHotel },
      detailPageData: { ...(pkgData.detailPageData || {}), makkahHotel: updatedHotel }
    });
  };
  const updateMad = (f: string, v: any) => {
    const updatedHotel = { ...(cd.madinahHotel || {}), [f]: v };
    setPkgData({
      ...pkgData,
      cardData: { ...cd, madinahHotel: updatedHotel },
      detailPageData: { ...(pkgData.detailPageData || {}), madinahHotel: updatedHotel }
    });
  };

  type IncludeItem = {
    icon: string;
    text: string;
  };

  const includes: IncludeItem[] = Array.isArray(cd.includes)
    ? cd.includes.map((item: any) =>
      typeof item === 'string'
        ? { icon: '', text: item }
        : {
          icon: item?.icon || '',
          text: item?.text || '',
        }
    )
    : [];

  const updateIncludes = (idx: number, val: IncludeItem) => {
    const next: IncludeItem[] = [...includes];
    next[idx] = val;
    updateCD('includes', next);
  };

  const addInclude = () => {
    updateCD('includes', [
      ...includes,
      { icon: '', text: '' },
    ]);
  };

  const removeInclude = (idx: number) => {
    updateCD(
      'includes',
      includes.filter((_: IncludeItem, i: number) => i !== idx)
    );
  };

  return (
    <div className="col-span-full space-y-5 p-5 border border-emerald-200 bg-emerald-50/30 rounded-2xl">
      <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-2 flex items-center gap-2">
        <Plane className="w-3.5 h-3.5" /> Dynamic Card Details
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-ink-lt mb-1 block">CARD HERO IMAGE</label>
          <ImageUploadWidget value={cd.bannerImage || ''} onChange={(url) => updateCD('bannerImage', url)} subfolder="packages" />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">BUTTON LABEL</label>
            <input type="text" value={cd.btnLabel || ''} onChange={e => updateCD('btnLabel', e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <h5 className="text-[10px] font-extrabold text-slate-700 mb-3 flex items-center gap-1.5">
            <Hotel className="w-3 h-3 text-amber-600" /> Makkah Hotel
          </h5>
          <div className="space-y-2.5">
            <ImageUploadWidget value={cd.makkahHotel?.image || ''} onChange={(url) => updateMak('image', url)} subfolder="packages" />
            <div>
              <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">HOTEL NAME</label>
              <input type="text" value={cd.makkahHotel?.name || ''} onChange={e => updateMak('name', e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">LOCATION (Near To)</label>
              <input type="text" value={cd.makkahHotel?.location || ''} onChange={e => updateMak('location', e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">BOARD / MEAL BADGE</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cd.makkahHotel?.badge || ''}
                    onChange={e => updateMak('badge', e.target.value)}
                    placeholder="e.g. Breakfast Included"
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <Utensils className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">DURATION (DAYS)</label>
                <DurationInput
                  value={cd.makkahHotel?.nights || '5 Nights'}
                  onChange={(d) => updateMak('nights', formatDuration(d))}
                  defaultUnit="nights"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <h5 className="text-[10px] font-extrabold text-slate-700 mb-3 flex items-center gap-1.5">
            <Hotel className="w-3 h-3 text-primary" /> Madinah Hotel
          </h5>
          <div className="space-y-2.5">
            <ImageUploadWidget value={cd.madinahHotel?.image || ''} onChange={(url) => updateMad('image', url)} subfolder="packages" />
            <div>
              <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">HOTEL NAME</label>
              <input type="text" value={cd.madinahHotel?.name || ''} onChange={e => updateMad('name', e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">LOCATION (Near To)</label>
              <input type="text" value={cd.madinahHotel?.location || ''} onChange={e => updateMad('location', e.target.value)} className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs" />
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">BOARD / MEAL BADGE</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cd.madinahHotel?.badge || ''}
                    onChange={e => updateMad('badge', e.target.value)}
                    placeholder="e.g. Breakfast Included"
                    className="w-full pl-7 pr-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <Utensils className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">DURATION (DAYS)</label>
                <DurationInput
                  value={cd.madinahHotel?.nights || '5 Nights'}
                  onChange={(d) => updateMad('nights', formatDuration(d))}
                  defaultUnit="nights"
                />
              </div>
            </div>
          </div>
        </div>
      </div>


      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-ink-lt uppercase tracking-wider">PACKAGE INCLUDES</label>
          <button type="button" onClick={addInclude} className="text-[10px] font-extrabold text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer">
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {includes.map((inc: IncludeItem, idx: number) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="w-48 shrink-0">
                <IconPicker
                  value={inc.icon || ''}
                  onChange={(iconName) => updateIncludes(idx, { ...inc, icon: iconName })}
                  placeholder="Select Icon"
                />
              </div>
              <input
                type="text"
                value={inc.text || ''}
                onChange={e => updateIncludes(idx, { ...inc, text: e.target.value })}
                placeholder="e.g. Return Flights from Toronto"
                className="flex-1 px-2.5 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={() => removeInclude(idx)}
                className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center border-none cursor-pointer shrink-0 transition-colors"
                title="Remove inclusion"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {includes.length === 0 && (
            <p className="text-xs text-slate-400 italic">No inclusions added yet. Click "+ Add Item".</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface EditPackageClientProps {
  packageData: any;
}

export default function EditPackageClient({ packageData }: EditPackageClientProps) {
  const router = useRouter();

  const parseJSON = (data: any, defaultVal: any) => {
    if (!data) return defaultVal;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return defaultVal;
      }
    }
    return data;
  };

  const normalizeGallery = (gallery: any): string[] => {
    const arr = Array.isArray(gallery) ? gallery : [];
    return arr
      .flatMap((item: any) => (typeof item === 'string' ? item.split(',') : []))
      .map((url) => url.trim())
      .filter(Boolean);
  };

  const initialPackagePrices: { packageType: string; price: string }[] = (() => {
    const rawPrices =
      packageData.packagePrices ||
      parseJSON(packageData.cardData, {})?.packagePrices ||
      parseJSON(packageData.detailPageData, {})?.packagePrices ||
      (Array.isArray(packageData.prices)
        ? packageData.prices.map((p: any) => ({
          packageType:
            p.occupancyType === 'quad'
              ? 'Quad Occupancy'
              : p.occupancyType === 'triple'
                ? 'Triple Occupancy'
                : p.occupancyType === 'double'
                  ? 'Double Occupancy'
                  : p.occupancyType === 'single'
                    ? 'Single Occupancy'
                    : p.notes || 'Package Type',
          price: String(p.amount || ''),
        }))
        : null);

    if (Array.isArray(rawPrices) && rawPrices.length > 0) {
      return rawPrices.map((item: any) => ({
        packageType: typeof item === 'object' ? item.packageType || item.type || '' : '',
        price: typeof item === 'object' ? String(item.price || item.amount || '') : String(item || ''),
      }));
    }

    const legacyStartingPrice = String(packageData.startingPrice || '2795.00').replace(/[^0-9.]/g, '');
    return [
      { packageType: 'Quad Occupancy', price: legacyStartingPrice || '2795.00' },
      { packageType: 'Triple Occupancy', price: legacyStartingPrice ? String(Number(legacyStartingPrice) + 400) : '3195.00' },
      { packageType: 'Double Occupancy', price: legacyStartingPrice ? String(Number(legacyStartingPrice) + 800) : '3595.00' },
    ];
  })();

  const initialPkg = {
    ...packageData,
    packagePrices: initialPackagePrices,
    cardData: parseJSON(packageData.cardData, getDefaultCardData(packageData.type)),
    detailPageData: parseJSON(packageData.detailPageData, {}),
    packagesGallery: normalizeGallery(parseJSON(packageData.packagesGallery, [])),
  };

  const [editingPkg, setEditingPkg] = useState<any>(initialPkg);
  const [activeTab, setActiveTab] = useState<'basic' | 'detail'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const addPackagePriceRow = () => {
    setEditingPkg((prev: any) => ({
      ...prev,
      packagePrices: [...(prev.packagePrices || []), { packageType: '', price: '' }],
    }));
  };

  const removePackagePriceRow = (idx: number) => {
    setEditingPkg((prev: any) => {
      const updated = [...(prev.packagePrices || [])];
      updated.splice(idx, 1);
      return { ...prev, packagePrices: updated };
    });
  };

  const updatePackagePriceRow = (idx: number, field: 'packageType' | 'price', value: string) => {
    setEditingPkg((prev: any) => {
      const updated = [...(prev.packagePrices || [])];
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, packagePrices: updated };
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;

    // Filter and validate package types & prices
    const validRows = (editingPkg.packagePrices || [])
      .map((row: any) => ({
        packageType: (row.packageType || '').trim(),
        price: String(row.price || '').trim(),
      }))
      .filter((row: any) => row.packageType || row.price);

    if (validRows.length === 0) {
      alert('Please add at least one Package Type & Price.');
      return;
    }

    for (const row of validRows) {
      if (!row.packageType) {
        alert('Package Type cannot be empty.');
        return;
      }
      const num = Number(row.price);
      if (isNaN(num) || num <= 0) {
        alert(`Please enter a valid positive CAD price for "${row.packageType}".`);
        return;
      }
    }

    // Determine minimum numeric price for startingPrice column compatibility
    const numericPrices = validRows.map((r: any) => Number(r.price)).filter((n: number) => !isNaN(n) && n > 0);
    const minPrice = numericPrices.length > 0 ? Math.min(...numericPrices).toFixed(2) : '1995.00';

    const updatedCardData = {
      ...(editingPkg.cardData || {}),
      packagePrices: validRows,
    };

    const updatedDetailPageData = {
      ...(editingPkg.detailPageData || {}),
      packagePrices: validRows,
    };

    setIsSubmitting(true);
    const res = await updatePackageAction(editingPkg.id, {
      title: editingPkg.title,
      slug: editingPkg.slug,
      type: editingPkg.type,
      month: editingPkg.month,
      startingPrice: minPrice,
      starRating: editingPkg.starRating,
      status: editingPkg.status,
      shortDescription: editingPkg.shortDescription,
      fullDescription: editingPkg.fullDescription,
      cardData: updatedCardData,
      detailPageData: updatedDetailPageData,
      packagesGallery: (Array.isArray(editingPkg.packagesGallery) ? editingPkg.packagesGallery : []).filter(Boolean),
    });
    setIsSubmitting(false);
    if (res.success) {
      setSaveMsg('Package Updated Successfully!');
      setTimeout(() => setSaveMsg(null), 3000);
    } else {
      alert(res.error || 'Failed to update package.');
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-4">
          <Link href={editingPkg.type === 'hajj' ? '/admin/hajj-packages' : '/admin/umrah-packages'} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0 flex items-center gap-2">
            <Edit2 className="w-5 h-5 text-gold" /> Edit {editingPkg.type === 'hajj' ? 'Hajj' : 'Umrah'} Package
          </h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50 p-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'basic' ? 'bg-gold text-primary shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Basic & Card Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('detail')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'detail' ? 'bg-gold text-primary shadow' : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Detail Page Content
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">


          {activeTab === 'basic' && (
            <>
              {/* Package Title */}
              <div className="col-span-full">
                <label className="text-xs font-bold text-slate-700 block mb-1">Package Title *</label>
                <input
                  type="text"
                  value={editingPkg.title}
                  onChange={e => {
                    const title = e.target.value;
                    let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    let slug = baseSlug;
                    if (editingPkg.type === 'umrah' && editingPkg.month) {
                      const monthSuffix = formatTravelMonth(editingPkg.month).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      if (monthSuffix) {
                        slug = baseSlug ? `${baseSlug}-${monthSuffix}` : monthSuffix;
                      }
                    }
                    setEditingPkg({ ...editingPkg, title, slug });
                  }}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Slug */}
              <div className="col-span-full">
                <label className="text-xs font-bold text-slate-700 block mb-1">Page Slug *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 sm:text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    value={editingPkg.slug || ''}
                    onChange={e => setEditingPkg({ ...editingPkg, slug: e.target.value })}
                    required
                    className="flex-1 w-full px-3.5 py-2.5 border border-slate-200 rounded-r-xl text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Type</label>
                <select
                  value={editingPkg.type}
                  onChange={e => setEditingPkg({ ...editingPkg, type: e.target.value as any, cardData: getDefaultCardData(e.target.value as any) })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary bg-white"
                >
                  <option value="umrah">🕋 Umrah Package</option>
                  <option value="hajj">🕌 Hajj Package</option>
                </select>
              </div>

              {/* Month */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Travel Month *</label>
                <MonthYearPicker
                  value={editingPkg.month}
                  onChange={val => {
                    let updatedSlug = editingPkg.slug;
                    if (editingPkg.type === 'umrah' && editingPkg.title) {
                      const baseSlug = (editingPkg.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                      const monthSuffix = val ? formatTravelMonth(val).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '';
                      if (monthSuffix) {
                        updatedSlug = baseSlug ? `${baseSlug}-${monthSuffix}` : monthSuffix;
                      } else {
                        updatedSlug = baseSlug;
                      }
                    }
                    setEditingPkg({ ...editingPkg, month: val, slug: updatedSlug });
                  }}
                  placeholder="Select Month & Year"
                />
              </div>

              {/* Package Type & Price (CAD) */}
              <div className="col-span-full space-y-3 p-4 border border-slate-200 bg-slate-50/70 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-800 block">
                      Package Type & Price (CAD) *
                    </label>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Configure multiple occupancy or package tiers with individual CAD prices.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addPackagePriceRow}
                    className="text-[11px] font-extrabold text-primary border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                  >
                    + Add Package Type
                  </button>
                </div>

                <div className="space-y-2.5">
                  {(editingPkg.packagePrices || []).map((row: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="flex-1">
                        <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">PACKAGE TYPE</label>
                        <input
                          type="text"
                          placeholder="e.g. Quad Occupancy"
                          value={row.packageType || ''}
                          onChange={e => updatePackagePriceRow(idx, 'packageType', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold outline-none focus:border-primary"
                        />
                      </div>
                      <div className="w-40 sm:w-48">
                        <label className="text-[9px] font-bold text-ink-lt mb-0.5 block">PRICE (CAD)</label>
                        <input
                          type="text"
                          placeholder="2795.00"
                          value={row.price || ''}
                          onChange={e => updatePackagePriceRow(idx, 'price', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-primary"
                        />
                      </div>
                      {(editingPkg.packagePrices || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePackagePriceRow(idx)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center border-none cursor-pointer shrink-0 mt-3 transition-colors"
                          title="Remove Package Type"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {(editingPkg.packagePrices || []).length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">
                      No package types added. Click "+ Add Package Type".
                    </p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="col-span-full">
                <label className="text-xs font-bold text-slate-700 block mb-2">Availability Status</label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <label className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none ${editingPkg.status === 'sold_out'
                    ? 'border-red-400 bg-red-50'
                    : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}>
                    <div className="relative shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={editingPkg.status === 'sold_out'}
                        onChange={e =>
                          setEditingPkg({
                            ...editingPkg,
                            status: e.target.checked ? 'sold_out' : 'available',
                          })
                        }
                      />
                      <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${editingPkg.status === 'sold_out' ? 'bg-red-500' : 'bg-slate-300'
                        }`} />
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${editingPkg.status === 'sold_out' ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                    </div>
                    <span className={`text-xs font-extrabold uppercase tracking-wider ${editingPkg.status === 'sold_out' ? 'text-red-600' : 'text-slate-500'
                      }`}>
                      {editingPkg.status === 'sold_out' ? '🔴 Sold Out' : 'Mark as Sold Out'}
                    </span>
                  </label>
                  {editingPkg.status !== 'sold_out' && (
                    <select
                      value={editingPkg.status || 'available'}
                      onChange={e => setEditingPkg({ ...editingPkg, status: e.target.value as any })}
                      className={`flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-primary bg-white ${editingPkg.status === 'available' ? '!text-primary' :
                        editingPkg.status === 'coming_soon' ? '!text-amber-500' :
                          '!text-slate-500'
                        }`}
                    >
                      <option value="available" className="text-primary font-semibold">● Available</option>
                      <option value="coming_soon" className="text-amber-500 font-semibold">● Coming Soon</option>
                      <option value="draft" className="text-slate-500 font-semibold">● Draft</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Star Rating */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Hotel Star Rating</label>
                <select
                  value={editingPkg.starRating || '5 Star'}
                  onChange={e => setEditingPkg({ ...editingPkg, starRating: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary bg-white"
                >
                  <option value="5 Star">5 Star Luxury</option>
                  <option value="4 Star">4 Star Premium</option>
                  <option value="3 Star">3 Star Standard</option>
                </select>
              </div>

              <div className="col-span-full">
                <label className="text-xs font-bold text-slate-700 block mb-1">Short Summary</label>
                <input
                  type="text"
                  value={editingPkg.shortDescription || ''}
                  onChange={e => setEditingPkg({ ...editingPkg, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              {editingPkg.type === 'hajj' ? (
                <HajjCardFields pkgData={editingPkg} setPkgData={setEditingPkg} />
              ) : (
                <UmrahCardFields pkgData={editingPkg} setPkgData={setEditingPkg} />
              )}
            </>
          )}

          {activeTab === 'detail' && (
            <DetailPageDataFields
              data={editingPkg.detailPageData}
              onChange={newData => setEditingPkg({ ...editingPkg, detailPageData: newData })}
              onHotelSync={(hotelKey, field, val) => {
                setEditingPkg((prev: any) => ({
                  ...prev,
                  cardData: {
                    ...prev.cardData,
                    [hotelKey]: { ...(prev.cardData?.[hotelKey] || {}), [field]: val }
                  }
                }));
              }}
              packagesGallery={Array.isArray(editingPkg.packagesGallery) ? editingPkg.packagesGallery : []}
              onGalleryChange={(gallery) => setEditingPkg({ ...editingPkg, packagesGallery: gallery })}
            />
          )}

          <div className="col-span-full flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
            <div>
              {saveMsg && (
                <span className="text-sm font-bold text-primary bg-emerald-50 px-4 py-2 rounded-lg">
                  {saveMsg}
                </span>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Link
                href={editingPkg.type === 'hajj' ? '/admin/hajj-packages' : '/admin/umrah-packages'}
                className="px-6 py-3 rounded-full text-sm font-bold bg-slate-100 text-slate-700 border-none cursor-pointer hover:bg-slate-200 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 rounded-full text-sm font-extrabold bg-primary text-white border-none cursor-pointer shadow-md hover:bg-[#003229] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}