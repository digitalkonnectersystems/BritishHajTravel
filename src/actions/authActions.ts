'use server';

import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createSessionCookie, destroySession, getCurrentSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { verifyPassword, hashPassword, needsPasswordRehash } from '@/lib/password';
import { requireAdmin } from '@/lib/requireAdmin';
import { logAdminActivityAction } from '@/actions/activityActions';
import { recordUserHeartbeatAction } from '@/actions/userActions';

export async function adminLogin(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  let stage = 'database lookup';
  try {
    // Select only the fields needed for authentication. This avoids failing
    // because of unrelated missing columns (for example, display badge fields).
    const userList = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      passwordHash: users.passwordHash,
      role: users.role,
      active: users.active,
    }).from(users).where(eq(users.email, email)).limit(1);

    if (!userList.length) return { success: false, error: 'Invalid Credentials.' };
    const user = userList[0];

    if (!user.active) {
      return { success: false, error: 'This user account is currently disabled.' };
    }

    stage = 'password verification';
    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: 'Invalid Credentials.' };
    }

    stage = 'password hash upgrade';
    if (needsPasswordRehash(user.passwordHash)) {
      await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, user.id));
    }

    stage = 'session creation';
    await createSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // These operations are useful but must not turn a valid login into a failure.
    // In particular, the activity logger's requireAdmin() may throw if the
    // newly written cookie is not yet visible to this Server Action.
    try {
      const presence = await recordUserHeartbeatAction({
        email: user.email,
        name: user.name,
        role: user.role,
        badgeBg: '#0F766E',
        badgeTextColor: '#FFFFFF',
      });
      if (!presence.success) console.warn('[adminLogin] Presence update skipped.');
    } catch (err) {
      console.error('[adminLogin] Nonfatal presence error:', err);
    }

    try {
      const audit = await logAdminActivityAction({
        type: 'users',
        action: 'User Logged In',
        user: user.name,
        userEmail: user.email,
        details: `Successful sign-in to Admin Portal (${user.role})`,
      });
      if (!audit.success) console.warn('[adminLogin] Login audit skipped.');
    } catch (err) {
      console.error('[adminLogin] Nonfatal login audit error:', err);
    }
  } catch (err) {
    // The actual diagnostic stays in server logs, not the public login UI.
    // Never log plaintext passwords, hashes, or session cookies.
    console.error(`[adminLogin] Failed during ${stage}:`, err);
    return { success: false, error: 'Authentication failed.' };
  }

  // A Next.js redirect is an exception internally. Keep it outside the try/catch.
  redirect('/admin/dashboard');
}

export async function adminLogout() {
  try {
    const session = await getCurrentSession();
    if (session) {
      await logAdminActivityAction({
        type: 'users',
        action: 'User Logged Out',
        user: session.name,
        userEmail: session.email,
        details: 'Admin user session terminated',
      });
    }
  } catch (e) { }

  await destroySession();
  return redirect('/letstravel');
}

/** Public reset-by-email was insecure. Use a verified administrator account instead. */
export async function verifyResetEmail(_formData: FormData) {
  return { success: false, error: 'Password recovery requires an administrator. Contact your site administrator.' };
}

/** Authenticated super-admin password change only. Not a public forgot-password endpoint. */
export async function resetAdminPassword(formData: FormData) {
  try {
    await requireAdmin(['super_admin']);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '');
    if (!email || password.length < 12) return { success: false, error: 'Email and a password of at least 12 characters are required.' };
    const list = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (!list.length) return { success: false, error: 'User not found.' };
    await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, list[0].id));
    return { success: true, message: 'Password updated by the administrator.' };
  } catch {
    return { success: false, error: 'Administrator authorization required.' };
  }
}
