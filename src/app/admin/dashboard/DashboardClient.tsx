'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardSeoCenterSection from '@/components/admin/DashboardSeoCenterSection';
import RealtimeAnalytics from '@/components/admin/RealtimeAnalytics';
import type { AnalyticsSnapshot } from '@/components/admin/RealtimeAnalytics';
import type { SeoAuditItem } from '@/actions/seoActions';
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
  initialSeoAudit?: SeoAuditItem[];
  initialRealtime: AnalyticsSnapshot | null;
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

/** Category distribution (not a time series), rendered as a gradient-filled curved area. */
function Cinematic3DPieChart({
  title, subtitle, totalCount, totalLabel, linkHref, linkLabel, slices,
}: {
  title: string; subtitle: string; totalCount: number; totalLabel: string;
  badgeText: string; badgeBg: string; linkHref: string; linkLabel: string; slices: SliceData[];
}) {
  const chartId = React.useId().replace(/:/g, '');
  const max = Math.max(1, ...slices.map(slice => slice.count));
  const points = slices.map((slice, index) => ({
    x: 40 + index * 320 / Math.max(1, slices.length - 1),
    y: 142 - 108 * slice.count / max,
  }));
  const line = points.map((point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = points[index - 1];
    const middle = (prev.x + point.x) / 2;
    return ` C ${middle} ${prev.y} ${middle} ${point.y} ${point.x} ${point.y}`;
  }).join('');
  const area = points.length ? `${line} L ${points[points.length - 1].x} 152 L ${points[0].x} 152 Z` : '';
  const total = Math.max(1, slices.reduce((sum, slice) => sum + slice.count, 0));
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,.45)] overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h3 className="text-base font-extrabold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>
        <Link href={linkHref} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100">{linkLabel} ↗</Link>
      </div>
      <div className="mt-5 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/60 p-4 border border-slate-100">
        <div className="flex justify-between items-baseline"><span className="text-xs font-semibold text-slate-500">{totalLabel} · current database snapshot</span><strong className="text-2xl font-black text-slate-900 tabular-nums">{totalCount}</strong></div>
        <svg viewBox="0 0 400 170" className="mt-1 w-full" role="img" aria-label={`${title}: category counts, not chronological changes`}>
          <defs>
            <linearGradient id={`${chartId}-stroke`} x1="0" x2="1" y1="0" y2="0">
              {slices.map((slice,index)=><stop key={slice.label} offset={`${index*100/Math.max(1,slices.length-1)}%`} stopColor={slice.gradientColors[0]} />)}
            </linearGradient>
            <linearGradient id={`${chartId}-fill`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#14b8a6" stopOpacity=".24"/><stop offset="1" stopColor="#93c5fd" stopOpacity=".015"/></linearGradient>
          </defs>
          {[50,100,152].map(y=><line key={y} x1="24" y1={y} x2="376" y2={y} stroke="#cbd5e1" strokeDasharray="3 7" strokeOpacity=".65" />)}
          {points.length > 0 && <path d={area} fill={`url(#${chartId}-fill)`} />}
          {points.length > 0 && <path d={line} fill="none" stroke={`url(#${chartId}-stroke)`} strokeWidth="4" strokeLinecap="round" />}
          {points.map((point,index)=><g key={slices[index].label}>
            <circle cx={point.x} cy={point.y} r="5.5" fill={slices[index].gradientColors[0]} stroke="white" strokeWidth="2.5" />
            <text x={point.x} y={point.y-14} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0f172a">{slices[index].count}</text>
          </g>)}
        </svg>
      </div>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {slices.map(slice => <div key={slice.label} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-600"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor:slice.gradientColors[0]}} />{slice.label}</span>
          <span className="shrink-0 text-sm font-extrabold text-slate-900 tabular-nums">{slice.count} <small className="text-[10px] font-medium text-slate-400">({Math.round(slice.count*100/total)}%)</small></span>
        </div>)}
      </div>
    </section>
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
  initialSeoAudit = [],
  initialRealtime,
}: DashboardClientProps) {
  const [timeRange, setTimeRange] = useState<'Today' | '7 Days' | '30 Days'>('Today');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const router = useRouter();

  // Keep dashboards reasonably current without rendering the entire admin
  // server component tree on every background tab every 15 seconds.
  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') router.refresh();
    };
    const intervalId = window.setInterval(refreshIfVisible, 120000);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [router]);

  // Every chart derives from the same database snapshot as the live KPI row.
  const [liveSnapshot, setLiveSnapshot] = useState<AnalyticsSnapshot | null>(initialRealtime);
  useEffect(() => setLiveSnapshot(initialRealtime), [initialRealtime]);
  const counts = liveSnapshot?.counts;
  const enquiryTypes = liveSnapshot?.enquiryTypes || {};
  const umrahCount = counts?.umrah ?? initialPackages.filter(p => p.type === 'umrah').length;
  const hajjCount = counts?.hajj ?? initialPackages.filter(p => p.type === 'hajj').length;
  const visaCount = counts?.visas ?? initialVisas.length;
  const quoteCount = enquiryTypes.quote_request ?? 0;
  const pkgBookingCount = enquiryTypes.package_enquiry ?? 0;
  const contactMsgCount = enquiryTypes.general_contact ?? 0;
  const visaQueryCount = enquiryTypes.visa_enquiry ?? 0;
  const flightQueryCount = enquiryTypes.flight_enquiry ?? 0;
  const totalOfferings = umrahCount + hajjCount + visaCount;
  const umrahPct = Math.round(umrahCount * 100 / Math.max(1,totalOfferings));
  const hajjPct = Math.round(hajjCount * 100 / Math.max(1,totalOfferings));
  const visaPct = Math.round(visaCount * 100 / Math.max(1,totalOfferings));

  return (
    <div className="max-w-[1600px] mx-auto flex flex-col gap-5 font-sans">
      {/* ── Cinematic Hero Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-[#071814] text-white p-6 lg:p-7 border border-[#DB9E30]/25 shadow-[0_20px_46px_-26px_rgba(0,74,57,.6)]">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#DB9E30_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-red rounded-full blur-[100px] opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-red/15 border border-[#DB9E30]/35 px-3 py-1 rounded-full text-[10px] font-extrabold text-red uppercase tracking-widest mb-2 backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-red" /> Executive Operations Suite
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif text-white m-0 tracking-tight">
              Welcome Back, {session?.name || 'Super Admin'} 👋
            </h1>
            <p className="text-xs text-emerald-100/70 mt-1 mb-0 font-medium">
              British Hajj Travel Real-Time Pilgrimage CRM &amp; Dynamic Content Engine
            </p>
          </div>
        </div>
      </div>

      {initialRealtime ? <RealtimeAnalytics initial={initialRealtime} onSnapshot={setLiveSnapshot} /> :
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">Dashboard database statistics are unavailable. Figures below should not be treated as live totals. Check the application and database logs.</div>}

      {/* ── SEO Center Global Audit Dashboard with Monthly Bar Graph ── */}
      <DashboardSeoCenterSection pages={initialPages} audit={initialSeoAudit} />

      {/* ── Main Dashboard 2-Column Grid (Left: 7/12, Right: 5/12) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Pie Chart Card + Recent Pilgrim Enquiries Table */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* ── 3D Cinematic Animated Pie Chart 1: Offerings & Package Distribution ── */}
          <Cinematic3DPieChart
            title="Offerings Breakdown & Package Distribution"
            subtitle="Current counts across Umrah, Hajj and Visa categories (not a timeline)"
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
            title="Forms Enquiries by Type"
            subtitle="Current breakdown by enquiry type in the unified CRM table"
            totalCount={counts?.enquiries ?? initialEnquiries.length}
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
                subtext: 'quote_request',
              },
              {
                label: 'Package Bookings',
                count: pkgBookingCount,
                color: '#10B981',
                gradientId: 'grad-[#10B981]',
                gradientColors: ['#34D399', '#047857'],
                bgLight: 'bg-emerald-50/70',
                borderLight: 'border-emerald-200',
                subtext: 'package_enquiry',
              },
              {
                label: 'Contact Messages',
                count: contactMsgCount,
                color: '#8B5CF6',
                gradientId: 'grad-[#8B5CF6]',
                gradientColors: ['#A78BFA', '#6D28D9'],
                bgLight: 'bg-purple-50/70',
                borderLight: 'border-purple-200',
                subtext: 'general_contact',
              },
              {
                label: 'Visa Requests',
                count: visaQueryCount,
                color: '#0EA5E9',
                gradientId: 'grad-[#0EA5E9]',
                gradientColors: ['#38BDF8', '#0369A1'],
                bgLight: 'bg-sky-50/70',
                borderLight: 'border-sky-200',
                subtext: 'visa_enquiry',
              },
              {
                label: 'Flight Requests', count: flightQueryCount, color: '#e879f9',
                gradientId: 'grad-flight', gradientColors: ['#d946ef', '#a21caf'],
                bgLight: 'bg-fuchsia-50/70', borderLight: 'border-fuchsia-200', subtext: 'flight_enquiry',
              },
            ]}
          />

          {/* Recent Forms Queries Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 m-0">Recent Forms Queries</h3>
                <p className="text-xs text-slate-400 mt-0.5 mb-0">Latest enquiry records from the unified CRM table</p>
              </div>
              <Link
                href="/admin/enquiries"
                className="text-xs font-bold text-amber-600 hover:text-amber-700 no-underline"
              >
                View All →
              </Link>
            </div>

            {initialEnquiries.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No recent enquiry rows available. Check migration status if the KPI total is non-zero.</div>
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
                className="bg-primary hover:bg-blue-100 hover:text-primary text-white text-xs font-extrabold px-3 py-1.5 rounded-full no-underline transition-colors flex items-center gap-1 shadow-xs"
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
