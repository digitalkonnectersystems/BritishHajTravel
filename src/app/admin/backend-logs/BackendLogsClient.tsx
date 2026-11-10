'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, AlertTriangle, Archive, CheckCircle2, ChevronLeft, ChevronRight,
  Clock3, Database, Eye, FileText, Filter, Info, RefreshCw, Search,
  Server, TerminalSquare, X,
} from 'lucide-react';
import {
  listBackendLogsAction,
  testBackendLoggerAction,
  updateBackendLogStatusAction,
  deleteBackendLogAction,
} from '@/actions/backendLogActions';
import ModalPortal from '@/components/ui/ModalPortal';

type BackendLog = Awaited<ReturnType<typeof listBackendLogsAction>>[number];
const PAGE_SIZE = 20;

function formatLogDate(value: Date | string | null | undefined, full = false): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: full ? 'long' : 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', ...(full ? { second: '2-digit' } : {}),
    hour12: true,
  }).format(date);
}

function severityStyle(severity: string) {
  switch (severity.toLowerCase()) {
    case 'error': return 'border-red-200 bg-red-50 text-red-700';
    case 'warning': return 'border-amber-200 bg-amber-50 text-amber-800';
    default: return 'border-blue-200 bg-blue-50 text-blue-800';
  }
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'resolved': return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'acknowledged': return 'border-blue-200 bg-blue-50 text-blue-800';
    default: return 'border-amber-200 bg-amber-50 text-amber-800';
  }
}

const fieldClass = 'h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#020e43] focus:ring-2 focus:ring-[#020e43]/10';
const labelClass = 'mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.09em] text-slate-500';

