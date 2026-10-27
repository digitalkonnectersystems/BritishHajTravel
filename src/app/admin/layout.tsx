import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import AdminSessionProvider from '@/components/admin/AdminSessionProvider';

/**
 * Authenticate once at the /admin layout boundary, then pass the real
 * session identity to every client page and sidebar. Keep server-side
 * permission checks in privileged actions and API routes as well.
 */
export default async function AdminAuthLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect('/letstravel');

  return (
    <AdminSessionProvider
      user={{
        name: session.name,
        role: session.role,
        email: session.email,
        loginTime: session.loginTime,
      }}
    >
      {children}
    </AdminSessionProvider>
  );
}
