'use server';

import { requireAdmin } from '@/lib/requireAdmin';

import { db } from '@/db';
import { users, siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/password';
import { randomBytes } from 'node:crypto';
import { logAdminActivityAction } from '@/actions/activityActions';
import { formatRelativeTime } from '@/lib/formatTime';
import { getCurrentSession } from '@/lib/auth';

export interface UserPresenceInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  badgeBg: string;
  badgeTextColor: string;
  isOnline: boolean;
  lastSeen?: number;
  lastSeenAgo?: string;
}

export async function recordUserHeartbeatAction(userData?: {
  email: string;
  name?: string;
  role?: string;
  badgeBg?: string;
  badgeTextColor?: string;
}) {
  try {
    const session = await getCurrentSession();
    if (!session?.email) return { success: false, error: 'Authentication required' };
    const email = session.email.trim().toLowerCase();
    const name = session.name;
    const role = session.role;
    const badgeBg = userData?.badgeBg;
    const badgeTextColor = userData?.badgeTextColor;

    const now = Date.now();
    let presenceMap: Record<string, { name: string; role: string; lastSeen: number; badgeBg?: string; badgeTextColor?: string }> = {};

    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'user_presence')).limit(1);
    if (existing && existing.length > 0) {
      try {
        presenceMap = JSON.parse(existing[0].value) || {};
      } catch (e) {
        presenceMap = {};
      }
    }

    presenceMap[email] = {
      name: name || presenceMap[email]?.name || 'Admin',
      role: role || presenceMap[email]?.role || 'admin',
      badgeBg: badgeBg || presenceMap[email]?.badgeBg || '#0F766E',
      badgeTextColor: badgeTextColor || presenceMap[email]?.badgeTextColor || '#FFFFFF',
      lastSeen: now,
    };

    const json = JSON.stringify(presenceMap);
    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: json, updatedAt: new Date() }).where(eq(siteSettings.key, 'user_presence'));
    } else {
      await db.insert(siteSettings).values({ key: 'user_presence', value: json });
    }

    return { success: true, timestamp: now };
  } catch (err: any) {
    console.error('recordUserHeartbeatAction error:', err);
    return { success: false };
  }
}

export async function getUsersPresenceAction(): Promise<UserPresenceInfo[]> {
  await requireAdmin(['admin']);

  try {
    const list = await getUsersList();
    let presenceMap: Record<string, { lastSeen: number }> = {};

    try {
      const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'user_presence')).limit(1);
      if (existing && existing.length > 0) {
        presenceMap = JSON.parse(existing[0].value) || {};
      }
    } catch (e) {
      presenceMap = {};
    }

    const now = Date.now();
    const ONLINE_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutes

    const results: UserPresenceInfo[] = list.map((u) => {
      const emailLower = (u.email || '').toLowerCase();
      const pData = presenceMap[emailLower];
      const lastSeen = pData?.lastSeen || undefined;
      const isOnline = lastSeen ? now - lastSeen <= ONLINE_THRESHOLD_MS : false;
      const lastSeenAgo = lastSeen ? formatRelativeTime(lastSeen) : 'Offline';

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: Boolean(u.active),
        badgeBg: u.badgeBg || '#0F766E',
        badgeTextColor: u.badgeTextColor || '#FFFFFF',
        isOnline,
        lastSeen,
        lastSeenAgo: isOnline ? 'Active now' : lastSeenAgo,
      };
    });

    return results;
  } catch (err: any) {
    console.error('getUsersPresenceAction error:', err);
    return [];
  }
}

export async function getUsersList() {
  await requireAdmin(['admin']);

  try {
    // Explicit projection never returns password hashes to client callers.
    return await db.select({
      id: users.id, name: users.name, email: users.email,
      role: users.role, active: users.active, badgeBg: users.badgeBg,
      badgeTextColor: users.badgeTextColor, createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);
  } catch (err) {
    console.error('getUsersList DB query failed:', err);
    return [];
  }
}

export async function createUserAction(data: {
  name: string;
  email: string;
  password?: string;
  role: string;
  active: boolean;
  badgeBg?: string;
  badgeTextColor?: string;
}) {
  const actor = await requireAdmin(['admin']);

  try {
    const emailLower = data.email.trim().toLowerCase();

    const allowedRoles = ['super_admin', 'admin', 'content_editor', 'enquiry_manager', 'seo_manager'];
    if (!allowedRoles.includes(data.role)) return { success: false, error: 'Invalid account role.' };
    if (data.role === 'super_admin' && actor.role !== 'super_admin') {
      return { success: false, error: 'Only a super administrator can grant this role.' };
    }

    // Check duplicate in MySQL DB
    const existing = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    if (existing && existing.length > 0) {
      return { success: false, error: 'User with this email already exists in database.' };
    }

    let plainPassword = data.password && data.password.trim() ? data.password.trim() : '';
    if (!plainPassword) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      const bytes = randomBytes(12);
      for (let i = 0; i < 12; i++) {
        plainPassword += chars[bytes[i] % chars.length];
      }
    }
    if (plainPassword.length < 12) return { success: false, error: 'Passwords must be at least 12 characters.' };
    const hashedPassword = hashPassword(plainPassword);

    const newUserObj = {
      name: data.name.trim(),
      email: emailLower,
      passwordHash: hashedPassword,
      role: (data.role || 'admin') as any,
      active: data.active,
      badgeBg: data.badgeBg || '#0F766E',
      badgeTextColor: data.badgeTextColor || '#FFFFFF',
    };

    const res = await db.insert(users).values(newUserObj);
    const insertId = res && res[0]?.insertId ? Number(res[0].insertId) : 0;

    // Log Activity
    await logAdminActivityAction({
      type: 'users',
      action: 'Created User Account',
      details: `Created "${newUserObj.name}" with role (${newUserObj.role}) - ${newUserObj.email}`,
    });

    revalidatePath('/admin/settings');
    revalidatePath('/admin/activity');
    return {
      success: true,
      user: {
        id: insertId,
        name: newUserObj.name,
        email: newUserObj.email,
        role: newUserObj.role,
        active: newUserObj.active,
        badgeBg: newUserObj.badgeBg,
        badgeTextColor: newUserObj.badgeTextColor,
        createdAt: new Date(),
      },
    };
  } catch (err: any) {
    console.error('createUserAction DB insert error:', err);
    return { success: false, error: err.message || 'Failed to create user in database.' };
  }
}

