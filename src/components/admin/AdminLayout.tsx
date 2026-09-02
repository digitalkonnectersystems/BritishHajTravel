'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { adminLogout } from '@/actions/authActions';
import AdminPackageDetailModal from '@/components/admin/AdminPackageDetailModal';
import SessionTimer from '@/components/admin/SessionTimer';
import UserPresenceWidget from '@/components/admin/UserPresenceWidget';
import { getSiteIdentity } from '@/actions/pageActions';
import {
  User,
  Settings,
  LogOut,
  Globe,
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  Activity,
  FileText,
  Mail,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  LayoutDashboard,
  BookOpen,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  user: { name: string; role: string; email?: string; loginTime?: number } | null;
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: 'CRM Enquiries',
    href: '/admin/enquiries',
    icon: <Mail className="w-4 h-4" />,
  },
  {
    label: 'Hajj Packages',
    href: '/admin/hajj-packages',
    icon: <Package className="w-4 h-4" />,
  },
  {
    label: 'Umrah Packages',
    href: '/admin/umrah-packages',
    icon: <Package className="w-4 h-4" />,
  },
  {
    label: 'Saudi Visas',
    href: '/admin/visas',
    icon: <FileText className="w-4 h-4" />,
  },
  {
    label: 'Pages',
    href: '/admin/pages',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    label: 'Blogs',
    href: '/admin/blogs',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="w-4 h-4" />,
  },
];

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const pathname = usePathname();
  const [identity, setIdentity] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    getSiteIdentity().then((data) => {
      if (isMounted && data) setIdentity(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const logoSrc = identity?.logo || '/img/logo.png';
  const logoAlt = identity?.logoAlt || 'King Travel Canada Logo';

  const userName = user?.name || 'Admin User';
  const userRole = user?.role ? user.role.replace(/_/g, ' ') : 'Super Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  // Active page title indicator
  const currentPageItem = navItems.find(
    (item) => pathname === item.href || (item.href === '/admin/pages' && pathname.startsWith('/admin/pages'))
  );
  const pageTitle = currentPageItem ? currentPageItem.label : 'Admin Portal';

  return (
    <div className="flex h-screen overflow-hidden bg-[#1C1F26] font-sans">
      {/* ── Left Sidebar ── */}
      <aside className="w-[220px] min-w-[220px] bg-white border-r border-white/5 flex flex-col p-6 px-3 gap-0 overflow-y-auto z-20">
        {/* Brand */}
        <div className="px-2 pb-6 border-b border-white/5">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={140}
            height={36}
            priority
            className="w-auto h-[36px] object-contain block"
          />
          <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold tracking-widest uppercase text-primary border border-primary px-2 py-0.5 rounded-full">
            <Sparkles className="w-2.5 h-2.5" /> Admin Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 pt-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || (item.href === '/admin/pages' && pathname.startsWith('/admin/pages'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs transition-all ${isActive
                  ? 'text-ink font-bold bg-primary text-white shadow-md border-l-4 border-primary pl-2.5'
                  : 'text-ink font-medium group hover:bg-primary/5 hover:text-ink/80 hover:shadow-sm'
                  }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-ink/80 group-hover:text-ink'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ── Redesigned Sleek Top Header Bar ── */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-3 flex items-center justify-between gap-4 shrink-0 shadow-xs z-30 relative">

          {/* Left Side: Page Context & Live Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-800 m-0">{pageTitle}</h1>
              <span className="text-slate-300 text-xs">|</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                System Online
              </span>
            </div>
          </div>

          {/* Center: 8-Hour Session Countdown Timer & Team Presence */}
          <div className="flex items-center justify-center gap-3">
            <SessionTimer loginTime={user?.loginTime} />
            <UserPresenceWidget currentUser={user} />
          </div>

          {/* Right Side: Actions & Profile Menu */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Live Site Link Button */}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-primary bg-white border border-slate-300 hover:border-primary hover:bg-primary hover:text-white rounded-full px-4 py-1.5 transition-all shadow-xs group"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Live Site</span>
              <span className="text-[10px] opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
            </Link>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative p-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-primary" /> Notifications
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded-full">
                      All Clear
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-800">Database &amp; Local Storage Active</div>
                        <div className="text-[10px] text-slate-500">Live storage operational</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Profile Dropdown Trigger */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1 pr-2.5 rounded-full hover:bg-slate-100 transition-all cursor-pointer border border-slate-200 bg-white shadow-xs"
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[#DB9E30] flex items-center justify-center font-extrabold text-xs text-white shadow-xs">
                    {userInitial}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-extrabold text-slate-800 leading-tight">{userName}</div>
                  <div className="text-[9px] font-semibold text-slate-400 capitalize">{userRole}</div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Admin Profile Dropdown Flyout Card */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-primary to-[#00382B] p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center font-black text-base text-white shrink-0 shadow-inner">
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-extrabold truncate text-white">{userName}</div>
                        <div className="text-[10px] text-emerald-200 font-medium truncate">{user?.email || 'admin@kingtravelcan.com'}</div>
                        <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-wider text-gold bg-gold/20 border border-[#DB9E30]/40 px-2 py-0.5 rounded-md">
                          {userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary hover:bg-emerald-50 transition-colors no-underline"
                    >
                      <Settings className="w-4 h-4 text-primary" />
                      <span>Account Settings</span>
                    </Link>

                    <Link
                      href="/admin/activity"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary hover:bg-emerald-50 transition-colors no-underline"
                    >
                      <Activity className="w-4 h-4 text-primary" />
                      <span>Activity Audit Logs</span>
                    </Link>

                    <Link
                      href="/admin/pages"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary hover:bg-emerald-50 transition-colors no-underline"
                    >
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span>Page Builder</span>
                    </Link>
                  </div>

                  {/* Logout Action */}
                  {/* <div className="p-2 border-t border-slate-100 bg-slate-50/80">
                    <form action={adminLogout}>
                      <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-100/70 border border-red-200 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </form>
                  </div> */}
                </div>
              )}
            </div>
            {/* User Logout Button */}
            <form action={adminLogout}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-semibold text-white hover:bg-red-700 bg-red-600 transition-colors cursor-pointer text-left border border-red-500/30"
              >
                <LogOut className="w-4 h-4 shrink-0 text-white" />
                Log Out
              </button>
            </form>
          </div>
        </header>

        {/* Main scrollable content — light canvas */}
        <main className="flex-1 overflow-y-auto bg-sage p-7 px-8 text-slate-800">
          {children}
        </main>
      </div>
    </div>
  );
}
