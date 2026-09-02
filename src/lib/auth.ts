import { cookies } from 'next/headers';

export interface UserSession {
  userId: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'content_editor' | 'enquiry_manager' | 'seo_manager';
  loginTime?: number;
}

const COOKIE_NAME = 'king_travel_session';
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
const EIGHT_HOURS_SEC = 8 * 60 * 60;

export async function createSessionCookie(user: Omit<UserSession, 'loginTime'> & { loginTime?: number }): Promise<void> {
  const cookieStore = await cookies();
  const loginTime = user.loginTime || Date.now();
  const expiresAt = loginTime + EIGHT_HOURS_MS;

  const sessionData = JSON.stringify({
    ...user,
    loginTime,
    expiresAt,
  });

  cookieStore.set(COOKIE_NAME, Buffer.from(sessionData).toString('base64'), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: EIGHT_HOURS_SEC,
  });
}

export async function getCurrentSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const decoded = Buffer.from(cookie.value, 'base64').toString('utf-8');
    const session = JSON.parse(decoded);

    const loginTime = session.loginTime || (session.expiresAt ? session.expiresAt - EIGHT_HOURS_MS : Date.now());
    const sessionEndTime = loginTime + EIGHT_HOURS_MS;

    if (Date.now() >= sessionEndTime) {
      return null;
    }

    return {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      loginTime,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function hasPermission(
  userRole: UserSession['role'],
  requiredRole: 'super_admin' | 'admin' | 'content_editor' | 'enquiry_manager' | 'seo_manager'
): boolean {
  if (userRole === 'super_admin') return true;
  if (userRole === 'admin') return requiredRole !== 'super_admin';
  if (userRole === requiredRole) return true;
  return false;
}
