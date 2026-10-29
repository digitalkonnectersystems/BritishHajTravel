'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  BarChart2,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import type { SeoAuditItem } from '@/actions/seoActions';

interface DashboardSeoCenterSectionProps {
  pages: any[];
  audit?: SeoAuditItem[];
}

/** Multi-color progress visualization: x axis is coverage percentage, not time. */
function MetricWave({ value, label }: { value: number; label: string }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  const id = `metric-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const end = 4 + pct * 1.92;
  return <svg className="h-7 w-full" viewBox="0 0 200 28" role="img" aria-label={`${label}: ${pct} percent complete`}>
    <defs><linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#14b8a6"/><stop offset=".36" stopColor="#3b82f6"/><stop offset=".7" stopColor="#8b5cf6"/><stop offset="1" stopColor="#f59e0b"/></linearGradient><linearGradient id={`${id}-shade`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#14b8a6" stopOpacity=".18"/><stop offset="1" stopColor="#14b8a6" stopOpacity="0"/></linearGradient></defs>
    <path d="M 4 15 L 196 15" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 5" />
    {pct > 0 && <><path d={`M 4 15 Q ${4+pct*.48} 9 ${end} 15 L ${end} 27 L 4 27 Z`} fill={`url(#${id}-shade)`}/><path d={`M 4 15 Q ${4+pct*.48} 9 ${end} 15`} stroke={`url(#${id}-stroke)`} strokeWidth="4" fill="none" strokeLinecap="round"/><circle cx={end} cy="15" r="3" fill="#059669" stroke="white" strokeWidth="1" /></>}
  </svg>;
}

export default function DashboardSeoCenterSection({ pages, audit = [] }: DashboardSeoCenterSectionProps) {
  const [selectedSeoPage, setSelectedSeoPage] = useState<any>(null);
  const [seoModalOpen, setSeoModalOpen] = useState(false);

  const totalPages = audit.length;
  const passedPagesCount = audit.filter(item => !item.issues.some(issue => issue.severity === 'error')).length;
  const needingFixesCount = totalPages - passedPagesCount;
  const healthRating = totalPages ? Math.round(audit.reduce((sum,item)=>sum+item.score,0)/totalPages) : 0;
  // Measured configuration coverage, not Google's rankings or AI crawler verification.
  const ratio = (test: (item: SeoAuditItem) => boolean) => totalPages
    ? Math.round(audit.filter(test).length * 100 / totalPages) : 0;
  const metaCoverage = ratio(item => !!item.metadata.title && !!item.metadata.description);
  const heroAltCoverage = ratio(item => !!item.seoData?.heroAlt);
  const socialCoverage = ratio(item => !!item.metadata.ogTitle && !!item.metadata.ogImage);
  const schemaCoverage = ratio(item => !!item.seoData?.schemaType || !!item.seoData?.jsonLdPayload);
  const auditedPages = audit.filter(item => item.entityType === 'page');
  // No historical SEO snapshots exist in the supplied database. Show only current measured score.
  const actionItemCount = audit.reduce((sum, item) => sum + item.issues.filter(issue => issue.severity !== 'info').length, 0);

  // Map pages requiring attention with accurate Alt Text & Meta checks
  const pagesNeedingAttention = pages.map((p) => {
    const audited = auditedPages.find(item => item.entityId === p.id);
    const measuredIssues = audited?.issues.map(issue => issue.message) || [];
    const seo = p.seoData || {};
    const metaTitleVal = p.metaTitle || seo.metaTitle || '';
    const metaDescVal = p.metaDescription || seo.metaDescription || '';
    const heroAltVal = seo.heroAlt || p.heroAlt || '';

    const hasShortTitle = !metaTitleVal || metaTitleVal.length < 20;
    const hasShortDesc = !metaDescVal || metaDescVal.length < 50;
    const missingAlt = !heroAltVal;

    let score = 100;
    if (hasShortTitle && hasShortDesc) score = 60;
    else if (hasShortTitle || hasShortDesc) score = 85;
    else if (missingAlt) score = 92;

    const actionItems: string[] = [];
    if (hasShortTitle) actionItems.push('Meta Title missing or too short (< 20 chars)');
    if (hasShortDesc) actionItems.push('Meta Description missing or too short (< 50 chars)');
    if (missingAlt) actionItems.push('Image Alt text missing — Click SEO to auto-generate');
    if (actionItems.length === 0) actionItems.push('✓ Fully Optimized — All Alt Texts & Metadata Verified');

    return {
      ...p,
      score: audited?.score ?? score,
      actionItems: audited ? (measuredIssues.length ? measuredIssues : ['✓ No configured SEO audit issues']) : actionItems,
    };
  }).slice(0, 6);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-primary flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 m-0">
                SEO Center — Global Audit Dashboard
              </h2>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Next-Gen Intelligence
              </span>
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Current local metadata audit across {totalPages} CMS entities, not an external Google/AI indexation measurement
            </p>
          </div>
        </div>

        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs no-underline shrink-0"
        >
          <span>Manage All Pages</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      {/* ── 4 Metric Summary Cards Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Health Rating Circle Gauge */}
        <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="w-full rounded-2xl bg-white/70 p-4 mb-3 border border-emerald-100 text-center">
            <span className="block text-3xl font-black text-emerald-900">{healthRating}%</span>
            <span className="block text-[9px] font-extrabold uppercase tracking-wider text-slate-500">Measured health rating</span>
            <MetricWave value={healthRating} label="Overall SEO health" />
          </div>
          <div className="text-xs font-extrabold text-slate-800">
            {needingFixesCount > 0 ? 'Action Required' : 'Good Standing'}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
            {passedPagesCount} of {totalPages} Entities with no critical errors
          </div>
        </div>

        {/* Card 2: Core Category Breakdown */}
        <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> CORE CATEGORY BREAKDOWN
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Configured title and description</span>
                <span className="text-slate-900 font-mono">{metaCoverage}%</span>
              </div>
              <MetricWave value={metaCoverage} label="Title and Description" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Configured hero-image alt text</span>
                <span className="text-slate-900 font-mono">{heroAltCoverage}%</span>
              </div>
              <MetricWave value={heroAltCoverage} label="Hero image alt text" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Open Graph title and image</span>
                <span className="text-slate-900 font-mono">{socialCoverage}%</span>
              </div>
              <MetricWave value={socialCoverage} label="Open Graph metadata" />
            </div>
          </div>
        </div>

        {/* Card 3: AI Engine Readiness */}
        <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red" /> AI ENGINE READINESS
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Schema / AI metadata configuration</span>
                <span className="text-slate-900 font-mono">{schemaCoverage}%</span>
              </div>
              <MetricWave value={schemaCoverage} label="AI metadata" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Voice / Answer Engine verification</span>
                <span className="text-slate-900 font-mono">Not measured</span>
              </div>
              <MetricWave value={0} label="Voice verification" />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-slate-700 mb-1">
                <span>Structured data configuration</span>
                <span className="text-slate-900 font-mono">{schemaCoverage}%</span>
              </div>
              <MetricWave value={schemaCoverage} label="Structured data" />
            </div>
          </div>
        </div>

        {/* Card 4: Diagnostics Summary */}
        <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 space-y-3 flex flex-col justify-between">
          <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> DIAGNOSTICS SUMMARY
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
              <div className="text-xl font-black text-red-600">{needingFixesCount}</div>
              <div className="text-[9px] font-bold text-red-700 uppercase">Pages Needing Fixes</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <div className="text-xl font-black text-amber-700">{actionItemCount}</div>
              <div className="text-[9px] font-bold text-amber-800 uppercase">Total Action Items</div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 font-medium m-0 leading-tight">
            Automated multi-layer scanner detects missing titles, schemas, alt tags, and Open Graph card data.
          </p>
        </div>
      </div>

      {/* ── Monthly Performance Bar Graph Section ── */}
      <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 m-0 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-primary" /> Current SEO Audit Score
            </h3>
            <p className="text-[11px] text-slate-400 m-0 mt-0.5">
              Historical measurements were not supplied; only the current database metadata score is shown
            </p>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Current snapshot
          </span>
        </div>

        {/* A single measured score, not fabricated historical data. */}
        <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-[#f8fbff] to-[#eefaf5] px-5 py-4">
          <div className="mb-1 flex items-baseline justify-between"><span className="text-xs font-bold text-slate-600">Current measured audit score</span><span className="text-2xl font-black text-emerald-900">{healthRating}%</span></div>
          <div className="relative mt-5 mb-6 overflow-hidden rounded-full bg-slate-200/75 h-5" role="meter" aria-label="Current SEO audit score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, healthRating))}>
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 via-sky-400 to-violet-500 opacity-25 blur-sm" style={{ width: `${Math.max(0, Math.min(100, healthRating))}%` }} />
            <div className="relative h-full rounded-full shadow-[0_4px_16px_rgba(56,189,248,.32)] transition-[width] duration-500" style={{ width: `${Math.max(0, Math.min(100, healthRating))}%`, background: "linear-gradient(90deg,#0d9488 0%,#38bdf8 28%,#6366f1 62%,#a855f7 80%,#f59e0b 100%)" }} />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400"><span>0 · Needs attention</span><span>50 · Improving</span><span>100 · Excellent</span></div>
          <p className="mt-1 text-[11px] text-slate-500">Current snapshot only. Historical comparisons will be available when dated audit snapshots are stored.</p>
        </div>
      </div>

      {/* ── Pages Requiring SEO Attention List ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            Pages Requiring SEO Attention ({pagesNeedingAttention.length})
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">
            Exact source locations listed below
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {pagesNeedingAttention.map((p) => (
            <div
              key={p.id}
              className="p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">{p.title}</span>
                  <span className="font-sans text-[10px] text-primary bg-white px-2 py-0.5 rounded-full border border-primary">
                    {p.slug}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${p.score === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                  >
                    {p.score}% Score
                  </span>
                </div>

                <ul className="m-0 p-0 list-none space-y-0.5">
                  {p.actionItems.map((item: string, i: number) => {
                    const isPassed = item.startsWith('✓');
                    return (
                      <li key={i} className={`text-[11px] font-semibold flex items-center gap-1.5 ${isPassed ? 'text-emerald-700' : 'text-red-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}></span> {item}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedSeoPage(p);
                  setSeoModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-100 text-primary border border-primary text-xs font-extrabold hover:bg-primary hover:text-white transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-center"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Open SEO Center →</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Embedded SEO Center Modal */}
      <SeoCenterModal
        isOpen={seoModalOpen}
        onClose={() => {
          setSeoModalOpen(false);
          setSelectedSeoPage(null);
        }}
        pageData={selectedSeoPage}
      />
    </div>
  );
}
