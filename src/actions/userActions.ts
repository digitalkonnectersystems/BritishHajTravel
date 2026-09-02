'use server';

import { db } from '@/db';
import { users, siteSettings } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { hashPassword } from '@/lib/password';
import { logAdminActivityAction } from '@/actions/activityActions';
import { formatRelativeTime } from '@/lib/formatTime';
import { getCurrentSession } from '@/lib/auth';

let ensureColumnsRan = false;

async function ensureUserColumnsExist() {
  if (ensureColumnsRan) return;
  ensureColumnsRan = true;
  try {
    await db.execute(sql`ALTER TABLE \`users\` ADD COLUMN \`badge_bg\` varchar(32) DEFAULT '#0F766E'`);
  } catch (e) { }
  try {
    await db.execute(sql`ALTER TABLE \`users\` ADD COLUMN \`badge_text_color\` varchar(32) DEFAULT '#FFFFFF'`);
  } catch (e) { }
}

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
    let email = userData?.email?.trim().toLowerCase();
    let name = userData?.name;
    let role = userData?.role;
    let badgeBg = userData?.badgeBg;
    let badgeTextColor = userData?.badgeTextColor;

    if (!email) {
      const session = await getCurrentSession();
      if (session?.email) {
        email = session.email.toLowerCase();
        name = name || session.name;
        role = role || session.role;
      }
    }

    if (!email) return { success: false, error: 'No session email found' };

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
  try {
    await ensureUserColumnsExist();
    let list = await db.select().from(users);

    // If database table is empty, seed default admin user into database
    if (!list || list.length === 0) {
      const initEmail = (process.env.INITIAL_ADMIN_EMAIL || '').trim().toLowerCase();
      const initPwd = process.env.INITIAL_ADMIN_PASSWORD || '';
      const defaultUser = {
        name: 'Hassan',
        email: initEmail,
        passwordHash: hashPassword(initPwd),
        role: 'super_admin' as const,
        active: true,
        badgeBg: '#64F900',
        badgeTextColor: '#000000',
      };
      try {
        await db.insert(users).values(defaultUser);
        list = await db.select().from(users);
      } catch (seedErr) {
        console.error('Failed to seed default admin user to DB:', seedErr);
      }
    }

    return list || [];
  } catch (err: any) {
    if (err?.message?.includes('badge_bg') || err?.code === 'ER_BAD_FIELD_ERROR') {
      try {
        ensureColumnsRan = false;
        await ensureUserColumnsExist();
        const retryList = await db.select().from(users);
        return retryList || [];
      } catch (retryErr) {
        console.error('Retry getUsersList failed:', retryErr);
      }
    }
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
  try {
    await ensureUserColumnsExist();
    const emailLower = data.email.trim().toLowerCase();

    // Check duplicate in MySQL DB
    const existing = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    if (existing && existing.length > 0) {
      return { success: false, error: 'User with this email already exists in database.' };
    }

    let plainPassword = data.password && data.password.trim() ? data.password.trim() : '';
    if (!plainPassword) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      const bytes = require('crypto').randomBytes(12);
      for (let i = 0; i < 12; i++) {
        plainPassword += chars[bytes[i] % chars.length];
      }
    }
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
        ...newUserObj,
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
  try {
    await ensureUserColumnsExist();
    const emailLower = data.email.trim().toLowerCase();

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
      updateObj.passwordHash = hashPassword(data.password.trim());
    }

    await db.update(users).set(updateObj).where(eq(users.id, id));

    // Log Activity
    await logAdminActivityAction({
      type: 'users',
      action: 'Updated User Account',
      details: `Updated "${updateObj.name}" (${updateObj.role}) - Active: ${updateObj.active ? 'Yes' : 'No'}`,
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
  try {
    let userName = `User #${id}`;
    try {
      const found = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (found && found.length > 0) {
        userName = `"${found[0].name}" (${found[0].email})`;
      }
    } catch (e) { }

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
