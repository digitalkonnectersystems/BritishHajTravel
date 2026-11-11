'use client';

import { Fragment, useState, useEffect } from 'react';
import { ActivityItem, getRecentActivities, clearActivityLogsAction } from '@/actions/activityActions';
import { Search, Filter, RefreshCw, Check, Users, Activity, ChevronDown, ChevronUp, Download } from 'lucide-react';
import ActivityBreakdownChart, { type ActivityAnalytics } from '@/components/admin/ActivityBreakdownChart';
import { getActivityAnalyticsAction } from '@/actions/activityAnalyticsActions';
import { type ActivityPeriod, pakistanYesterday } from '@/lib/activityAnalytics';

interface ActivityLogsClientProps {
  initialActivities: ActivityItem[];
  initialAnalytics: ActivityAnalytics | null;
  canExport: boolean;
}

function formatAuditValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string; border: string }> = {
  pages: { label: 'Pages', bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', border: '#BFDBFE' },
  users: { label: 'Users / Login', bg: '#ECFDF5', text: '#047857', dot: '#10B981', border: '#A7F3D0' },
  settings: { label: 'Settings', bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6', border: '#DDD6FE' },
  packages: { label: 'Packages', bg: '#FFFBEB', text: '#B45309', dot: '#F59E0B', border: '#FDE68A' },
  blogs: { label: 'Blog Posts', bg: '#FDF4FF', text: '#A21CAF', dot: '#D946EF', border: '#F5D0FE' },
  destinations: { label: 'Destinations', bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6', border: '#BFDBFE' },
  visas: { label: 'Visas', bg: '#E0F2FE', text: '#0369A1', dot: '#0EA5E9', border: '#BAE6FD' },
  enquiries: { label: 'Forms Enquiries', bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E', border: '#FECDD3' },
  hotels: { label: 'Hotels', bg: '#EFF6FF', text: '#1D4ED8', dot: '#60A5FA', border: '#BFDBFE' },
  media: { label: 'Media Library', bg: '#F0FDFA', text: '#0F766E', dot: '#14B8A6', border: '#99F6E4' },
  guides: { label: 'Guides', bg: '#FDF4FF', text: '#A21CAF', dot: '#D946EF', border: '#F5D0FE' },
  hajj_guide: { label: 'Hajj Guide Grids', bg: '#FDF4FF', text: '#A21CAF', dot: '#D946EF', border: '#F5D0FE' },
  visa_processing: { label: 'Visa Processing', bg: '#EFF6FF', text: '#0369A1', dot: '#0EA5E9', border: '#BAE6FD' },
  baan: { label: 'BAAN Holding Hajj', bg: '#FFFBEB', text: '#B45309', dot: '#F59E0B', border: '#FDE68A' },
  seo: { label: 'SEO', bg: '#F0FDFA', text: '#0F766E', dot: '#14B8A6', border: '#99F6E4' },

  menus: { label: 'Menus', bg: '#F0FDFA', text: '#0F766E', dot: '#14B8A6', border: '#99F6E4' },
};

export default function ActivityLogsClient({ initialActivities, initialAnalytics, canExport }: ActivityLogsClientProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<ActivityPeriod>('14d');
  const [overview, setOverview] = useState<ActivityAnalytics | null>(initialAnalytics);
  const [rangeBusy, setRangeBusy] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportBusy, setExportBusy] = useState(false);
  const yesterday = pakistanYesterday();
  const exportInvalid = !fromDate || !toDate || !exportFormat || fromDate > toDate || toDate > yesterday || fromDate > yesterday;
  const exportLogs = async () => {
    if (exportInvalid || exportBusy) return;
    setExportBusy(true);
    setActivityError('');
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate, format: exportFormat });
      const response = await fetch(`/api/admin/activity/export?${params}`, { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Activity export failed');
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `BHT-activity-logs_${fromDate}_to_${toDate}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    } catch (error) { setActivityError(error instanceof Error ? error.message : 'Unable to download logs'); }
    finally { setExportBusy(false); }
  };
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activityError, setActivityError] = useState('');
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [expandedActivityId, setExpandedActivityId] = useState<string | number | null>(null);

  // Query the selected period, not just the latest 150 entries.
  useEffect(() => {
    let alive = true;
    const reload = async () => {
      if (!alive || document.visibilityState !== 'visible') return;
      setIsRefreshing(true);
      setRangeBusy(true);
      try {
        const [entries, analytics] = await Promise.all([
          getRecentActivities(300, period), getActivityAnalyticsAction(period),
        ]);
        if (alive) { setActivities(entries); setOverview(analytics); setActivityError(''); setJustRefreshed(true); }
      } catch {
        if (alive) setActivityError('Failed to load activity for this period. Existing results are shown.');
      } finally { if (alive) { setIsRefreshing(false); setRangeBusy(false); } }
    };
    if (period !== '14d' || !initialAnalytics) void reload();
    const timer = window.setInterval(() => void reload(), 60000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [period, initialAnalytics]);

  const refreshLogs = async () => {
    setIsRefreshing(true);
    setJustRefreshed(false);
    try {
      const [entries, analytics] = await Promise.all([
        getRecentActivities(300, period), getActivityAnalyticsAction(period),
      ]);
      setActivities(entries);
      setOverview(analytics);
      setActivityError('');
      setJustRefreshed(true);
    } catch { setActivityError('Failed to refresh activity logs.'); }
    finally { setIsRefreshing(false); }
  };

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all audit activity logs? This cannot be undone.')) {
      setActivityError('');
      try {
        const result = await clearActivityLogsAction();
        if (!result.success) { setActivityError(result.error || 'Unable to clear the audit logs.'); return; }
        setActivities([]);
      } catch { setActivityError('Unable to clear the audit logs. Please retry.'); }
    }
  };

  // Extract all unique users who performed activities
  const uniqueUsers = Array.from(
    new Set(
      activities
        .map((act) => act.user?.trim())
        .filter((u): u is string => Boolean(u && u.length > 0))
    )
  ).sort();

  const filtered = activities.filter((act) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      act.action.toLowerCase().includes(q) ||
      act.user.toLowerCase().includes(q) ||
      (act.userEmail || '').toLowerCase().includes(q) ||
      (act.details || '').toLowerCase().includes(q) ||
      (act.ipAddress || '').toLowerCase().includes(q);
    const matchesType = selectedType === 'all' || act.type === selectedType;
    const matchesUser = selectedUser === 'all' || act.user.toLowerCase() === selectedUser.toLowerCase();
    return matchesSearch && matchesType && matchesUser;
  });

  return (
    <div className="flex flex-col gap-6">
      {activityError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-800">{activityError}</p>}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 m-0">Activity Logs</h1>
            <span className="bg-primary text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
              {filtered.length} entries
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Detailed chronological record of all administrative actions and user CRUD operations across all team members.
          </p>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshLogs}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95 ${justRefreshed
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
              : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 hover:border-slate-400'
              }`}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>Refreshing...</span>
              </>
            ) : justRefreshed ? (
              <>
                <Check className="w-3.5 h-3.5 text-primary" />
                <span>Updated!</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
                <span>Refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      {canExport && <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-sm font-extrabold text-[#020e43]">Download Activity Logs</h2>
            <p className="mt-1 text-xs text-slate-500">Choose both dates and CSV or PDF. Today's activity is excluded; yesterday is the latest permitted date (Asia/Karachi).</p>
          </div>
          <span className="rounded-full bg-[#020e43]/5 px-3 py-1 text-[11px] font-bold text-[#020e43]">Latest: {yesterday}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="flex min-w-[150px] flex-col gap-1 text-[11px] font-bold text-[#020e43]">From Date
            <input type="date" value={fromDate} max={yesterday} onChange={e => setFromDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#020e43] focus:outline-none" />
          </label>
          <label className="flex min-w-[150px] flex-col gap-1 text-[11px] font-bold text-primary cursor-pointer">To Date
            <input type="date" value={toDate} min={fromDate || undefined} max={yesterday} onChange={e => setToDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 focus:border-[#020e43] focus:outline-none" />
          </label>

          <label className="flex min-w-[130px] flex-col gap-1 text-[11px] font-bold text-[#020e43]">
            Format
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 focus:border-[#020e43] focus:outline-none"
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </label>
          <button type="button" onClick={() => void exportLogs()} disabled={exportInvalid || exportBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-light px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">
            <Download className="h-4 w-4" />{exportBusy ? 'Preparing Download...' : 'Download Activity Logs'}
          </button>
        </div>
      </section>}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex-wrap">
        <div className="relative flex-1 w-full min-w-[240px]">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, IP, user, email, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* User Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-bold outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="all">All Users ({uniqueUsers.length})</option>
              {uniqueUsers.map((userName) => (
                <option key={userName} value={userName}>
                  {userName}
                </option>
              ))}
            </select>
          </div>

          {/* Entity Type Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 font-bold outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="all">All Entities</option>
              <option value="users">Users / Login</option>
              <option value="pages">Pages / CMS</option>
              <option value="packages">Packages</option>
              <option value="blogs">Blog Posts</option>
              <option value="visas">Visas</option>
              <option value="destinations">Destinations</option>
              <option value="enquiries">Forms Enquiries</option>
              <option value="hotels">Hotels</option>
              <option value="media">Media Library</option>
              <option value="guides">Guides</option>
              <option value="hajj_guide">Hajj Guide Grids</option>
              <option value="visa_processing">Visa Processing</option>
              <option value="baan">BAAN Holding Hajj</option>
              <option value="seo">SEO</option>
              <option value="menus">Menus</option>
              <option value="settings">Settings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3 flex-wrap shadow-xs">
        <span className="text-xs font-bold text-slate-700 mr-1">Filter by Entity:</span>
        <span
          onClick={() => setSelectedType('all')}
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all border ${selectedType === 'all'
            ? 'bg-primary text-white border-primary shadow-xs'
            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
        >
          All ({activities.length})
        </span>

        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
          const count = activities.filter((a) => a.type === key).length;
          const isSelected = selectedType === key;

          return (
            <button
              type="button"
              key={key}
              onClick={() => setSelectedType(isSelected ? 'all' : key)}
              style={{
                backgroundColor: isSelected ? cfg.text : cfg.bg,
                color: isSelected ? '#FFFFFF' : cfg.text,
                borderColor: cfg.border,
              }}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full cursor-pointer transition-all border ${isSelected ? 'ring-2 ring-offset-1 ring-primary shadow-xs' : 'hover:scale-105'
                }`}
            >
              <span
                style={{
                  backgroundColor: isSelected ? '#FFFFFF' : cfg.dot,
                }}
                className="w-2 h-2 rounded-full shrink-0"
              />
              {cfg.label}
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-black/5 text-slate-600'
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {overview ? <ActivityBreakdownChart data={overview} period={period} onPeriodChange={setPeriod} busy={rangeBusy} /> :
        <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">Activity chart is unavailable. Check the backend diagnostics.</p>}
      <p className="text-xs text-slate-500">Showing the latest {activities.length} audit records in this period. Chart totals use the full recorded period, rather than this table's 300-record limit.</p>

      {/* Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-4 w-12 text-center">Type</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">IP Address</th>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Details</th>
              <th className="py-3.5 px-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-500">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="font-bold text-slate-600">No activity log entries found</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">
                    {search || selectedType !== 'all' || selectedUser !== 'all'
                      ? 'Try adjusting your search query, user filter, or entity filter'
                      : 'Activity logs will appear automatically as administrative actions occur across all users'}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((act) => {
                const cfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.pages;
                const isExpanded = expandedActivityId === act.id;
                const changes = act.changes || [];
                return (
                  <Fragment key={act.id}>
                    <tr className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <span
                          style={{ backgroundColor: cfg.dot }}
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          title={cfg.label}
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{act.action}</span>
                          <span
                            style={{ backgroundColor: cfg.bg, color: cfg.text, borderColor: cfg.border }}
                            className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase border tracking-wider"
                          >
                            {cfg.label}
                          </span>
                          {act.status && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-slate-200 bg-slate-50 text-slate-600 tracking-wider">
                              {act.status}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-[11px] font-bold text-slate-700">{act.ipAddress || '—'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            style={{ backgroundColor: act.badgeBg || '#004B39', color: act.badgeTextColor || '#FFFFFF' }}
                            className="w-7 h-7 rounded-full font-black text-[11px] flex items-center justify-center shadow-xs shrink-0"
                          >
                            {act.user ? act.user.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate">{act.user}</div>
                            {act.userEmail && <div className="text-[10px] text-gray-500 truncate">{act.userEmail}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-[12px] text-slate-600 max-w-sm">
                        <div className="truncate">{act.details || '—'}</div>
                        {(changes.length > 0 || act.previousEntry != null || act.newEntry != null) && (
                          <button
                            type="button"
                            onClick={() => setExpandedActivityId(isExpanded ? null : act.id)}
                            className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-extrabold text-primary hover:underline cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            {isExpanded ? 'Hide changes' : `View changes${changes.length ? ` (${changes.length})` : ''}`}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right shrink-0">
                        <div className="font-extrabold text-slate-800">{act.timeAgo || 'Recently'}</div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                              <span className="text-[11px] font-extrabold text-slate-800">Changed fields</span>
                              <span className="text-[10px] font-bold text-gray-500">{changes.length} change{changes.length === 1 ? '' : 's'}</span>
                            </div>
                            {changes.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-[11px] border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-gray-500 uppercase tracking-wider text-[9px]">
                                      <th className="text-left px-4 py-2 w-1/5">Field</th>
                                      <th className="text-left px-4 py-2 w-2/5">Before</th>
                                      <th className="text-left px-4 py-2 w-2/5">After</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {changes.map((change, index) => (
                                      <tr key={`${change.field}-${index}`}>
                                        <td className="px-4 py-2.5 font-extrabold text-slate-700 align-top break-all">{change.field}</td>
                                        <td className="px-4 py-2.5 align-top">
                                          <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[10px] text-rose-700 bg-rose-50 border border-rose-100 rounded-lg p-2 max-h-44 overflow-auto">{formatAuditValue(change.before)}</pre>
                                        </td>
                                        <td className="px-4 py-2.5 align-top">
                                          <pre className="m-0 whitespace-pre-wrap break-words font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-2 max-h-44 overflow-auto">{formatAuditValue(change.after)}</pre>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="px-4 py-4 text-[11px] text-gray-500">
                                This older log entry did not store both before and after values. New CRUD updates that provide audit snapshots will show the exact changed fields here.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
