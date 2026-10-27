'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { adminLogout } from '@/actions/authActions';
import { useAdminSession } from '@/components/admin/AdminSessionProvider';
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
  GitPullRequest,
  TerminalSquare,
  SlidersHorizontal,
  FileText,
  Mail,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Building2,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  // Deprecated: some older admin pages pass a hard-coded display role.
  // The authenticated server session is always used instead.
  user?: { name: string; role: string; email?: string; loginTime?: number } | null;
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    label: 'Forms Enquiries',
    href: '/admin/enquiries',
    icon: <Mail className="w-4 h-4" />,
  },
  {
    label: 'Hajj Packages',
    href: '/admin/hajj-packages',
    icon: <Package className="w-4 h-4" />,
  },
  {
    label: 'BAAN Holding Hajj Page',
    href: '/admin/baan-holding-hajj',
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
    label: 'Hotels',
    href: '/admin/hotels',
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    label: 'Destinations',
    href: '/admin/destinations',
    icon: <Globe className="w-4 h-4" />,
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
    label: 'Guides',
    href: '/admin/guides',
    icon: <BookOpen className="w-4 h-4" />,
  },
  {
    label: 'SEO Center',
    href: '/admin/seo',
    icon: <Search className="w-4 h-4" />,
  },
  {
    label: 'Customized Enquiries',
    href: '/admin/customized-enquiries',
    icon: <SlidersHorizontal className="w-4 h-4" />,
  },
  {
    label: 'Redirects & 404',
    href: '/admin/redirects',
    icon: <GitPullRequest className="w-4 h-4" />,
  },
  {
    label: 'Backend Logs',
    href: '/admin/backend-logs',
    icon: <TerminalSquare className="w-4 h-4" />,
  },
  {
    label: 'Activity Logs',
    href: '/admin/activity',
    icon: <Activity className="w-4 h-4" />,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: <Settings className="w-4 h-4" />,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  // Only use the verified server session provided by /admin/layout.tsx.
  // Ignoring the legacy `user` prop fixes the 'Super Admin' vs 'super_admin' mismatch.
  const user = useAdminSession();
  const pathname = usePathname();
  // Authentication is supplied by the /admin server layout, not hard-coded page props.
  const currentUser = user;
  const [identity, setIdentity] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    getSiteIdentity().then((data) => {
      if (isMounted && data) setIdentity(data);
    }).catch((error) => console.error('Could not load admin branding:', error));
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
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
  const logoAlt = identity?.logoAlt || 'British Hajj Travel UK Logo';

  const userName = currentUser?.name || 'Admin User';
  const userRole = currentUser?.role ? currentUser.role.replace(/_/g, ' ') : 'Super Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  // Active page title indicator
  const currentPageItem = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );
  const pageTitle = currentPageItem ? currentPageItem.label : 'Admin Portal';

  return (
    <div className="fixed inset-0 flex min-w-0 overflow-hidden bg-[#edf3f8] font-sans">
      {/* ── Left Sidebar ── */}
      {sidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" />}
      <aside className={`${sidebarOpen ? 'flex' : 'hidden'} fixed inset-y-0 left-0 z-40 w-[252px] min-w-[252px] flex-col bg-white border-r border-slate-200/80 px-3 py-5 gap-0 overflow-y-auto shadow-[8px_0_30px_-24px_rgba(15,23,42,.5)] md:static md:flex`}>
        {/* Brand */}
        <div className="px-2 pb-6 border-b border-slate-100">
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
        <nav className="flex-1 pt-5 flex flex-col gap-1.5">
          {navItems.filter((item) => {
            if (!currentUser || currentUser.role === 'super_admin' || currentUser.role === 'admin') return true;
            if (item.href === '/admin/enquiries' || item.href === '/admin/customized-enquiries') return currentUser.role === 'enquiry_manager';
            if (item.href === '/admin/backend-logs') return false;
            if (item.href === '/admin/redirects') return currentUser.role === 'content_editor';
            if (item.href === '/admin/seo') return currentUser.role === 'content_editor' || currentUser.role === 'seo_manager';
            if (item.href === '/admin/settings') return false;
            return item.href === '/admin/dashboard' || item.href === '/admin/activity' || currentUser.role === 'content_editor';
          }).map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] transition-all duration-200 ${isActive
                  ? 'text-white font-bold bg-gradient-to-r from-[#064e3b] via-[#087f69] to-[#0b877f] shadow-[0_8px_22px_-10px_rgba(4,120,87,.65)]'
                  : 'text-slate-600 font-semibold group hover:bg-emerald-50 hover:text-emerald-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
              >
                <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-700'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* ── Right Panel ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* ── Redesigned Sleek Top Header Bar ── */}
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 overflow-visible bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 py-3 shadow-xs relative z-30 sm:px-6">
          <button type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)} className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden">
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {/* Left Side: Page Context & Live Indicator */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-slate-800 m-0">{pageTitle}</h1>
              <span className="text-slate-300 text-xs">|</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Session Active
              </span>
            </div>
          </div>

          {/* Center: 8-Hour Session Countdown Timer & Team Presence */}
          <div className="flex items-center justify-center gap-3">
            <SessionTimer loginTime={currentUser?.loginTime} />
            <UserPresenceWidget currentUser={currentUser} />
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
                      Not verified
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[11px] font-bold text-slate-800">Database and storage status require server checks</div>
                        <div className="text-[10px] text-slate-500">Status is not inferred from being logged in</div>
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
                        <div className="text-[10px] text-emerald-200 font-medium truncate">{currentUser?.email || 'admin@britishhajjtravel.com'}</div>
                        <span className="inline-block mt-1 text-[9px] font-extrabold uppercase tracking-wider text-red bg-red/20 border border-[#DB9E30]/40 px-2 py-0.5 rounded-md">
                          {userRole}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2 space-y-1">
                    {(["super_admin", "admin"].includes(currentUser?.role || "")) && <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-primary hover:bg-emerald-50 transition-colors no-underline"
                    >
                      <Settings className="w-4 h-4 text-primary" />
                      <span>Account Settings</span>
                    </Link>}

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
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#f2f7fb] via-[#eef4f8] to-[#e8f3ef] p-4 text-slate-800 sm:p-7 sm:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
