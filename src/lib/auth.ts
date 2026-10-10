import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface UserSession {
  userId: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'content_editor' | 'enquiry_manager' | 'seo_manager';
  loginTime?: number;
}

const COOKIE_NAME = 'bht_admin_session';
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
const EIGHT_HOURS_SEC = 8 * 60 * 60;

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function encodeSessionPayload(payload: string): string {
  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  const secret = process.env.BHT_SESSION_SECRET;
  return secret ? `${encoded}.${signPayload(encoded, secret)}` : encoded;
}

function decodeSessionPayload(raw: string): string | null {
  const secret = process.env.BHT_SESSION_SECRET;
  if (!secret) return Buffer.from(raw, 'base64url').toString('utf8');
  const parts = raw.split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const supplied = Buffer.from(parts[1], 'utf8');
  const expected = Buffer.from(signPayload(parts[0], secret), 'utf8');
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  return Buffer.from(parts[0], 'base64url').toString('utf8');
}

export async function createSessionCookie(user: Omit<UserSession, 'loginTime'> & { loginTime?: number }): Promise<void> {
  const cookieStore = await cookies();
  const loginTime = user.loginTime || Date.now();
  const expiresAt = loginTime + EIGHT_HOURS_MS;

  const sessionData = JSON.stringify({
    ...user,
    loginTime,
    expiresAt,
  });

  cookieStore.set(COOKIE_NAME, encodeSessionPayload(sessionData), {
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

    const decoded = decodeSessionPayload(cookie.value);
    if (!decoded) return null;
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
