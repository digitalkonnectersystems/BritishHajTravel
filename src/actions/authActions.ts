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
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const userList = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!userList.length) return { success: false, error: 'Invalid Credentials.' };

    const user = userList[0];

    // Check account status
    if (!user.active) {
      return { success: false, error: 'This user account is currently disabled.' };
    }

    // Verify only the password hash stored for this user. There are no
    // hard-coded project passwords or bypass credentials.
    const isValid = verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: 'Invalid Credentials.' };
    }

    // Upgrade successfully verified legacy password hashes on login.
    if (needsPasswordRehash(user.passwordHash)) {
      await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, user.id));
    }

    await createSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Record presence heartbeat & activity
    await recordUserHeartbeatAction({
      email: user.email,
      name: user.name,
      role: user.role,
      badgeBg: user.badgeBg,
      badgeTextColor: user.badgeTextColor,
    });
    await logAdminActivityAction({
      type: 'users',
      action: 'User Logged In',
      user: user.name,
      userEmail: user.email,
      details: `Successful sign-in to Admin Portal (${user.role})`,
    });

    return redirect('/admin/dashboard');
  } catch (error: any) {
    if (error.message?.includes('NEXT_REDIRECT')) throw error;
    return { success: false, error: 'Authentication failed.' };
  }
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
