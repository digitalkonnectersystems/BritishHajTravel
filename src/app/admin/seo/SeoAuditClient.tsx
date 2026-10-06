'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Search, Sliders, XCircle } from 'lucide-react';
import SeoCenterModal from '@/components/admin/SeoCenterModal';
import { getSeoAuditReportAction, type SeoAuditItem } from '@/actions/seoActions';

export default function SeoAuditClient({ initialReport }: { initialReport: SeoAuditItem[] }) {
  const [report, setReport] = useState(initialReport || []);
  const [query, setQuery] = useState('');
  const [entityType, setEntityType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<SeoAuditItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      setReport(await getSeoAuditReportAction());
    } finally {
      setRefreshing(false);
    }
  };

  const duplicateCount = report.filter((item) => item.issues.some((issue) => issue.code.startsWith('duplicate_'))).length;
  const failingCount = report.filter((item) => item.issues.some((issue) => issue.severity === 'error')).length;
  const passedCount = report.filter((item) => !item.issues.some((issue) => issue.severity === 'error')).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return report.filter((item) => {
      const matchesQuery = !q || [item.title, item.route, item.metadata.title, item.metadata.description]
        .some((value) => String(value || '').toLowerCase().includes(q));
      const matchesEntity = entityType === 'all' || item.entityType === entityType;
      const hasError = item.issues.some((issue) => issue.severity === 'error');
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'issues' ? hasError : !hasError);
      return matchesQuery && matchesEntity && matchesStatus;
    });
  }, [report, query, entityType, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="m-0 text-2xl font-extrabold text-slate-900">SEO Center</h1>
          <p className="mt-1 text-xs text-slate-500">
            Audits the same Next.js Metadata API output used by public CMS pages, packages, destinations and blogs, including canonical, robots, Open Graph and Twitter/X tags. Fixes are stored on the selected entity without changing public routes or page structure.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 hover:border-primary hover:text-primary disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Run SEO Audit
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="URLs audited" value={report.length} icon={<Search className="h-4 w-4" />} />
        <SummaryCard label="No critical errors" value={passedCount} icon={<CheckCircle2 className="h-4 w-4" />} />
        <SummaryCard label="Needs attention" value={failingCount} icon={<AlertTriangle className="h-4 w-4" />} />
        <SummaryCard label="Duplicate metadata" value={duplicateCount} icon={<XCircle className="h-4 w-4" />} />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search page, route, title or description..."
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
          />
        </div>
        <select value={entityType} onChange={(event) => setEntityType(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
          <option value="all">All content</option>
          <option value="page">CMS pages</option>
          <option value="package">Packages</option>
          <option value="blog">Blogs</option>
          <option value="destination">Destinations</option>
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
          <option value="all">All audit states</option>
          <option value="issues">Critical issues</option>
          <option value="passed">No critical errors</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Page / Entity</th>
                <th className="px-4 py-3">Metadata title</th>
                <th className="px-4 py-3">Canonical</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3">Issues</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.key} className="align-top hover:bg-slate-50/70">
                  <td className="px-4 py-4">
                    <div className="font-extrabold text-slate-900">{item.title}</div>
                    <div className="mt-1 font-mono text-[10px] text-slate-500">{item.route}</div>
                    <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-600">{item.entityType}</span>
                  </td>
                  <td className="max-w-[280px] px-4 py-4">
                    <div className="font-bold text-slate-800">{item.metadata.title || 'Missing'}</div>
                    <div className="mt-1 text-[10px] text-slate-400">{item.metadata.title.length} characters</div>
                  </td>
                  <td className="max-w-[250px] break-all px-4 py-4 font-mono text-[10px] text-slate-600">{item.metadata.canonical || 'Missing'}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex min-w-12 justify-center rounded-full px-2 py-1 font-black ${item.score >= 85 ? 'bg-emerald-50 text-emerald-700' : item.score >= 65 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                      {item.score}
                    </span>
                  </td>
                  <td className="max-w-[340px] px-4 py-4">
                    {item.issues.length === 0 ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> Passed</span>
                    ) : (
                      <div className="space-y-1.5">
                        {item.issues.slice(0, 4).map((issue) => (
                          <div key={`${item.key}-${issue.code}`} className={`rounded-lg px-2 py-1 text-[10px] ${issue.severity === 'error' ? 'bg-red-50 text-red-700' : issue.severity === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                            {issue.message}
                          </div>
                        ))}
                        {item.issues.length > 4 && <div className="text-[10px] font-bold text-slate-400">+{item.issues.length - 4} more</div>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button type="button" onClick={() => setSelected(item)} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-extrabold text-primary hover:bg-primary hover:text-white">
                      <Sliders className="h-3.5 w-3.5" /> Fix SEO
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No SEO records match these filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SeoCenterModal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        pageData={selected ? {
          id: selected.entityId,
          entityType: selected.entityType,
          title: selected.title,
          slug: selected.route,
          metaTitle: selected.seoData?.metaTitle,
          metaDescription: selected.seoData?.metaDescription,
          seoData: selected.seoData,
        } : null}
        onSaveSuccess={async () => {
          await refresh();
          setSelected(null);
        }}
      />
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-bold">{label}</span>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}
