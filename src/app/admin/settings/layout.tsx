import { getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export default async function SettingsLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  if (!['super_admin', 'admin'].includes(session.role)) redirect('/admin/dashboard');
  return children;
}