export async function updateUserAction(
  id: number,
  data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    active: boolean;
    badgeBg?: string;
    badgeTextColor?: string;
  }
) {
  const actor = await requireAdmin(['admin']);

  try {
    const emailLower = data.email.trim().toLowerCase();

    const allowedRoles = ['super_admin', 'admin', 'content_editor', 'enquiry_manager', 'seo_manager'];
    if (!allowedRoles.includes(data.role)) return { success: false, error: 'Invalid account role.' };
    const targetRoleRows = await db.select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1);
    if (!targetRoleRows.length) return { success: false, error: 'Account not found.' };
    if (actor.role !== 'super_admin' && (targetRoleRows[0].role === 'super_admin' || data.role === 'super_admin')) {
      return { success: false, error: 'Only a super administrator can change this account.' };
    }
    if (actor.userId === id && !data.active) return { success: false, error: 'You cannot disable your own account.' };

    const updateObj: any = {
      name: data.name.trim(),
      email: emailLower,
      role: data.role,
      active: data.active,
      badgeBg: data.badgeBg || '#0F766E',
      badgeTextColor: data.badgeTextColor || '#FFFFFF',
      updatedAt: new Date(),
    };

    // Only update passwordHash if new password is provided
    if (data.password && data.password.trim().length > 0) {
      if (data.password.trim().length < 12) return { success: false, error: 'Passwords must be at least 12 characters.' };
      updateObj.passwordHash = hashPassword(data.password.trim());
    }

    const beforeRows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    const sanitizeUserAudit = (row: any) => row ? ({
      id: row.id, name: row.name, email: row.email, role: row.role, active: row.active,
      badgeBg: row.badgeBg, badgeTextColor: row.badgeTextColor
    }) : null;
    const previousEntry = sanitizeUserAudit(beforeRows[0]);

    await db.update(users).set(updateObj).where(eq(users.id, id));
    const afterRows = await db.select().from(users).where(eq(users.id, id)).limit(1);

    await logAdminActivityAction({
      type: 'users',
      action: 'Updated User Account',
      details: `Updated "${updateObj.name}" (${updateObj.role}) - Active: ${updateObj.active ? 'Yes' : 'No'}`,
      previousEntry,
      newEntry: sanitizeUserAudit(afterRows[0]),
    });

    revalidatePath('/admin/settings');
    revalidatePath('/admin/activity');
    return { success: true };
  } catch (err: any) {
    console.error('updateUserAction DB update error:', err);
    return { success: false, error: err.message || 'Failed to update user in database.' };
  }
}

export async function deleteUserAction(id: number) {
  const actor = await requireAdmin(['admin']);

  if (actor.userId === id) return { success: false, error: 'You cannot delete your own account.' };
  try {
    let userName = `User #${id}`;
    try {
      const found = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (found && found.length > 0) {
        userName = `"${found[0].name}" (${found[0].email})`;
      }
    } catch (e) { }

    const targetRoleRows = await db.select({ role: users.role }).from(users).where(eq(users.id, id)).limit(1);
    if (actor.role !== 'super_admin' && targetRoleRows[0]?.role === 'super_admin') {
      return { success: false, error: 'Only a super administrator can delete this account.' };
    }
    await db.delete(users).where(eq(users.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'users',
      action: 'Deleted User Account',
      details: `Permanently removed user account: ${userName}`,
    });

    revalidatePath('/admin/settings');
    revalidatePath('/admin/activity');
    return { success: true };
  } catch (err: any) {
    console.error('deleteUserAction DB delete error:', err);
    return { success: false, error: err.message || 'Failed to delete user from database.' };
  }
}
