import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';

/**
 * Authoritative server-side protection for all /admin pages.
 * Keep requireAdmin() in each privileged Server Action and direct data-access
 * function. A layout guard alone cannot secure Server Actions or API routes.
 */
export default async function AdminAuthLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');
  return children;
}
