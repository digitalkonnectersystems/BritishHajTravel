'use client';

import { Fragment, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActivityItem, getRecentActivities, clearActivityLogsAction } from '@/actions/activityActions';
import { Search, Filter, RefreshCw, Check, Users, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface ActivityLogsClientProps {
  initialActivities: ActivityItem[];
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
  enquiries: { label: 'Enquiries', bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E', border: '#FECDD3' },
  menus: { label: 'Menus', bg: '#F0FDFA', text: '#0F766E', dot: '#14B8A6', border: '#99F6E4' },
};

export default function ActivityLogsClient({ initialActivities }: ActivityLogsClientProps) {
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);
  const [expandedActivityId, setExpandedActivityId] = useState<string | number | null>(null);

  const refreshLogs = async () => {
    setIsRefreshing(true);
    setJustRefreshed(false);
    try {
      const startTime = Date.now();
      const data = await getRecentActivities(150);
      setActivities(data);
      router.refresh();

      // Ensure minimum 400ms feedback animation
      const elapsed = Date.now() - startTime;
      if (elapsed < 400) {
        await new Promise((r) => setTimeout(r, 400 - elapsed));
      }

      setJustRefreshed(true);
      setTimeout(() => setJustRefreshed(false), 2000);
    } catch (err) {
      console.error('Failed to refresh activity logs:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await getRecentActivities(150);
        setActivities(data);
      } catch (err) {
        console.error('Failed to refresh activity logs:', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear all audit activity logs? This cannot be undone.')) {
      await clearActivityLogsAction();
      setActivities([]);
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
      (act.details || '').toLowerCase().includes(q);
    const matchesType = selectedType === 'all' || act.type === selectedType;
    const matchesUser = selectedUser === 'all' || act.user.toLowerCase() === selectedUser.toLowerCase();
    return matchesSearch && matchesType && matchesUser;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 m-0">Activity Logs</h1>
            <span className="bg-primary text-white text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
              {filtered.length} entries
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
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

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex-wrap">
        <div className="relative flex-1 w-full min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, user, email, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* User Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
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
            <Filter className="w-4 h-4 text-slate-400" />
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
              <option value="enquiries">Enquiries</option>
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

      {/* Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-4 w-12 text-center">Type</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Details</th>
              <th className="py-3.5 px-4 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="font-bold text-slate-600">No activity log entries found</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
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
                        <div className="flex items-center gap-2.5">
                          <div
                            style={{ backgroundColor: act.badgeBg || '#004B39', color: act.badgeTextColor || '#FFFFFF' }}
                            className="w-7 h-7 rounded-full font-black text-[11px] flex items-center justify-center shadow-xs shrink-0"
                          >
                            {act.user ? act.user.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-800 truncate">{act.user}</div>
                            {act.userEmail && <div className="text-[10px] text-slate-400 truncate">{act.userEmail}</div>}
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
                        <div className="text-[10px] text-slate-400">
                          {new Date(act.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {act.ipAddress && <div className="text-[9px] text-slate-400 mt-0.5">IP: {act.ipAddress}</div>}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                              <span className="text-[11px] font-extrabold text-slate-800">Changed fields</span>
                              <span className="text-[10px] font-bold text-slate-500">{changes.length} change{changes.length === 1 ? '' : 's'}</span>
                            </div>
                            {changes.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full text-[11px] border-collapse">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[9px]">
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
                              <div className="px-4 py-4 text-[11px] text-slate-500">
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
