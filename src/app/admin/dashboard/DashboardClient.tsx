'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardSeoCenterSection from '@/components/admin/DashboardSeoCenterSection';
import { ActivityItem } from '@/actions/activityActions';
import {
  ClipboardList,
  Compass,
  Landmark,
  FileText,
  FileCode2,
  Users as UsersIcon,
  Mail,
  ArrowUpRight,
  ChevronDown,
  Filter,
  Sparkles,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  CheckCircle2,
} from 'lucide-react';

interface DashboardClientProps {
  session: any;
  initialEnquiries: any[];
  initialPackages: any[];
  initialVisas: any[];
  initialPages: any[];
  initialUsers: any[];
  initialActivities: ActivityItem[];
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  pages: { label: 'Pages', bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', border: '#BFDBFE' },
  users: { label: 'Users / Login', bg: '#ECFDF5', text: '#047857', dot: '#10B981', border: '#A7F3D0' },
  settings: { label: 'Settings', bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6', border: '#DDD6FE' },
  packages: { label: 'Packages', bg: '#FFFBEB', text: '#B45309', dot: '#F59E0B', border: '#FDE68A' },
  visas: { label: 'Visas', bg: '#E0F2FE', text: '#0369A1', dot: '#0EA5E9', border: '#BAE6FD' },
  enquiries: { label: 'Enquiries', bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E', border: '#FECDD3' },
  menus: { label: 'Menus', bg: '#F0FDFA', text: '#0F766E', dot: '#14B8A6', border: '#99F6E4' },
};

interface SliceData {
  label: string;
  count: number;
  color: string;
  gradientId: string;
  gradientColors: [string, string];
  bgLight: string;
  borderLight: string;
  subtext: string;
}

function Cinematic3DPieChart({
  title,
  subtitle,
  totalCount,
  totalLabel,
  badgeText,
  badgeBg,
  linkHref,
  linkLabel,
  slices,
}: {
  title: string;
  subtitle: string;
  totalCount: number;
  totalLabel: string;
  badgeText: string;
  badgeBg: string;
  linkHref: string;
  linkLabel: string;
  slices: SliceData[];
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = Math.max(
    slices.reduce((acc, s) => acc + s.count, 0),
    1
  );

  let accumulatedDash = 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 z-10">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 m-0 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-primary animate-spin-slow" /> {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 mb-0">{subtitle}</p>
        </div>
        <Link
          href={linkHref}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 no-underline flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 transition-all hover:scale-105 shadow-2xs"
        >
          {linkLabel} <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center py-4 z-10">
        {/* ── 3D Isometric Animated SVG Pie Chart ── */}
        <div className="flex justify-center items-center relative group py-2">
          {/* Ambient Radial Glow Backdrop */}
          <div className="absolute inset-0 w-48 h-48 mx-auto my-auto rounded-full bg-gradient-to-tr from-emerald-500/20 via-[#DB9E30]/20 to-blue-500/20 blur-2xl animate-pulse pointer-events-none" />

          {/* 3D Perspective Container */}
          <div
            className="relative w-48 h-48 flex items-center justify-center transition-transform duration-500 hover:scale-105 [perspective:1000px] [transform:perspective(1000px)_rotateX(25deg)_rotateZ(-6deg)] [transform-style:preserve-3d]"
          >
            {/* 3D Shadow Layer Below */}
            <svg
              width="192"
              height="192"
              viewBox="0 0 192 192"
              className="absolute inset-0 transform translate-z-[-16px] blur-xs opacity-40"
            >
              <circle cx="96" cy="96" r="68" fill="none" stroke="#0f172a" strokeWidth="22" />
            </svg>

            {/* Main 3D Donut Chart SVG */}
            <svg
              width="192"
              height="192"
              viewBox="0 0 192 192"
              className="transform -rotate-90 filter drop-shadow-lg"
            >
              <defs>
                {slices.map((s) => (
                  <linearGradient key={s.gradientId} id={s.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={s.gradientColors[0]} />
                    <stop offset="100%" stopColor={s.gradientColors[1]} />
                  </linearGradient>
                ))}
              </defs>

              {/* Background Track */}
              <circle cx="96" cy="96" r="68" fill="none" stroke="#f1f5f9" strokeWidth="22" />

              {/* Animated Slices */}
              {slices.map((s, idx) => {
                const strokeDash = (s.count / total) * 427;
                const strokeOffset = -accumulatedDash;
                accumulatedDash += strokeDash;
                const isHovered = hoveredIdx === idx;

                return (
                  <circle
                    key={s.label}
                    cx="96"
                    cy="96"
                    r="68"
                    fill="none"
                    stroke={`url(#${s.gradientId})`}
                    strokeWidth={isHovered ? 26 : 22}
                    strokeDasharray={`${strokeDash} 427`}
                    strokeDashoffset={strokeOffset}
                    strokeLinecap="round"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    ref={(el) => {
                      if (el) {
                        el.style.transform = isHovered ? 'scale(1.04)' : 'scale(1)';
                        el.style.transformOrigin = '96px 96px';
                      }
                    }}
                    className="transition-all duration-500 ease-out cursor-pointer"
                  />
                );
              })}
            </svg>

            {/* Elevated 3D Center Core Badge */}
            <div
              className="absolute inset-0 m-auto w-24 h-24 rounded-full bg-white/95 backdrop-blur-md shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center pointer-events-none transition-transform duration-300 group-hover:translate-z-6 [transform:translateZ(20px)]"
            >
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">
                {totalLabel}
              </span>
              <span className="text-2xl font-black text-slate-900 leading-none my-0.5 font-serif">
                {totalCount}
              </span>
              <span className={`text-[9px] font-bold ${badgeBg} px-2 py-0.5 rounded-full shadow-2xs`}>
                {badgeText}
              </span>
            </div>
          </div>
        </div>

        {/* Pie Chart Legend Breakdown */}
        <div className="flex flex-col gap-2.5">
          {slices.map((s, idx) => {
            const pct = Math.round((s.count / total) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={s.label}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-3 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${isHovered
                  ? `${s.bgLight} ${s.borderLight} shadow-md translate-x-1 scale-[1.02]`
                  : `${s.bgLight} border-slate-100/70 hover:border-slate-200`
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    ref={(el) => {
                      if (el) {
                        el.style.background = `linear-gradient(135deg, ${s.gradientColors[0]}, ${s.gradientColors[1]})`;
                        el.style.transform = isHovered ? 'scale(1.25)' : 'scale(1)';
                      }
                    }}
                    className="w-3 h-3 rounded-full shadow-xs transition-transform"
                  />
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{s.label}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {pct}% ({s.subtext})
                    </div>
                  </div>
                </div>
                <span className="text-sm font-black text-slate-900 font-mono">{s.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  session,
  initialEnquiries,
  initialPackages,
  initialVisas,
  initialPages,
  initialUsers,
  initialActivities,
}: DashboardClientProps) {
  const [timeRange, setTimeRange] = useState<'Today' | '7 Days' | '30 Days'>('Today');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const router = useRouter();

  // Polling for real-time updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      router.refresh();
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, [router]);

  // Animated counters state
  const [animatedValues, setAnimatedValues] = useState({
    enquiries: 0,
    umrah: 0,
    hajj: 0,
    visas: 0,
    pages: 0,
    users: 0,
    unread: 0,
  });

  const newEnquiriesCount = initialEnquiries.filter((e) => e.status === 'new').length;
  const umrahCount = initialPackages.filter((p) => p.type === 'umrah').length;
  const hajjCount = initialPackages.filter((p) => p.type === 'hajj').length;
  const visaCount = initialVisas.length;
  const totalPackages = initialPackages.length;

  const quoteCount = initialEnquiries.filter((e) => e.type === 'quote_request').length;
  const pkgBookingCount = initialEnquiries.filter((e) => e.type === 'package_enquiry').length;
  const contactMsgCount = initialEnquiries.filter((e) => e.type === 'general_contact').length;
  const visaQueryCount = initialEnquiries.filter((e) => e.type === 'visa_enquiry').length;

  const targetValues = {
    enquiries: initialEnquiries.length,
    umrah: umrahCount,
    hajj: hajjCount,
    visas: visaCount,
    pages: initialPages.length,
    users: initialUsers.length,
    unread: newEnquiriesCount,
  };

  // Smooth Count-Up Animation
  useEffect(() => {
    let animationFrameId: number;
    const startTime = Date.now();
    const duration = 900;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        enquiries: Math.floor(targetValues.enquiries * easeProgress),
        umrah: Math.floor(targetValues.umrah * easeProgress),
        hajj: Math.floor(targetValues.hajj * easeProgress),
        visas: Math.floor(targetValues.visas * easeProgress),
        pages: Math.floor(targetValues.pages * easeProgress),
        users: Math.floor(targetValues.users * easeProgress),
        unread: Math.floor(targetValues.unread * easeProgress),
      });

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setAnimatedValues(targetValues);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    targetValues.enquiries,
    targetValues.umrah,
    targetValues.hajj,
    targetValues.visas,
    targetValues.pages,
    targetValues.users,
    targetValues.unread,
  ]);

  // Pie Chart calculations
  const totalOfferings = Math.max(umrahCount + hajjCount + visaCount, 1);
  const umrahPct = Math.round((umrahCount / totalOfferings) * 100);
  const hajjPct = Math.round((hajjCount / totalOfferings) * 100);
  const visaPct = Math.round((visaCount / totalOfferings) * 100);

  const totalFormQueries = Math.max(initialEnquiries.length, 1);
  const quotePct = Math.round((quoteCount / totalFormQueries) * 100);
  const pkgBookingPct = Math.round((pkgBookingCount / totalFormQueries) * 100);
  const contactMsgPct = Math.round((contactMsgCount / totalFormQueries) * 100);
  const visaQueryPct = Math.round((visaQueryCount / totalFormQueries) * 100);

  return (
    <div className="max-w-[1550px] mx-auto flex flex-col gap-6 font-sans">
      {/* ── Cinematic Hero Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-[#071814] text-white p-6 lg:p-7 border border-[#DB9E30]/25 shadow-2xl">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#DB9E30_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gold rounded-full blur-[100px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-gold/15 border border-[#DB9E30]/35 px-3 py-1 rounded-full text-[10px] font-extrabold text-gold uppercase tracking-widest mb-2 backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-gold" /> Executive Operations Suite
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif text-white m-0 tracking-tight">
              Welcome Back, {session?.name || 'Super Admin'} 👋
            </h1>
            <p className="text-xs text-emerald-100/70 mt-1 mb-0 font-medium">
              King Travel Real-Time Pilgrimage CRM &amp; Dynamic Content Engine
            </p>
          </div>
        </div>
      </div>

      {/* ── Compact 5 Stat Cards Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Enquiries */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary shadow-2xs group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              ↑ {newEnquiriesCount} New
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {animatedValues.enquiries}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Total Enquiries</div>
        </div>

        {/* Card 2: Umrah Packages */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              ↑ Active
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {animatedValues.umrah}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Umrah Packages</div>
        </div>

        {/* Card 3: Hajj Packages */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              ↑ 2027 Open
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {animatedValues.hajj}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Hajj Packages</div>
        </div>

        {/* Card 4: Visa Categories */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-2xs group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              ↑ Authorized
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {animatedValues.visas}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">Visa Solutions</div>
        </div>

        {/* Card 5: CMS Pages */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shadow-2xs group-hover:scale-110 transition-transform">
              <FileCode2 className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
              ↑ Live CMS
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {animatedValues.pages}
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-0.5">CMS Pages</div>
        </div>
      </div>

      {/* ── SEO Center Global Audit Dashboard with Monthly Bar Graph ── */}
      <DashboardSeoCenterSection pages={initialPages} />

      {/* ── Main Dashboard 2-Column Grid (Left: 7/12, Right: 5/12) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Pie Chart Card + Recent Pilgrim Enquiries Table */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* ── 3D Cinematic Animated Pie Chart 1: Offerings & Package Distribution ── */}
          <Cinematic3DPieChart
            title="Offerings Breakdown & Package Distribution"
            subtitle="Ratio of live Umrah, Hajj & Visa services in database"
            totalCount={totalOfferings}
            totalLabel="Total"
            badgeText="Offerings"
            badgeBg="bg-emerald-50 text-emerald-700 border border-emerald-200"
            linkHref="/admin/packages"
            linkLabel="View Details"
            slices={[
              {
                label: 'Umrah Packages',
                count: umrahCount,
                color: '#10B981',
                gradientId: 'grad-umrah-3d',
                gradientColors: ['#34D399', '#059669'],
                bgLight: 'bg-emerald-50/70',
                borderLight: 'border-emerald-200',
                subtext: `${umrahPct}% of CRM offerings`,
              },
              {
                label: 'Hajj Packages',
                count: hajjCount,
                color: '#3B82F6',
                gradientId: 'grad-hajj-3d',
                gradientColors: ['#60A5FA', '#2563EB'],
                bgLight: 'bg-blue-50/70',
                borderLight: 'border-blue-200',
                subtext: `${hajjPct}% of CRM offerings`,
              },
              {
                label: 'Visa Solutions',
                count: visaCount,
                color: '#F59E0B',
                gradientId: 'grad-visa-3d',
                gradientColors: ['#FBBF24', '#D97706'],
                bgLight: 'bg-amber-50/70',
                borderLight: 'border-amber-200',
                subtext: `${visaPct}% of CRM offerings`,
              },
            ]}
          />

          {/* ── 3D Cinematic Animated Pie Chart 2: Forms Queries Breakdown by Database Table ── */}
          <Cinematic3DPieChart
            title="Forms Queries Breakdown by Database Table"
            subtitle="Real-time submission ratio across dedicated form database tables"
            totalCount={initialEnquiries.length}
            totalLabel="Total"
            badgeText="Queries"
            badgeBg="bg-blue-50 text-blue-700 border border-blue-200"
            linkHref="/admin/enquiries"
            linkLabel="Forms Queries"
            slices={[
              {
                label: 'Quote Requests',
                count: quoteCount,
                color: '#3B82F6',
                gradientId: 'grad-[#3B82F6]',
                gradientColors: ['#60A5FA', '#1D4ED8'],
                bgLight: 'bg-blue-50/70',
                borderLight: 'border-blue-200',
                subtext: 'quote_enquiries',
              },
              {
                label: 'Package Bookings',
                count: pkgBookingCount,
                color: '#10B981',
                gradientId: 'grad-[#10B981]',
                gradientColors: ['#34D399', '#047857'],
                bgLight: 'bg-emerald-50/70',
                borderLight: 'border-emerald-200',
                subtext: 'package_booking_enquiries',
              },
              {
                label: 'Contact Messages',
                count: contactMsgCount,
                color: '#8B5CF6',
                gradientId: 'grad-[#8B5CF6]',
                gradientColors: ['#A78BFA', '#6D28D9'],
                bgLight: 'bg-purple-50/70',
                borderLight: 'border-purple-200',
                subtext: 'contact_enquiries',
              },
              {
                label: 'Visa Requests',
                count: visaQueryCount,
                color: '#0EA5E9',
                gradientId: 'grad-[#0EA5E9]',
                gradientColors: ['#38BDF8', '#0369A1'],
                bgLight: 'bg-sky-50/70',
                borderLight: 'border-sky-200',
                subtext: 'visa_enquiries',
              },
            ]}
          />

          {/* Recent Forms Queries Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 m-0">Recent Forms Queries</h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-0">Incoming lead inquiries and booking requests across form tables</p>
              </div>
              <Link
                href="/admin/enquiries"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 no-underline"
              >
                View All →
              </Link>
            </div>

            {initialEnquiries.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">No lead enquiries received yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 pb-3">Enquiry ID</th>
                      <th className="py-2.5 pb-3">Pilgrim Name</th>
                      <th className="py-2.5 pb-3">Phone</th>
                      <th className="py-2.5 pb-3">Status</th>
                      <th className="py-2.5 pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {initialEnquiries.slice(0, 5).map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-mono font-bold text-amber-600 text-[11px]">
                          {e.enquiryNumber}
                        </td>
                        <td className="py-3 font-semibold text-slate-900">{e.fullName}</td>
                        <td className="py-3 text-slate-500 font-mono text-[11px]">{e.phone}</td>
                        <td className="py-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${e.status === 'new'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            href="/admin/enquiries"
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 no-underline"
                          >
                            Review →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity + Recent Pages + Active Offerings */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Recent Activity Card */}
          <div className="bg-[#F2F6F5] rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-700" /> Recent Activity
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 mb-0">
                  Real-time action audit trail
                </p>
              </div>
              <Link
                href="/admin/activity"
                className="bg-primary hover:bg-[#00382B] text-white text-xs font-extrabold px-3 py-1.5 rounded-full no-underline transition-colors flex items-center gap-1 shadow-xs"
              >
                View all →
              </Link>
            </div>

            {/* Legend Bar */}
            <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-2.5 flex items-center gap-1.5 flex-wrap mb-3">
              <span className="text-[11px] font-bold text-slate-700 mr-1">Dot Color Legend:</span>
              {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                <span
                  key={key}
                  style={{
                    backgroundColor: cfg.bg,
                    color: cfg.text,
                    borderColor: cfg.border,
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                >
                  <span
                    style={{ backgroundColor: cfg.dot }}
                    className="w-1.5 h-1.5 rounded-full"
                  />
                  {cfg.label}
                </span>
              ))}
            </div>

            {/* Activity List */}
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
              {initialActivities.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-white/70 rounded-2xl border border-slate-200/60">
                  No activity log entries yet. Administrative actions will appear here in real-time.
                </div>
              ) : (
                initialActivities.slice(0, 6).map((act) => {
                  const cfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.pages;
                  return (
                    <div key={act.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/90 border border-slate-200/60 shadow-2xs">
                      <span
                        style={{ backgroundColor: cfg.dot }}
                        className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                        title={cfg.label}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-slate-900 truncate">{act.action}</span>
                          <span
                            style={{
                              backgroundColor: cfg.bg,
                              color: cfg.text,
                              borderColor: cfg.border,
                            }}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 border"
                          >
                            {cfg.label}
                          </span>
                        </div>
                        {act.details && (
                          <div className="text-[10px] font-sans text-slate-600 mt-0.5 truncate">
                            {act.details}
                          </div>
                        )}
                        <div className="text-[9px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>⏱ {act.timeAgo || 'Recently'}</span>
                          <span
                            style={{
                              backgroundColor: act.badgeBg || '#D1FAE5',
                              color: act.badgeTextColor || '#065F46',
                              borderColor: act.badgeBg ? 'transparent' : '#A7F3D0',
                            }}
                            className="font-bold px-1.5 py-0.2 rounded-xs border text-[9px]"
                          >
                            {act.user}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>


          {/* Recent Pages Card */}
          <div className="bg-[#F2F6F5] rounded-3xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-teal-700" /> Recent Pages
                </div>
                <p className="text-[11px] text-white mt-0.5 mb-0">Last 5 edited website pages</p>
              </div>
              <Link
                href="/admin/pages"
                className="text-xs font-extrabold text-slate-600 hover:text-slate-900 no-underline transition-colors"
              >
                All pages →
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {initialPages.slice(0, 5).map((p) => (
                <div key={p.id} className="p-2.5 bg-white/80 rounded-xl border border-slate-200/50 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-xs text-slate-900 truncate">{p.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">{p.slug}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${p.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                    >
                      • {p.status || 'Published'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Packages Panel */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <div className="text-sm font-extrabold text-slate-900">Active Offerings</div>
              <Link
                href="/admin/packages"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 no-underline"
              >
                Manage
              </Link>
            </div>

            <div className="flex flex-col gap-2">
              {initialPackages.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">No packages yet.</div>
              ) : (
                initialPackages.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                        {p.type} • {p.month}
                      </div>
                    </div>
                    <span className="text-xs font-black text-primary bg-white border border-slate-200 rounded-lg px-2 py-0.5 shrink-0 shadow-2xs">
                      ${p.startingPrice}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
