'use client';
import { useEffect, useMemo, useState } from 'react';
import { WaveAnalyticsChart } from '@/components/admin/WaveAnalyticsChart';
import { ACTIVITY_PERIODS, type ActivityPeriod, type ActivityGroup } from '@/lib/activityAnalytics';
import type { getActivityAnalyticsAction } from '@/actions/activityAnalyticsActions';

export type ActivityAnalytics = Awaited<ReturnType<typeof getActivityAnalyticsAction>>;
const labels: Record<ActivityGroup, string> = { frontend: 'Frontend', backend: 'Backend', system: 'System' };
const descriptions: Record<ActivityGroup, string> = {
  frontend: 'All form submissions (including custom trips) and new 404 paths',
  backend: 'Recorded admin operations and login/logout events',
  system: 'Persisted diagnostics, email delivery and sitemap events',
};

export default function ActivityBreakdownChart({
  data, period, onPeriodChange, busy = false,
}: {
  data: ActivityAnalytics;
  period: ActivityPeriod;
  onPeriodChange: (value: ActivityPeriod) => void;
  busy?: boolean;
}) {
  const [selected, setSelected] = useState<string[]>([
    'frontend.forms', 'frontend.404', 'backend.auth', 'backend.pages', 'backend.packages', 'backend.enquiries',
  ]);
  const [group, setGroup] = useState<'all' | ActivityGroup>('all');
  const visible = useMemo(() => data.categories.filter(c => selected.includes(c.key)), [data.categories, selected]);
  const totals = visible.map(c => ({ name: c.label, values: c.values, colors: [c.color, c.color, c.color] as [string,string,string] }));
  const toggle = (key: string) => setSelected(old => old.includes(key) ? (old.length > 1 ? old.filter(k => k !== key) : old) : [...old, key]);
  const grouped = data.categories.filter(c => group === 'all' || c.group === group);
  const dateLabels = data.days.map(d => {
    const dt = new Date(`${d}T00:00:00Z`);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' });
  });
  useEffect(() => {
    // Do not silently select additional lines after an asynchronous refresh.
    setSelected(current => current.filter(key => data.categories.some(c => c.key === key)));
  }, [data.categories]);
  return <section className="rounded-[26px] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm min-w-0">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="m-0 font-serif text-xl font-bold text-[#020e43]">Frontend &amp; Backend Activity by Section</h2>
        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
          Each line represents one recorded section. The period ends yesterday in Asia/Karachi, excluding today's incomplete data.
        </p>
      </div>
      <label className="flex items-center gap-2 text-xs font-bold text-[#020e43]">
        Report period
        <select value={period} disabled={busy} onChange={e => onPeriodChange(e.target.value as ActivityPeriod)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-[#020e43] disabled:opacity-50">
          {ACTIVITY_PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </label>
    </div>
    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
      {(['frontend','backend','system'] as ActivityGroup[]).map(source =>
        <div key={source} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{labels[source]}</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#020e43]">{data.totals[source].toLocaleString()}</p>
          <p className="mt-1 text-[11px] leading-4 text-slate-500">{descriptions[source]}</p>
        </div>
      )}
    </div>
    <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <summary className="cursor-pointer text-xs font-bold text-[#020e43]">Choose graph lines ({selected.length} of {data.categories.length} selected)</summary>
      <div className="mt-3 flex flex-wrap gap-2">
        {(['all','frontend','backend','system'] as const).map(value =>
          <button key={value} type="button" onClick={() => setGroup(value)}
            className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold ${group === value ? 'border-[#020e43] bg-[#020e43] text-white' : 'border-slate-200 bg-white text-[#020e43]'}`}>
            {value === 'all' ? 'All categories' : labels[value]}
          </button>
        )}
        <button type="button" className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-[#b50007]"
          onClick={() => setSelected(data.categories.filter(c => group === 'all' || c.group === group).map(c => c.key))}>
          Show {group === 'all' ? 'all' : labels[group]} lines
        </button>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {grouped.map(category => <label key={category.key} className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <input type="checkbox" checked={selected.includes(category.key)} onChange={() => toggle(category.key)} className="mt-0.5 accent-[#020e43]" />
          <span className="min-w-0 flex-1 text-xs text-[#020e43]">
            <span className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 shrink-0 rounded-full" style={{backgroundColor:category.color}} />{category.label}</span>
            <span className="mt-0.5 block text-[10px] text-slate-500">{category.description}</span>
          </span>
          <span className="font-bold tabular-nums text-xs text-[#020e43]">{category.total.toLocaleString()}</span>
        </label>)}
      </div>
    </details>
    {busy && <p className="mt-3 text-xs font-semibold text-[#020e43]" role="status">Loading the selected reporting period...</p>}
    <div className="mt-4 min-w-0">
      <WaveAnalyticsChart
        title="Section activity over time"
        description={`${data.first} to ${data.last} (Asia/Karachi). Counts are stored events, not unique visitors. Select series above to compare.`}
        labels={dateLabels} series={totals}
        emptyText="No recorded activity for the selected sections and reporting period"
      />
    </div>
    <p className="mt-3 text-[11px] leading-5 text-slate-500">Frontend page views, package clicks, visa interactions and guide views are not yet instrumented. Customized enquiries already appear within All Forms Enquiries; no duplicate series is added. A missing category is not a measured zero. New 404 paths count unique paths first seen, not every repeat request.</p>
  </section>;
}
