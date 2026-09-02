'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

interface FrontendMaintenanceWrapperProps {
  children: React.ReactNode;
  initialMaintenanceMode?: boolean;
}

export default function FrontendMaintenanceWrapper({
  children,
  initialMaintenanceMode = false,
}: FrontendMaintenanceWrapperProps) {
  const pathname = usePathname();
  const [maintenance, setMaintenance] = useState(initialMaintenanceMode);

  useEffect(() => {
    // Listen to custom maintenance updates if saved live from admin panel
    const handleMaintenanceUpdate = (e: CustomEvent) => {
      if (typeof e.detail?.maintenanceMode === 'boolean') {
        setMaintenance(e.detail.maintenanceMode);
      }
    };

    window.addEventListener('maintenance_updated' as any, handleMaintenanceUpdate);
    return () => {
      window.removeEventListener('maintenance_updated' as any, handleMaintenanceUpdate);
    };
  }, []);

  const isAdminRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/letstravel');

  // Maintenance mode ONLY applies to frontend public routes, NEVER to admin panel or login
  if (maintenance && !isAdminRoute) {
    return (
      <div className="min-h-screen bg-[#071310] text-[#FBF8F1] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-center">
        {/* Background glow effects */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#DB9E30_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] opacity-40 pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-gold rounded-full blur-[140px] opacity-20 pointer-events-none" />

        <div className="max-w-xl w-full bg-[#132723]/90 backdrop-blur-md rounded-3xl p-8 lg:p-12 border border-[#DB9E30]/30 shadow-2xl relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gold/15 border border-[#DB9E30]/40 flex items-center justify-center text-3xl mb-6 shadow-inner">
            🛠️
          </div>

          <div className="inline-flex items-center gap-2 bg-gold/10 border border-[#DB9E30]/30 px-3 py-1 rounded-full text-[11px] font-bold text-gold uppercase tracking-widest mb-4">
            System Maintenance In Progress
          </div>

          <h1 className="text-3xl lg:text-4xl font-serif text-white mb-4">
            We&apos;ll Be Back Soon!
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            Our platform is currently undergoing scheduled maintenance and upgrades to serve you better. We apologize for any inconvenience.
          </p>

          <div className="w-full pt-6 border-t border-slate-700/60 flex flex-col items-center justify-center gap-6 text-xs text-slate-400">
            <div className="text-center gap-4">
              Urgent Enquiries?<br />
              Email:{' '}
              <a href="mailto:saudivisa@kingtravelcan.com" className="text-gold underline font-semibold">
                saudivisa@kingtravelcan.com
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
