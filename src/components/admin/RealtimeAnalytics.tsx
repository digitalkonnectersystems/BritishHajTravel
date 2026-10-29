'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDashboardRealtimeAction } from '@/actions/dashboardRealtimeActions';
import { WaveAnalyticsChart } from '@/components/admin/WaveAnalyticsChart';

export type AnalyticsSnapshot = Awaited<ReturnType<typeof getDashboardRealtimeAction>>;

export default function RealtimeAnalytics({ initial, onSnapshot }: { initial: AnalyticsSnapshot; onSnapshot?: (data: AnalyticsSnapshot) => void }) {
  const [snapshot, setSnapshot] = useState(initial);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    if (document.visibilityState !== 'visible') return;
    try {
      const result = await getDashboardRealtimeAction();
      setSnapshot(result);
      onSnapshot?.(result);
      setError('');
    } catch {
      setError('Refresh unavailable. Showing the last successfully fetched database counts.');
    }
  }, [onSnapshot]);
  useEffect(() => {
    const timer = window.setInterval(() => { void refresh(); }, 60000);
    return () => window.clearInterval(timer);
  }, [refresh]);
  useEffect(() => setSnapshot(initial), [initial]);

  const items = [
    ['Enquiries', snapshot.counts.enquiries],
    ['New enquiries', snapshot.counts.newEnquiries],
    ['Umrah packages', snapshot.counts.umrah],
    ['Hajj packages', snapshot.counts.hajj],
    ['Visa solutions', snapshot.counts.visas],
    ['CMS pages', snapshot.counts.pages],
    ['Published blogs', snapshot.counts.blogs],
    ['404 paths', snapshot.counts.brokenPaths],
    ['Active redirects', snapshot.counts.redirects],
  ] as const;
  const average = snapshot.enquiryTrend.map((_, i, entries) => {
    const window = entries.slice(Math.max(0, i - 2), i + 1);
    return Number((window.reduce((sum, v) => sum + v, 0) / window.length).toFixed(2));
  });
  const labels = snapshot.days.map(date => new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }));
  return <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,.45)]">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="m-0 text-lg font-extrabold text-slate-900">Project Visual Analytics</h2><p className="mt-1 text-xs text-slate-500">Live database totals and actual daily counts over the last 14 days. Refreshes every 60 seconds while visible.</p></div>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-500">Synced {new Date(snapshot.refreshedAt).toLocaleTimeString('en-GB')}</span>
    </div>
    {error && <p role="status" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{error}</p>}
    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
      {items.map(([label, value], i) => <div key={label} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-sky-50 p-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,.55)]">
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ background: ['linear-gradient(90deg,#0d9488,#38bdf8)', 'linear-gradient(90deg,#3b82f6,#8b5cf6)', 'linear-gradient(90deg,#ec4899,#f59e0b)'][i % 3] }} />
        <p className="text-[10px] font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black tabular-nums text-slate-900">{value}</p>
      </div>)}
    </div>
    <WaveAnalyticsChart
      title="Enquiries & administrative activity"
      description="Daily counts share one scale; the third line is the actual three-day rolling average of enquiries."
      labels={labels}
      series={[
        { name: 'Enquiries', values: snapshot.enquiryTrend },
        { name: 'Admin activities', values: snapshot.activityTrend },
        { name: 'Enquiries · 3-day average', values: average },
      ]}
    />
  </section>;
}
