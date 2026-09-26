'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPackage, updatePackageAction, deletePackage, updatePackageStatus, updatePackageOrderAction, bulkGeneratePackageCodesAction } from '@/actions/packageActions';
import {
  getPackageCategories,
  createPackageCategoryAction,
  updatePackageCategoryAction,
  deletePackageCategoryAction,
  updatePackageCategoryOrderAction,
  updatePackageCategoryAssignmentAction,
  PackageCategoryWithCount,
} from '@/actions/packageCategoryActions';
import ConfirmModal, { ConfirmModalConfig } from '@/components/ui/ConfirmModal';
import { Trash2, Edit2, Plus, Sparkles, Sliders, X, BookOpen, Hotel, Plane, GripVertical, Utensils, Tags, ChevronUp, ChevronDown, Pencil, Check } from 'lucide-react';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import DetailPageDataFields from '@/components/admin/DetailPageDataFields';
import MonthYearPicker from '@/components/admin/MonthYearPicker';
import DurationInput from '@/components/admin/DurationInput';
import IconPicker from '@/components/admin/IconPicker';
import { formatTravelMonth, formatDuration, parseDuration } from '@/lib/packageHelpers';
import Link from 'next/link';

interface PackagesClientProps {
  initialPackages: any[];
  defaultTab: 'hajj' | 'umrah';
}

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultHajjCardData = {
  bannerImage: '',
  badgeTag: 'HAJJ 2027',
  duration: '14Days',
  flightRoute: 'FROM UK ➔ TO SAUDIA',
  operatorName: 'British Hajj Travel',
  operatorRating: '4.4/5',
  btnLabel: 'Book Hajj 2027',
  btnLink: '/contact',
  priceSubtext: 'FROM £ / QUAD OCCUPANCY',
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
    'British & U.S. citizens with Pakistani passports.',
    'Pakistani passport holders with British PR or American Green Card.',
    'All foreign passport holders with Pakistan passport.',
    'Side trip to Pakistan or any other destination available with an additional cost.',
  ],
};

