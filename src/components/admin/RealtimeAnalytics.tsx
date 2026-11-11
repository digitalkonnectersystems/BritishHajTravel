'use client';

import { useCallback, useEffect, useState } from 'react';
import { getDashboardRealtimeAction } from '@/actions/dashboardRealtimeActions';

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
    const timer = window.setInterval(() => { void refresh(); }, 30000);
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
  return <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,.45)]">
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="m-0 text-lg font-extrabold text-slate-900">Project Visual Analytics</h2><p className="mt-1 text-xs text-gray-500">Live CRM database totals. Detailed frontend/backend activity and period selection appear in the section below. Refreshes every 30 seconds while visible.</p></div>
      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-gray-500">Synced {new Date(snapshot.refreshedAt).toLocaleTimeString('en-GB')}</span>
    </div>
    {error && <p role="status" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">{error}</p>}
    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
      {items.map(([label, value], i) => <div key={label} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,.55)]">
        <span className="absolute inset-x-0 top-0 h-[3px]" style={{ backgroundColor: ['#0d9488', '#3b82f6', '#ec4899'][i % 3] }} />
        <p className="text-[10px] font-bold text-gray-500">{label}</p><p className="mt-1 text-2xl font-black tabular-nums text-slate-900">{value}</p>
      </div>)}
    </div>
  </section>;
}
