import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import { AdminSessionProvider } from '@/components/admin/AdminSessionContext';

export default async function AdminAuthLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  return <AdminSessionProvider session={session}>{children}</AdminSessionProvider>;
}