const defaultUmrahCardData = {
  bannerImage: '',
  isActiveCard: false,
  btnLabel: 'BOOK NOW',
  btnLink: '/contact',
  includes: ['Return Flights from Toronto', '5 Star Hotel in Makkah', '5 Star Hotel in Madinah', 'Visa & Registration', 'Imam & Guide'],
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

      {/* Banner + Badge row */}
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
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">PACKAGE CODE</label>
            <input
              type="text"
              value={cd.packageCode || ''}
              onChange={e => updateCD('packageCode', e.target.value)}
              placeholder="e.g. BHT-H01"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
            />
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
          <div className="col-span-2">
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">BUTTON LINK</label>
            <input type="text" value={cd.btnLink || ''} onChange={e => updateCD('btnLink', e.target.value)} className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs" />
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
                placeholder="e.g. British & U.S. citizens with Pakistani passports."
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

// ─── Umrah Card Fields ────────────────────────────────────────────────────────

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

  const includes: any[] = (Array.isArray(cd.includes) ? cd.includes : []).map((inc: any) => typeof inc === 'string' ? { icon: '', text: inc } : inc);

  const updateIncludes = (idx: number, val: any) => {
    const next = [...includes];
    next[idx] = val;
    updateCD('includes', next);
  };
  const addInclude = () => updateCD('includes', [...includes, { icon: '', text: '' }]);
  const removeInclude = (idx: number) => updateCD('includes', includes.filter((_, i) => i !== idx));

  return (
    <div className="col-span-full space-y-5 p-5 border border-emerald-200 bg-emerald-50/30 rounded-2xl">
      <h4 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider border-b border-emerald-200 pb-2 flex items-center gap-2">
        <Plane className="w-3.5 h-3.5" /> Dynamic Card Details
      </h4>

      {/* Banner image + links */}
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
          <div>
            <label className="text-[10px] font-bold text-ink-lt mb-1 block">PACKAGE CODE</label>
            <input
              type="text"
              value={cd.packageCode || ''}
              onChange={e => updateCD('packageCode', e.target.value)}
              placeholder="e.g. BHT-U01"
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
            />
          </div>
        </div>
      </div>


      {/* Hotels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Makkah Hotel */}
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

        {/* Madinah Hotel */}
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

      {/* Package Includes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-bold text-ink-lt uppercase tracking-wider">PACKAGE INCLUDES</label>
          <button type="button" onClick={addInclude} className="text-[10px] font-extrabold text-emerald-700 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full transition-colors cursor-pointer">
            + Add Item
          </button>
        </div>
        <div className="space-y-2">
          {includes.map((inc, idx) => (
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

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PackagesClient({ initialPackages, defaultTab }: PackagesClientProps) {
  const [packagesList, setPackagesList] = useState<any[]>(initialPackages);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSeoPkg, setSelectedSeoPkg] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<ConfirmModalConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'umrah' | 'hajj'>(defaultTab);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'code-asc' | 'code-desc' | null>(null);

  // ── Package Categories state ───────────────────────────────────────────────
  const [categories, setCategories] = useState<PackageCategoryWithCount[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [catBusy, setCatBusy] = useState(false);
  const [newPkgCategoryId, setNewPkgCategoryId] = useState<string>('');

  const loadCategories = useCallback(async (type: 'umrah' | 'hajj') => {
    try {
      const list = await getPackageCategories(type);
      setCategories(list || []);
    } catch (err) {
      console.error('Failed to load package categories', err);
    }
  }, []);

  useEffect(() => {
    loadCategories(activeTab);
  }, [activeTab, loadCategories]);

  const blankPkg = (type: 'hajj' | 'umrah') => ({
    title: '',
    slug: '',
    type,
    month: '',
    startingPrice: '1995.00',
    starRating: '5 Star',
    shortDescription: '',
    fullDescription: '',
    inclusions: '[]',
    cardData: getDefaultCardData(type),
    detailPageData: {},
    packagesGallery: [],
  });

  const [newPkg, setNewPkg] = useState(() => blankPkg(defaultTab));

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const currentTabPkgs = packagesList.filter(p => p.type === activeTab);
    const otherTabPkgs = packagesList.filter(p => p.type !== activeTab);

    const updatedTabPkgs = [...currentTabPkgs];
    const movedItem = updatedTabPkgs.splice(draggedIndex, 1)[0];
    updatedTabPkgs.splice(index, 0, movedItem);

    setDraggedIndex(index);
    setPackagesList([...updatedTabPkgs, ...otherTabPkgs]);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    const orderedIds = packagesList.filter(p => p.type === activeTab).map(p => p.id);
    setSaveMsg('Saving order...');
    await updatePackageOrderAction(orderedIds);
    setSaveMsg('✓ Order updated successfully!');
    setTimeout(() => setSaveMsg(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newPkg.title);
    formData.append('slug', newPkg.slug);
    formData.append('type', newPkg.type);
    formData.append('month', newPkg.month);
    formData.append('startingPrice', newPkg.startingPrice);
    formData.append('shortDescription', newPkg.shortDescription);
    formData.append('fullDescription', newPkg.fullDescription);
    formData.append('inclusions', newPkg.inclusions);
    if (newPkgCategoryId) formData.append('categoryId', newPkgCategoryId);
    if (newPkg.cardData) formData.append('cardData', JSON.stringify(newPkg.cardData));
    const gallery = (Array.isArray(newPkg.packagesGallery) ? newPkg.packagesGallery : []).filter(Boolean);
    formData.append('packagesGallery', JSON.stringify(gallery));

    const res = await createPackage(formData);
    if (res.success) {
      setSaveMsg('Package created successfully!');
      setTimeout(() => setSaveMsg(null), 3000);
      setIsCreating(false);
      setNewPkg(blankPkg(activeTab));
      window.location.reload();
    } else {
      alert(res.error || 'Failed to create package.');
    }
  };



  const handleDeleteInitiate = (id: number, title: string) => {
    setConfirmConfig({
      icon: <Trash2 className="w-4 h-4 text-red-600" />,
      title: `Delete ${title}?`,
      message: `Are you sure you want to permanently delete "${title}"? This cannot be undone.`,
      confirmText: 'Yes, Delete Package',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        await deletePackage(id);
        setPackagesList(prev => prev.filter(p => p.id !== id));
        setSaveMsg('Package deleted.');
        setTimeout(() => setSaveMsg(null), 3000);
      },
    });
  };

  const handleStatusToggle = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'available' ? 'sold_out' : 'available';
    await updatePackageStatus(id, nextStatus as any);
    setPackagesList(prev => prev.map(p => (p.id === id ? { ...p, status: nextStatus } : p)));
  };

  // ── Category handlers ──────────────────────────────────────────────────────
  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name || catBusy) return;
    setCatBusy(true);
    const res = await createPackageCategoryAction({ name, type: activeTab });
    setCatBusy(false);
    if (res.success) {
      setNewCategoryName('');
      await loadCategories(activeTab);
      setSaveMsg('✓ Category created!');
      setTimeout(() => setSaveMsg(null), 3000);
    } else {
      alert(res.error || 'Failed to create category.');
    }
  };

  const handleRenameCategory = async (id: number) => {
    const name = editingCategoryName.trim();
    if (!name || catBusy) return;
    setCatBusy(true);
    const res = await updatePackageCategoryAction(id, { name });
    setCatBusy(false);
    if (res.success) {
      setEditingCategoryId(null);
      setEditingCategoryName('');
      await loadCategories(activeTab);
      setSaveMsg('✓ Category updated!');
      setTimeout(() => setSaveMsg(null), 3000);
    } else {
      alert(res.error || 'Failed to update category.');
    }
  };

  const handleDeleteCategory = (id: number, name: string, count: number) => {
    setConfirmConfig({
      icon: <Trash2 className="w-4 h-4 text-red-600" />,
      title: `Delete category "${name}"?`,
      message: count > 0
        ? `${count} package(s) are assigned to this category. They will become uncategorised — the packages themselves are NOT deleted.`
        : 'Are you sure you want to delete this category? This cannot be undone.',
      confirmText: 'Yes, Delete Category',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm: async () => {
        await deletePackageCategoryAction(id);
        await loadCategories(activeTab);
        setSaveMsg('Category deleted.');
        setTimeout(() => setSaveMsg(null), 3000);
      },
    });
  };

  const handleMoveCategory = async (index: number, direction: -1 | 1) => {
    const next = [...categories];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    await updatePackageCategoryOrderAction(next.map(c => c.id));
  };

  const handleAssignCategory = async (packageId: number, categoryId: string) => {
    setPackagesList(prev => prev.map(p => (p.id === packageId ? { ...p, categoryId: categoryId ? Number(categoryId) : null } : p)));
    const res = await updatePackageCategoryAssignmentAction(packageId, categoryId ? Number(categoryId) : null);
    if (res.success) {
      setSaveMsg('✓ Category assigned!');
      setTimeout(() => setSaveMsg(null), 2500);
      await loadCategories(activeTab);
    } else {
      alert(res.error || 'Failed to assign category.');
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────

  const getPackageCode = (pkg: any): string => {
    if (!pkg) return '';
    let cd = pkg.cardData;
    if (typeof cd === 'string') {
      try { cd = JSON.parse(cd); } catch { cd = {}; }
    }
    if (cd && typeof cd === 'object' && cd['0'] !== undefined) {
      if (cd.packageCode) return String(cd.packageCode).trim().toUpperCase();
      try {
        const numKeys = Object.keys(cd).filter(k => /^\d+$/.test(k)).sort((a,b) => Number(a)-Number(b));
        const str = numKeys.map(k => cd[k]).join('');
        const inner = JSON.parse(str);
        if (inner?.packageCode) return String(inner.packageCode).trim().toUpperCase();
      } catch {}
    }
    let dp = pkg.detailPageData;
    if (typeof dp === 'string') {
      try { dp = JSON.parse(dp); } catch { dp = {}; }
    }
    const code = cd?.packageCode || dp?.packageCode || pkg.packageCode || pkg.code || '';
    return String(code).trim().toUpperCase();
  };

  const filteredPkgs = (() => {
    const base = packagesList.filter(pkg => pkg.type === activeTab);
    if (!sortBy) return base;
    return [...base].sort((a, b) => {
      const aCode = getPackageCode(a);
      const bCode = getPackageCode(b);
      const cmp = aCode.localeCompare(bCode, undefined, { sensitivity: 'base' });
      return sortBy === 'code-asc' ? cmp : -cmp;
    });
  })();

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header Bar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 m-0">
            {activeTab === 'hajj' ? 'Hajj Packages' : 'Umrah Packages'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 mb-0">
            {activeTab === 'hajj'
              ? 'Manage Hajj package offerings, prices, and live availability'
              : 'Manage Umrah package offerings, prices, and live availability'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && <span className="text-xs font-bold text-primary animate-in fade-in">{saveMsg}</span>}
          <button
            type="button"
            onClick={() => setShowCategories(!showCategories)}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer border shadow-md flex items-center gap-2 ${showCategories
              ? 'bg-primary text-white border-primary hover:bg-white hover:text-primary'
              : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary'
              }`}
          >
            <Tags className="w-4 h-4" />
            {showCategories ? 'Hide Categories' : 'Manage Categories'}
          </button>
          <button
            type="button"
            onClick={async () => {
              setSaveMsg('Generating codes…');
              const res = await bulkGeneratePackageCodesAction(activeTab);
              if (res.success) {
                setSaveMsg(`✓ ${res.updated} code${res.updated !== 1 ? 's' : ''} generated. Reloading…`);
                setTimeout(() => window.location.reload(), 1200);
              } else {
                setSaveMsg(null);
                alert(res.error || 'Failed to generate codes.');
              }
            }}
            title="Auto-assign BHT-H01, BHT-H02… codes to packages that don't have one yet"
            className="px-5 py-2.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer border shadow-md flex items-center gap-2 bg-white text-amber-700 border-amber-300 hover:bg-amber-50 hover:border-amber-500"
          >
            <Sparkles className="w-4 h-4" />
            Auto-generate codes
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isCreating) setNewPkg(blankPkg(activeTab));
              setIsCreating(!isCreating);
            }}
            className="bg-red hover:bg-red-lt text-white px-5 py-2.5 rounded-full text-xs font-extrabold transition-colors cursor-pointer border-none shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isCreating ? 'Close Form' : `Create New ${activeTab === 'hajj' ? 'Hajj' : 'Umrah'} Package`}
          </button>
        </div>
      </div>

      {/* ── Create Package Form ─────────────────────────────────────────────── */}
      {
        isCreating && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in mb-2">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-red" />
              Add New {activeTab === 'hajj' ? 'Hajj' : 'Umrah'} Package
            </h3>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-full">
                <label className="text-xs font-bold text-slate-700 block mb-1">Package Title *</label>
                <input
                  type="text"
                  placeholder={activeTab === 'hajj' ? 'e.g. Economy Hajj Package 2027' : 'e.g. 5 Star September Umrah Package 2026'}
                  value={newPkg.title}
                  onChange={e => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setNewPkg({ ...newPkg, title, slug });
                  }}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Slug Field */}
              <div className="col-span-full">
                <label className="text-xs font-bold text-slate-700 block mb-1">Page Slug *</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 text-slate-500 sm:text-xs">
                    /
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. 5-star-september-umrah-package"
                    value={newPkg.slug}
                    onChange={(e) => setNewPkg({ ...newPkg, slug: e.target.value })}
                    required
                    className="flex-1 w-full px-3.5 py-2.5 border border-slate-200 rounded-r-xl text-xs outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Package Type</label>
              <select
                value={newPkg.type}
                disabled
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs bg-white opacity-60 cursor-not-allowed"
              >
                <option value="umrah">🕋 Umrah Package</option>
                <option value="hajj">🕌 Hajj Package</option>
              </select>
            </div> */}

              {newPkg.type === 'umrah' && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Travel Month *</label>
                  <MonthYearPicker
                    value={newPkg.month}
                    onChange={val => setNewPkg({ ...newPkg, month: val })}
                    placeholder="Select Month & Year"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Starting Price (£) *</label>
                <input
                  type="text"
                  placeholder="2695.00"
                  value={newPkg.startingPrice}
                  onChange={e => setNewPkg({ ...newPkg, startingPrice: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                />
              </div>

              {newPkg.type === 'umrah' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Hotel Star Rating</label>
                    <select
                      value={newPkg.starRating}
                      onChange={e => setNewPkg({ ...newPkg, starRating: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary bg-white"
                    >
                      <option value="5 Star">5 Star Luxury</option>
                      <option value="4 Star">4 Star Premium</option>
                      <option value="3 Star">3 Star Standard</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Package Category</label>
                    <select
                      value={newPkgCategoryId}
                      onChange={e => setNewPkgCategoryId(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary bg-white"
                    >
                      <option value="">Uncategorised</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-full">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Short Summary</label>
                    <input
                      type="text"
                      placeholder="Brief package highlight description"
                      value={newPkg.shortDescription}
                      onChange={e => setNewPkg({ ...newPkg, shortDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
                    />
                  </div>
                </>
              )}

              {/* Dynamic card fields per type */}
              {newPkg.type === 'hajj' ? (
                <HajjCardFields pkgData={newPkg} setPkgData={setNewPkg} />
              ) : (
                <UmrahCardFields pkgData={newPkg} setPkgData={setNewPkg} />
              )}

              <div className="col-span-full flex justify-end gap-3 pt-3 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-5 py-2.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border-none cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-full text-xs font-extrabold bg-primary text-white border-none cursor-pointer shadow-md hover:bg-white hover:text-primary transition-colors"
                >
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        )
      }

      {/* ── Package Categories Panel ────────────────────────────────────────── */}
      {
        showCategories && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2 m-0">
                <Tags className="w-4 h-4 text-primary" />
                {activeTab === 'hajj' ? 'Hajj' : 'Umrah'} Package Categories
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">Group packages into categories — assign them per package in the table below</span>
            </div>

            {/* Add category */}
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                placeholder="e.g. Ramadan Umrah, Luxury 5-Star, Budget, Family, December Group..."
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={catBusy || !newCategoryName.trim()}
                className="bg-primary text-white px-4 py-2.5 rounded-full text-xs font-extrabold border-none cursor-pointer shadow-md hover:bg-white hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            {/* Category list */}
            {categories.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center border border-dashed border-slate-200 rounded-xl">
                No categories yet. Add your first {activeTab === 'hajj' ? 'Hajj' : 'Umrah'} package category above.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {categories.map((cat, idx) => (
                  <div key={cat.id} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50/60 transition-colors">
                    {/* Reorder */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(idx, -1)}
                        disabled={idx === 0}
                        title="Move up"
                        className="w-5 h-4 rounded bg-slate-100 hover:bg-primary hover:text-white text-slate-500 flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(idx, 1)}
                        disabled={idx === categories.length - 1}
                        title="Move down"
                        className="w-5 h-4 rounded bg-slate-100 hover:bg-primary hover:text-white text-slate-500 flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Name */}
                    {editingCategoryId === cat.id ? (
                      <input
                        type="text"
                        value={editingCategoryName}
                        onChange={e => setEditingCategoryName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleRenameCategory(cat.id); } }}
                        autoFocus
                        className="flex-1 min-w-0 px-3 py-1.5 border border-primary rounded-lg text-xs outline-none"
                      />
                    ) : (
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{cat.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 truncate">/{cat.slug}</div>
                      </div>
                    )}

                    {/* Package count */}
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap shrink-0">
                      {cat.packageCount} pkg{cat.packageCount === 1 ? '' : 's'}
                    </span>

                    {/* Published badge */}
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border whitespace-nowrap shrink-0 ${cat.isPublished
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {cat.isPublished ? '● Published' : '● Hidden'}
                    </span>

                    {/* Actions */}
                    {editingCategoryId === cat.id ? (
                      <button
                        type="button"
                        onClick={() => handleRenameCategory(cat.id)}
                        title="Save name"
                        className="w-7 h-7 rounded-full bg-emerald-50 hover:bg-primary text-emerald-700 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}
                        title="Rename category"
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-primary text-slate-600 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name, cat.packageCount)}
                      title="Delete category"
                      className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      }

      {/* ── Packages Table ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-extrabold text-[10px] uppercase tracking-wider">
                <th className="py-3 px-3 w-10 text-center text-slate-400" title="Drag to reorder">⋮⋮</th>
                <th className="py-3 px-4">Package Title</th>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy(prev =>
                        prev === null ? 'code-asc' : prev === 'code-asc' ? 'code-desc' : null
                      );
                    }}
                    title="Sort by Package Code"
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-white transition-colors group"
                  >
                    Package Code
                    <span className="flex flex-col leading-none opacity-60 group-hover:opacity-100">
                      <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${sortBy === 'code-asc' ? 'text-amber-400 opacity-100' : ''}`} />
                      <ChevronDown className={`w-2.5 h-2.5 ${sortBy === 'code-desc' ? 'text-amber-400 opacity-100' : ''}`} />
                    </span>
                    {sortBy && (
                      <span
                        onClick={e => { e.stopPropagation(); setSortBy(null); }}
                        title="Clear sort"
                        className="ml-1 text-[9px] text-amber-400 hover:text-red-400 font-extrabold cursor-pointer"
                      >
                        ✕
                      </span>
                    )}
                  </button>
                </th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Starting Price</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPkgs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No packages found. Click "Create New {activeTab === 'hajj' ? 'Hajj' : 'Umrah'} Package" to add one.
                  </td>
                </tr>
              ) : (
                filteredPkgs.map((pkg, idx) => {
                  const isSoldOut = pkg.status === 'sold_out';
                  const pkgCode = getPackageCode(pkg);
                  return (
                    <tr
                      key={pkg.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`transition-colors border-b cursor-grab active:cursor-grabbing ${draggedIndex === idx
                        ? 'bg-emerald-50/90 ring-2 ring-emerald-400 ring-inset'
                        : isSoldOut
                          ? 'bg-red-50/50 border-red-100 hover:bg-red-50/80'
                          : 'border-slate-100 hover:bg-slate-50/60'
                        }`}
                    >
                      <td className="py-3.5 px-3 text-center text-slate-400 hover:text-slate-700">
                        <GripVertical className="w-4 h-4 mx-auto cursor-grab active:cursor-grabbing" />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className={`font-bold ${isSoldOut ? 'text-red-700' : 'text-slate-900'}`}>{pkg.title}</div>
                        <div className="text-[10px] font-mono text-slate-400">{pkg.slug}</div>
                        {isSoldOut && (
                          <span className="inline-flex items-center gap-1 mt-0.5 text-[9px] font-extrabold text-red-500 uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block" /> Sold Out
                          </span>
                        )}
                      </td>
                      {/* ── Package Code cell (read-only badge) ── */}
                      <td className="py-3.5 px-4">
                        {pkgCode ? (
                          <span
                            title={`Package Code: ${pkgCode}`}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold tracking-wider uppercase bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs select-all"
                          >
                            {pkgCode}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-50 border border-dashed border-slate-200">
                            No Code
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${pkg.type === 'hajj'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}>
                          {pkg.type === 'hajj' ? '🕌 Hajj' : '🕋 Umrah'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={pkg.categoryId ? String(pkg.categoryId) : ''}
                          onChange={(e) => handleAssignCategory(pkg.id, e.target.value)}
                          title="Assign package category"
                          className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 outline-none focus:border-primary cursor-pointer max-w-[150px] truncate hover:border-primary transition-colors"
                        >
                          <option value="">Uncategorised</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className={`py-3.5 px-4 font-medium ${isSoldOut ? 'text-red-400 line-through' : 'text-slate-600'}`}>
                        {formatTravelMonth(pkg.month) || 'Flexible'}
                      </td>
                      <td className={`py-3.5 px-4 font-black ${isSoldOut ? 'text-red-500' : 'text-slate-900'}`}>
                        £ ${Number(pkg.startingPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold capitalize border-2 transition-all ${isSoldOut
                            ? 'bg-red-100 text-red-700 border-red-400 shadow-sm'
                            : pkg.status === 'available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border-slate-300'
                            }`}
                        >
                          {isSoldOut ? '🔴 Sold Out' : `● ${pkg.status || 'available'}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSeoPkg(pkg)}
                            title="Package SEO Center"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-primary border border-emerald-200 text-[10px] font-extrabold hover:bg-primary hover:text-white transition-all cursor-pointer"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>SEO</span>
                          </button>
                          <Link
                            href={`/admin/packages/${pkg.id}`}
                            title="Edit Package"
                            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-primary text-slate-600 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteInitiate(pkg.id, pkg.title)}
                            title="Delete Package"
                            className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-600 text-red-600 hover:text-white flex items-center justify-center border-none cursor-pointer transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal config={confirmConfig} onClose={() => setConfirmConfig(null)} />

      <SeoCenterModal
        isOpen={!!selectedSeoPkg}
        onClose={() => setSelectedSeoPkg(null)}
        pageData={
          selectedSeoPkg
            ? {
              id: `pkg_${selectedSeoPkg.id}`,
              title: selectedSeoPkg.title,
              slug: `/package/${selectedSeoPkg.id}`,
              metaTitle: `${selectedSeoPkg.title} | British Hajj Travel UK`,
              metaDescription: `Book official ${selectedSeoPkg.title} from UK. Starting at £ $${selectedSeoPkg.startingPrice}. ${selectedSeoPkg.shortDescription || 'Verified visa, luxury hotel stays, flights included.'}`,
            }
            : null
        }
      />
    </div >
  );
}