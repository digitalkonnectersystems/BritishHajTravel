'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  listRedirectsAction, saveRedirectAction, disableRedirectAction,
  enableRedirectAction, deleteRedirectAction, updateNotFoundHitStatusAction,
  deleteNotFoundHitAction,
} from '@/actions/redirectActions';
import { WaveAnalyticsChart, chartDays, dailySeries } from '@/components/admin/WaveAnalyticsChart';

type RedirectSnapshot = Awaited<ReturnType<typeof listRedirectsAction>>;
type Rule = RedirectSnapshot['rules'][number];
type Hit = RedirectSnapshot['hits'][number];

const REDIRECT_CODES = [
  { code: 301, label: '301 — Moved Permanently (Permanent Redirect)' },
  { code: 308, label: '308 — Permanent Redirect (Method Preserved)' },
  { code: 302, label: '302 — Found (Temporary Redirect)' },
  { code: 307, label: '307 — Temporary Redirect (Method Preserved)' },
] as const;

function getCodeBadge(code: number) {
  switch (code) {
    case 301:
      return {
        label: '301 Permanent',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 308:
      return {
        label: '308 Permanent',
        badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    case 302:
      return {
        label: '302 Temporary',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      };
    case 307:
      return {
        label: '307 Temporary',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    default:
      return {
        label: `${code}`,
        badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
      };
  }
}

function formatHitDate(value: Date | string | null | undefined): string {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-GB') : '—';
}

export default function RedirectsClient({ initialRules, initialHits }: { initialRules: Rule[]; initialHits: Hit[] }) {
  const [rules, setRules] = useState(initialRules);
  const [hits, setHits] = useState(initialHits);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [httpCode, setCode] = useState<number>(301);
  const [editing, setEditing] = useState<number | undefined>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [codeFilter, setCodeFilter] = useState<string>('all');
  const [lastSynced, setLastSynced] = useState<string>('');

  const sourceInputRef = useRef<HTMLInputElement>(null);
  const [isSourceHighlighted, setIsSourceHighlighted] = useState(false);

  const scrollToSourceInput = useCallback(() => {
    if (sourceInputRef.current) {
      sourceInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      sourceInputRef.current.focus({ preventScroll: true });
      setIsSourceHighlighted(true);
      setTimeout(() => setIsSourceHighlighted(false), 2000);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await listRedirectsAction();
      setRules(data.rules);
      setHits(data.hits);
      setLastSynced(new Date().toLocaleTimeString());
    } catch {
      setError('Could not refresh redirect data. Check the database and try again.');
    }
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !busy) void refresh();
    }, 30000);
    return () => window.clearInterval(id);
  }, [refresh, busy]);

  const days = useMemo(() => chartDays(14), []);
  const topPaths = useMemo(() => [...hits].sort((a, b) => Number(b.hits || 0) - Number(a.hits || 0)).slice(0, 8), [hits]);
  const lastSeenPaths = dailySeries(hits, days.keys, h => h.lastSeen);
  const createdRules = dailySeries(rules, days.keys, r => r.createdAt);

  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesCode = codeFilter === 'all' || String(r.httpCode) === codeFilter;
      const matchesSearch = `${r.sourcePath} ${r.destinationPath}`.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesCode && matchesSearch;
    });
  }, [rules, statusFilter, codeFilter, search]);

  const filteredHits = useMemo(() => {
    return hits.filter(h => `${h.requestPath}`.toLowerCase().includes(search.toLowerCase()));
  }, [hits, search]);

  async function perform(action: () => Promise<{ success: boolean; error?: string }>) {
    setBusy(true);
    setError('');
    try {
      const result = await action();
      if (!result.success) {
        setError(result.error || 'Action failed.');
        return false;
      }
      await refresh();
      return true;
    } catch {
      setError('The request failed. Please check your connection and try again.');
      return false;
    } finally {
      setBusy(false);
    }
  }

  const resetForm = useCallback(() => {
    setEditing(undefined);
    setSource('');
    setDestination('');
    setCode(301);
  }, []);

  return (
    <div className="space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Redirects &amp; 404 Center</h1>
          <p className="text-sm text-gray-500">Database-backed redirect rules and unmatched CMS paths. Changes update without reloading.</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void refresh()}
          className="rounded-xl bg-[#071644] px-4 py-2 text-xs font-bold text-white transition-opacity disabled:opacity-60"
        >
          Refresh data
        </button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      {lastSynced && <p aria-live="polite" className="text-xs text-gray-500">Last synced at {lastSynced} (auto-refresh every 30 seconds while visible)</p>}

      <form
        onSubmit={async e => {
          e.preventDefault();
          if (await perform(() => saveRedirectAction({ id: editing, sourcePath: source, destinationPath: destination, httpCode }))) {
            resetForm();
          }
        }}
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-4"
      >
        <label className="text-sm font-semibold text-slate-800">
          Broken URL
          <input
            ref={sourceInputRef}
            required
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="/old-page"
            className={`mt-2 w-full rounded-lg border p-2 text-sm transition-all duration-300 outline-none ${
              isSourceHighlighted
                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/25'
                : 'border-slate-200 focus:border-[#071644] focus:ring-2 focus:ring-[#071644]/10'
            }`}
          />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          Redirect to
          <input
            required
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder="/new-page"
            className="mt-2 w-full rounded-lg border border-slate-200 p-2 text-sm outline-none transition-all focus:border-[#071644] focus:ring-2 focus:ring-[#071644]/10"
          />
        </label>
        <label className="text-sm font-semibold text-slate-800">
          HTTP Code
          <select
            id="http-code-select"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm font-medium text-slate-800 outline-none cursor-pointer transition-all focus:border-[#071644] focus:ring-2 focus:ring-[#071644]/10"
            value={httpCode}
            onChange={e => setCode(Number(e.target.value))}
          >
            {REDIRECT_CODES.map(c => (
              <option value={c.code} key={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            disabled={busy}
            type="submit"
            className="flex-1 rounded-lg bg-[#071644] px-3 py-2 text-sm font-bold text-white transition-opacity disabled:opacity-60"
          >
            {busy ? 'Saving…' : editing ? 'Update redirect' : 'Add redirect'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-3">
        {([
          ['404 unique paths', hits.length],
          ['Unresolved hits', hits.filter(h => h.status === 'unresolved').reduce((a, h) => a + Number(h.hits || 0), 0)],
          ['Active redirects', rules.filter(r => r.status === 'active').length],
        ] as const).map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-[#071644]">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <WaveAnalyticsChart
          compact
          title="404 paths and redirect rule activity"
          description="404 series groups unique paths by last observed date; redirects show rules created daily, not hit-by-hit traffic."
          labels={days.labels}
          series={[
            { name: '404 URLs last seen', values: lastSeenPaths },
            { name: 'Redirects created', values: createdRules },
          ]}
        />
        <WaveAnalyticsChart
          compact
          title="Most requested missing URLs"
          description="Ranked by total recorded 404 hits, not chronological."
          mode="categories"
          labels={topPaths.map((_, i) => `#${i + 1}`)}
          series={[{ name: 'Total recorded 404 hits', values: topPaths.map(h => Number(h.hits || 0)) }]}
          emptyText="No recorded 404 paths"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          aria-label="Search redirects and 404 paths"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search paths…"
          className="min-w-48 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#071644] focus:ring-2 focus:ring-[#071644]/10"
        />
        <select
          aria-label="Filter redirect status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-[#071644]"
        >
          <option value="all">All redirect statuses</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
        <select
          aria-label="Filter HTTP code"
          value={codeFilter}
          onChange={e => setCodeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none cursor-pointer focus:border-[#071644]"
        >
          <option value="all">All HTTP codes</option>
          <option value="301">301 (Permanent Redirect)</option>
          <option value="308">308 (Permanent - Method Preserved)</option>
          <option value="302">302 (Temporary Redirect)</option>
          <option value="307">307 (Temporary - Method Preserved)</option>
        </select>
      </div>

      <h2 className="text-lg font-bold text-slate-900">Redirect rules</h2>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold text-slate-600 uppercase tracking-wider">
              {['Source', 'Destination', 'Code', 'Status', 'Actions'].map(x => (
                <th key={x} className="p-3">{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRules.map(r => {
              const badge = getCodeBadge(r.httpCode);
              return (
                <tr className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors" key={r.id}>
                  <td className="p-3 font-mono text-xs text-slate-800">{r.sourcePath}</td>
                  <td className="p-3 font-mono text-xs text-slate-800">{r.destinationPath}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${badge.badgeClass}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                      r.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      disabled={busy}
                      type="button"
                      title="Edit redirect"
                      aria-label="Edit redirect"
                      className="cursor-pointer inline-flex items-center justify-center p-1.5 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      onClick={() => {
                        setSource(r.sourcePath);
                        setDestination(r.destinationPath);
                        setCode(r.httpCode);
                        setEditing(r.id);
                        scrollToSourceInput();
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {r.status === 'active' ? (
                      <button
                        type="button"
                        disabled={busy}
                        className="ml-3 text-amber-800 underline hover:text-amber-900 transition-colors cursor-pointer"
                        onClick={() => void perform(() => disableRedirectAction(r.id))}
                      >
                        Disable
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        className="ml-3 text-emerald-800 underline hover:text-emerald-900 transition-colors cursor-pointer"
                        onClick={() => void perform(() => enableRedirectAction(r.id))}
                      >
                        Enable
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busy}
                      title="Delete redirect"
                      aria-label="Delete redirect"
                      className="ml-2 inline-flex items-center justify-center p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                      onClick={() => {
                        if (window.confirm(`Archive redirect ${r.sourcePath}?`)) {
                          void perform(() => deleteRedirectAction(r.id));
                        }
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredRules.length === 0 && <p className="p-4 text-sm text-gray-500">No matching redirect rules.</p>}
      </div>

      <h2 className="text-lg font-bold text-slate-900">Unmatched CMS paths</h2>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-bold text-slate-600 uppercase tracking-wider">
              {['URL', 'Hits', 'Status', 'Last seen', 'Actions'].map(x => (
                <th key={x} className="p-3">{x}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredHits.map(h => (
              <tr key={h.id} className="border-t border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="p-3 font-mono text-xs text-slate-800">{h.requestPath}</td>
                <td className="p-3 font-semibold text-slate-700">{h.hits}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${
                    h.status === 'resolved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {h.status}
                  </span>
                </td>
                <td className="p-3 whitespace-nowrap text-xs text-slate-500">{formatHitDate(h.lastSeen)}</td>
                <td className="p-3 whitespace-nowrap">
                  <button
                    type="button"
                    className="text-blue-800 underline hover:text-blue-900 font-medium transition-colors cursor-pointer"
                    onClick={() => {
                      setSource(h.requestPath);
                      setDestination('');
                      setCode(301);
                      setEditing(undefined);
                      scrollToSourceInput();
                    }}
                  >
                    Create redirect
                  </button>
                  <button
                    disabled={busy}
                    type="button"
                    className="ml-3 text-emerald-800 underline hover:text-emerald-900 transition-colors cursor-pointer"
                    onClick={() => void perform(() => updateNotFoundHitStatusAction(h.id, h.status === 'resolved' ? 'unresolved' : 'resolved'))}
                  >
                    {h.status === 'resolved' ? 'Reopen' : 'Resolve'}
                  </button>
                  <button
                    disabled={busy}
                    type="button"
                    title="Delete 404 record"
                    aria-label="Delete 404 record"
                    className="ml-2 inline-flex items-center justify-center p-1.5 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    onClick={() => {
                      if (window.confirm(`Archive 404 record ${h.requestPath}?`)) {
                        void perform(() => deleteNotFoundHitAction(h.id));
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredHits.length === 0 && <p className="p-4 text-sm text-gray-500">No matching 404 paths.</p>}
      </div>
    </div>
  );
}
