import { cookies } from 'next/headers';
import { signSession, verifySession } from '@/lib/sessionToken';

export interface UserSession {
  userId: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'content_editor' | 'enquiry_manager' | 'seo_manager';
  loginTime?: number;
}

const COOKIE_NAME = 'bht_admin_session';
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;

export async function createSessionCookie(user: Omit<UserSession, 'loginTime'> & { loginTime?: number }): Promise<void> {
  const loginTime = Date.now();
  const value = signSession({ ...user, loginTime, expiresAt: loginTime + EIGHT_HOURS_MS });
  (await cookies()).set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: EIGHT_HOURS_MS / 1000,
  });
}

export async function getCurrentSession(): Promise<UserSession | null> {
  const raw = (await cookies()).get(COOKIE_NAME)?.value;
  const session = verifySession(raw);
  if (!session) return null;
  const { userId, email, name, role, loginTime } = session;
  return { userId, email, name, role, loginTime };
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

export function hasPermission(userRole: UserSession['role'], requiredRole: UserSession['role']): boolean {
  if (userRole === 'super_admin') return true;
  if (userRole === 'admin') return requiredRole !== 'super_admin';
  return userRole === requiredRole;
}
