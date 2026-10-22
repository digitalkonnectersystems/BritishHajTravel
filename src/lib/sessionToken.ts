import { createHmac, timingSafeEqual } from 'node:crypto';
import { getSessionSecret } from '@/lib/sessionSecret';

export interface SignedSessionPayload {
  userId: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'content_editor' | 'enquiry_manager' | 'seo_manager';
  loginTime: number;
  expiresAt: number;
}

const VALID_ROLES = new Set(['super_admin', 'admin', 'content_editor', 'enquiry_manager', 'seo_manager']);
const MAX_AGE = 8 * 60 * 60 * 1000;

export async function signSession(value: SignedSessionPayload): Promise<string> {
  const encoded = Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
  const signature = createHmac('sha256', await getSessionSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export async function verifySession(raw: string | undefined): Promise<SignedSessionPayload | null> {
  if (!raw || raw.length > 8192) return null;
  try {
    const parts = raw.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    const expected = Buffer.from(createHmac('sha256', await getSessionSecret()).update(parts[0]).digest('base64url'));
    const received = Buffer.from(parts[1]);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
    const obj: unknown = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
    const s = obj as Record<string, unknown>;
    if (typeof s.userId !== 'number' || !Number.isSafeInteger(s.userId) || s.userId <= 0 ||
        typeof s.name !== 'string' || typeof s.email !== 'string' ||
        typeof s.role !== 'string' || !VALID_ROLES.has(s.role) ||
        typeof s.loginTime !== 'number' || typeof s.expiresAt !== 'number') return null;
    const now = Date.now();
    if (s.loginTime > now + 60000 || s.loginTime <= 0 ||
        s.expiresAt <= now || s.expiresAt - s.loginTime !== MAX_AGE) return null;
    return s as unknown as SignedSessionPayload;
  } catch { return null; }
}