export default function BackendLogsClient({ logs }: { logs: BackendLog[] }) {
  const [items, setItems] = useState(logs);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<BackendLog | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState('');

  const refresh = useCallback(async () => {
    try {
      setItems(await listBackendLogsAction());
      setLastSynced(new Date().toLocaleTimeString('en-GB'));
      setError('');
    } catch {
      setError('Could not reload backend diagnostics. Please retry.');
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible' && !busy) void refresh();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [refresh, busy]);

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

  const categories = useMemo(() => Array.from(new Set(items.map(item => item.category).filter(Boolean))).sort(), [items]);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(item =>
      (level === 'all' || item.severity === level) &&
      (status === 'all' || item.status === status) &&
      (category === 'all' || item.category === category) &&
      (!query || `${item.message} ${item.category} ${item.source || ''} ${item.id}`.toLowerCase().includes(query))
    );
  }, [items, search, level, status, category]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const openErrors = items.filter(item => item.severity === 'error' && item.status === 'open').length;
  const warnings = items.filter(item => item.severity === 'warning').length;
  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  async function perform(action: () => Promise<{ success: boolean; error?: string }>) {
    setBusy(true);
    setError('');
    try {
      const result = await action();
      if (!result.success) {
        setError(result.error || 'The operation did not complete.');
        return;
      }
      await refresh();
    } catch {
      setError('Request failed. Please check your connection.');
    } finally {
      setBusy(false);
    }
  }

  const statusControl = (log: BackendLog) => (
    <select
      aria-label={`Status for diagnostic ${log.id}`}
      className={`${fieldClass} h-9 min-w-[138px] px-2 text-xs font-semibold capitalize ${statusStyle(log.status)}`}
      disabled={busy}
      value={log.status}
      onChange={event => void perform(() => updateBackendLogStatusAction(log.id, event.target.value as 'open' | 'acknowledged' | 'resolved'))}
    >
      <option value="open">Open</option>
      <option value="acknowledged">Acknowledged</option>
      <option value="resolved">Resolved</option>
    </select>
  );

  const archive = (log: BackendLog) => {
    if (window.confirm('Archive this diagnostic event?')) void perform(() => deleteBackendLogAction(log.id));
  };

  return (
    <section className="mx-auto w-full min-w-0 max-w-[1600px] space-y-5 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#020e43] text-white shadow-sm"><TerminalSquare className="h-5 w-5" /></span>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[#020e43] sm:text-[28px]">Backend Logs</h1>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-500">Database-backed application diagnostics and error tracking.</p>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <button type="button" disabled={busy} onClick={() => void perform(testBackendLoggerAction)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#020e43]/15 bg-white px-4 py-2.5 text-sm font-semibold text-[#020e43] shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 sm:flex-none"><FileText className="h-4 w-4" /> Test Logger</button>
          <button type="button" disabled={busy} onClick={() => void refresh()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#020e43] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#142762] disabled:opacity-60 sm:flex-none"><RefreshCw className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} /> Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#020e43]/5 text-[#020e43]"><Database className="h-6 w-6" /></span><div><p className="text-xs font-medium text-slate-500">Log source</p><p className="mt-1 text-lg font-extrabold text-[#020e43]">Database</p></div></div>
        <div className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-800"><FileText className="h-6 w-6" /></span><div><p className="text-xs font-medium text-slate-500">Matching records</p><p className="mt-1 text-2xl font-extrabold tabular-nums text-[#020e43]">{filtered.length}</p></div></div>
        <div className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#b50007]"><AlertCircle className="h-6 w-6" /></span><div><p className="text-xs font-medium text-slate-500">Open errors</p><p className="mt-1 text-2xl font-extrabold tabular-nums text-[#b50007]">{openErrors}</p></div></div>
        <div className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><AlertTriangle className="h-6 w-6" /></span><div><p className="text-xs font-medium text-slate-500">Warnings loaded</p><p className="mt-1 text-2xl font-extrabold tabular-nums text-[#020e43]">{warnings}</p></div></div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-900"><Info className="mt-0.5 h-4 w-4 shrink-0" /><p>Application diagnostics are recorded by server actions, enquiry endpoints and email handlers. Hostinger process and build logs are not automatically imported. The dashboard loads up to 250 recent database records.</p></div>
      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#020e43]" /> Times shown in your browser&apos;s local timezone. Stored timestamps use UTC.</span>
        <span className="font-medium text-slate-600">{lastSynced ? `Last refreshed at ${lastSynced}` : 'Auto-refreshes every 30 seconds while visible'}</span>
      </div>

      <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold text-[#020e43]"><Filter className="h-4 w-4" /> Filter logs</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_150px_170px_170px]">
          <div className="min-w-0 sm:col-span-2 xl:col-span-1"><label className={labelClass} htmlFor="bht-log-search">Search log text</label><div className="relative"><Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" /><input id="bht-log-search" className={`${fieldClass} pl-10`} value={search} onChange={event => changeFilter(setSearch)(event.target.value)} placeholder="Message, category, source or ID..." /></div></div>
          <div className="min-w-0"><label className={labelClass} htmlFor="bht-log-level">Severity</label><select id="bht-log-level" className={fieldClass} value={level} onChange={event => changeFilter(setLevel)(event.target.value)}><option value="all">All severities</option><option value="info">Info</option><option value="warning">Warning</option><option value="error">Error</option></select></div>
          <div className="min-w-0"><label className={labelClass} htmlFor="bht-log-category">Category</label><select id="bht-log-category" className={fieldClass} value={category} onChange={event => changeFilter(setCategory)(event.target.value)}><option value="all">All categories</option>{categories.map(value => <option value={value} key={value}>{value}</option>)}</select></div>
          <div className="min-w-0"><label className={labelClass} htmlFor="bht-log-status">Status</label><select id="bht-log-status" className={fieldClass} value={status} onChange={event => changeFilter(setStatus)(event.target.value)}><option value="all">All statuses</option><option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select></div>
        </div>
      </div>

      <div className="min-w-0 rounded-[22px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5"><div><h2 className="font-bold text-[#020e43]">Diagnostic records</h2><p className="mt-0.5 text-xs text-slate-500">Select View to read the complete log entry.</p></div><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{filtered.length} matching</span></div>
        <div className="hidden min-w-0 overflow-x-auto lg:block" role="region" aria-label="Backend logs table" tabIndex={0}>
          <table className="w-full min-w-[1040px] table-auto text-left text-sm">
            <thead className="bg-[#f3f6fb] text-[11px] font-bold uppercase tracking-wide text-slate-600"><tr>{['Date & time', 'Level', 'Category', 'Source', 'Message', 'Status', 'Actions'].map(name => <th key={name} className="px-4 py-3.5">{name}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map(log => <tr key={log.id} className="align-top transition-colors hover:bg-[#f8faff]">
                <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-slate-700">{formatLogDate(log.createdAt)}</td>
                <td className="px-4 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${severityStyle(log.severity)}`}>{log.severity}</span></td>
                <td className="px-4 py-4 text-xs font-medium text-slate-600">{log.category}</td>
                <td className="max-w-[150px] break-words px-4 py-4 text-xs text-slate-500">{log.source || 'Application'}</td>
                <td className="min-w-[230px] max-w-[450px] break-words px-4 py-4 text-xs font-medium leading-relaxed text-slate-800">{log.message}</td>
                <td className="px-4 py-4">{statusControl(log)}</td>
                <td className="px-4 py-4"><div className="flex items-center gap-2"><button type="button" onClick={() => setSelected(log)} className="inline-flex items-center gap-1 rounded-lg border border-[#020e43]/20 bg-[#020e43]/5 px-2.5 py-2 text-xs font-bold text-[#020e43] hover:bg-[#020e43]/10"><Eye className="h-3.5 w-3.5" /> View</button><button type="button" disabled={busy} onClick={() => archive(log)} className="rounded-lg border border-red-100 px-2.5 py-2 text-xs font-semibold text-[#b50007] hover:bg-red-50 disabled:opacity-50" aria-label={`Archive log ${log.id}`}><Archive className="h-3.5 w-3.5" /></button></div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 p-3 lg:hidden">
          {visible.map(log => <article key={log.id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${severityStyle(log.severity)}`}>{log.severity}</span><time className="text-xs font-medium text-slate-500">{formatLogDate(log.createdAt)}</time></div>
            <p className="mt-3 break-words text-sm font-semibold leading-relaxed text-[#020e43]">{log.message}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="min-w-0"><span className="block text-slate-400">Category</span><span className="mt-0.5 block break-words font-medium text-slate-700">{log.category}</span></div><div className="min-w-0"><span className="block text-slate-400">Source</span><span className="mt-0.5 block break-words font-medium text-slate-700">{log.source || 'Application'}</span></div></div>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3"><div className="min-w-[138px] flex-1">{statusControl(log)}</div><button type="button" onClick={() => setSelected(log)} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#020e43]/20 bg-[#020e43]/5 px-3 text-xs font-bold text-[#020e43]"><Eye className="h-3.5 w-3.5" /> View</button><button type="button" disabled={busy} onClick={() => archive(log)} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-red-200 px-3 text-xs font-semibold text-[#b50007] disabled:opacity-50"><Archive className="h-3.5 w-3.5" /> Archive</button></div>
          </article>)}
        </div>
        {filtered.length === 0 && <div className="flex flex-col items-center gap-2 px-5 py-14 text-center"><Search className="h-8 w-8 text-slate-300" /><p className="font-bold text-[#020e43]">No matching logs</p><p className="text-sm text-slate-500">Try another search or change the filters.</p></div>}
        {filtered.length > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 text-xs text-slate-500 sm:px-5"><span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} loaded records</span><div className="flex items-center gap-2"><span className="mr-1 font-semibold text-[#020e43]">Page {currentPage} of {pageCount}</span><button type="button" aria-label="Previous log page" disabled={currentPage <= 1} onClick={() => setPage(current => Math.max(1, current - 1))} className="rounded-lg border border-slate-200 bg-white p-2 text-[#020e43] hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><button type="button" aria-label="Next log page" disabled={currentPage >= pageCount} onClick={() => setPage(current => Math.min(pageCount, current + 1))} className="rounded-lg border border-slate-200 bg-white p-2 text-[#020e43] hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></div>}
      </div>

      {selected && (
        <ModalPortal>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Backend log details"
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-150"
            onMouseDown={event => {
              if (event.target === event.currentTarget) setSelected(null);
            }}
          >
            <div className="w-full max-w-2xl min-w-0 max-h-[90dvh] overflow-y-auto rounded-[22px] bg-white p-5 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#b50007]">Diagnostic #{selected.id}</p>
                  <h2 className="mt-1 text-xl font-bold text-[#020e43]">Log entry details</h2>
                </div>
                <button
                  type="button"
                  aria-label="Close log details"
                  onClick={() => setSelected(null)}
                  className="rounded-full p-2 text-white bg-red hover:bg-red-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${severityStyle(selected.severity)}`}>{selected.severity}</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${statusStyle(selected.status)}`}>{selected.status}</span>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Date and time</p>
                  <p className="mt-1 font-semibold text-slate-800">{formatLogDate(selected.createdAt, true)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Category</p>
                  <p className="mt-1 font-semibold text-slate-800">{selected.category}</p>
                </div>
                <div className="min-w-0 sm:col-span-2">
                  <p className="text-xs text-slate-500">Source</p>
                  <p className="mt-1 break-all font-semibold text-slate-800">{selected.source || 'Application'}</p>
                </div>
              </div>
              <div className="mt-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Message</p>
                <p className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">{selected.message}</p>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">This entry comes from British Haj Travel&apos;s database logger. Framework stack traces and hosting log files are not stored in these records.</p>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl bg-[#020e43] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#142762] cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </section>
  );
}
