"use client";

import { createContext, useContext } from "react";
import type { UserSession } from "@/lib/auth";

const AdminSessionContext = createContext<UserSession | null>(null);

export function AdminSessionProvider({ session, children }: { session: UserSession; children: React.ReactNode }) {
  return <AdminSessionContext.Provider value={session}>{children}</AdminSessionContext.Provider>;
}

export function useAdminSession() {
  return useContext(AdminSessionContext);
}
