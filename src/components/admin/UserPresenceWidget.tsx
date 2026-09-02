'use client';

import { useState, useEffect, useRef } from 'react';
import { Users, Wifi, WifiOff, ShieldCheck, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { recordUserHeartbeatAction, getUsersPresenceAction, UserPresenceInfo } from '@/actions/userActions';

interface UserPresenceWidgetProps {
  currentUser: {
    name: string;
    role: string;
    email?: string;
  } | null;
}

export default function UserPresenceWidget({ currentUser }: UserPresenceWidgetProps) {
  const [users, setUsers] = useState<UserPresenceInfo[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchPresence = async () => {
    try {
      // Send heartbeat for current user
      if (currentUser?.email) {
        await recordUserHeartbeatAction({
          email: currentUser.email,
          name: currentUser.name,
          role: currentUser.role,
        });
      }
      // Get all users presence list
      const data = await getUsersPresenceAction();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.warn('Presence polling error:', err);
    }
  };

  useEffect(() => {
    fetchPresence();
    const interval = setInterval(fetchPresence, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, [currentUser]);

  // Outside click to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onlineUsers = users.filter((u) => u.isOnline);
  const offlineUsers = users.filter((u) => !u.isOnline);

  const currentEmail = currentUser?.email?.toLowerCase();

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Pill Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer shadow-xs ${onlineUsers.length > 0
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/80 hover:border-emerald-300'
          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        title="View online team members"
      >
        <span className="relative flex h-2 w-2">
          {onlineUsers.length > 0 && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${onlineUsers.length > 0 ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
          ></span>
        </span>

        <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
        <span className="flex items-center gap-1">
          <span>{onlineUsers.length} Online</span>
          {offlineUsers.length > 0 && (
            <>
              <span className="text-slate-300"> | </span>
              <span className="text-red-600">{offlineUsers.length} Offline</span>
            </>
          )}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''
            }`}
        />
      </button>

      {/* Flyout Dropdown Modal */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="bg-primary text-white p-3.5 px-4 flex items-center justify-between border-b border-emerald-900/30">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-300" />
              <div>
                <div className="text-xs font-extrabold">Team Online Status</div>
                <div className="text-[10px] text-emerald-200">Real-time user presence tracking</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {onlineUsers.length} Active
            </span>
          </div>

          {/* User List */}
          <div className="p-2 divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {users.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading user presence...</div>
            ) : (
              users.map((u) => {
                const isMe = currentEmail && u.email.toLowerCase() === currentEmail;
                const roleLabel = u.role.replace(/_/g, ' ');

                return (
                  <div
                    key={u.id || u.email}
                    className={`p-2.5 rounded-xl transition-colors flex items-center justify-between gap-3 ${isMe ? 'bg-emerald-50/50' : 'hover:bg-slate-50'
                      }`}
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-xs"
                          style={{
                            backgroundColor: u.badgeBg || (u.isOnline ? '#004B39' : '#64748B'),
                            color: u.badgeTextColor || '#FFFFFF',
                          }}
                        >
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${u.isOnline ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          title={u.isOnline ? 'Online' : 'Offline'}
                        />
                      </div>

                      {/* Name & Role */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800 truncate">
                            {u.name}
                          </span>
                          {isMe && (
                            <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-xs">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                            {roleLabel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="shrink-0 text-right">
                      {u.isOnline ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          Online
                        </span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full leading-normal">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            Offline
                          </span>
                          <span className="text-[8px] text-slate-400 mt-0.5">
                            {u.lastSeenAgo || 'Offline'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Auto-refreshes every 15s · Active within 3 mins
          </div>
        </div>
      )}
    </div>
  );
}
