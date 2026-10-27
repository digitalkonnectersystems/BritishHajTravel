'use client';

import { createContext, useContext, type ReactNode } from 'react';

/**
 * The server-side /admin layout supplies the authenticated session.
 * Do not take a role from a client page or a hard-coded display label.
 */
export interface AdminSessionIdentity {
  name: string;
  role: 'super_admin' | 'admin' | 'content_editor' | 'enquiry_manager' | 'seo_manager';
  email?: string;
  loginTime?: number;
}

const AdminSessionContext = createContext<AdminSessionIdentity | null>(null);

export default function AdminSessionProvider({
  user,
  children,
}: {
  user: AdminSessionIdentity;
  children: ReactNode;
}) {
  return (
    <AdminSessionContext.Provider value={user}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSessionIdentity {
  const session = useContext(AdminSessionContext);
  if (!session) {
    throw new Error('AdminLayout must be rendered inside the authenticated /admin layout.');
  }
  return session;
}
