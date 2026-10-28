import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/lib/auth';
import AdminSessionProvider from '@/components/admin/AdminSessionProvider';
import MediaPickerProvider from '@/components/admin/MediaPickerProvider';

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
      <MediaPickerProvider>{children}</MediaPickerProvider>
    </AdminSessionProvider>
  );
}
