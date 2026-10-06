'use server';

import { db } from '@/db';
import { activityLogs, users } from '@/db/schema';
import { desc, isNull, inArray } from 'drizzle-orm';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { headers } from 'next/headers';
import { getCurrentSession } from '@/lib/auth';
import { formatRelativeTime } from '@/lib/formatTime';

export interface ActivityItem {
  id: string | number;
  type: 'pages' | 'users' | 'packages' | 'visas' | 'settings' | 'enquiries' | 'menus' | 'blogs' | 'auth' | string;
  action: string;
  status?: string;
  user: string;
  userEmail?: string;
  badgeBg?: string;
  badgeTextColor?: string;
  details?: string;
  ipAddress?: string | null;
  previousEntry?: unknown;
  newEntry?: unknown;
  timestamp: string;
  timeAgo?: string;
}

type ActivityPayload = {
  type: ActivityItem['type'];
  action: string;
  user?: string;
  userEmail?: string;
  badgeBg?: string;
  badgeTextColor?: string;
  details?: string | Record<string, unknown> | null;
  previousEntry?: unknown;
  newEntry?: unknown;
  before?: unknown;
  after?: unknown;
  status?: string;
};

function inferStatus(action: string): string {
  const value = String(action || '').toLowerCase();
  if (value.includes('login')) return 'LOGIN';
  if (value.includes('logout')) return 'LOGOUT';
  if (value.includes('delete') || value.includes('remove') || value.includes('clear')) return 'DELETE';
  if (value.includes('create') || value.includes('add') || value.includes('insert') || value.includes('new ')) return 'CREATE';
  if (value.includes('status') || value.includes('toggle') || value.includes('publish')) return 'STATUS_CHANGE';
  return 'UPDATE';
}

function safeParse(value: string | null | undefined): any {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function getRequestIp(): Promise<string | null> {
  try {
    const headerStore = await headers();
    return (
      headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerStore.get('x-real-ip') ||
      headerStore.get('cf-connecting-ip') ||
      null
    );
  } catch {
    return null;
  }
}

export async function getRecentActivities(limit: number = 100): Promise<ActivityItem[]> {
  unstable_noStore();
  try {
    const safeLimit = Math.min(500, Math.max(1, Number(limit) || 100));
    const rows = await db
      .select()
      .from(activityLogs)
      .where(isNull(activityLogs.deletedAt))
      .orderBy(desc(activityLogs.createdAt))
      .limit(safeLimit);

    const userIds = Array.from(new Set(rows.map((row) => row.userId).filter((id): id is number => typeof id === 'number')));
    const userMap = new Map<number, { name: string; email: string; badgeBg?: string; badgeTextColor?: string }>();

    if (userIds.length > 0) {
      try {
        const dbUsers = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            badgeBg: users.badgeBg,
            badgeTextColor: users.badgeTextColor,
          })
          .from(users)
          .where(inArray(users.id, userIds));

        for (const user of dbUsers) {
          userMap.set(user.id, {
            name: user.name,
            email: user.email,
            badgeBg: user.badgeBg || undefined,
            badgeTextColor: user.badgeTextColor || undefined,
          });
        }
      } catch (userErr) {
        console.warn('getRecentActivities user lookup warning:', userErr);
      }
    }

    return rows.map((row) => {
      const newEntry = safeParse(row.newEntry);
      const previousEntry = safeParse(row.previousEntry);
      const userMeta = row.userId ? userMap.get(row.userId) : undefined;
      const timestamp = row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString();

      return {
        id: row.id,
        type: newEntry?.type || 'settings',
        action: row.name,
        status: row.status,
        user: newEntry?.user || userMeta?.name || 'Administrator',
        userEmail: newEntry?.userEmail || userMeta?.email || undefined,
        badgeBg: newEntry?.badgeBg || userMeta?.badgeBg,
        badgeTextColor: newEntry?.badgeTextColor || userMeta?.badgeTextColor,
        details: typeof newEntry?.details === 'string'
          ? newEntry.details
          : newEntry?.details
            ? JSON.stringify(newEntry.details)
            : undefined,
        ipAddress: row.ipAddress,
        previousEntry,
        newEntry,
        timestamp,
        timeAgo: formatRelativeTime(timestamp),
      };
    });
  } catch (err) {
    console.error('getRecentActivities DB query failed:', err);
    return [];
  }
}

export async function logAdminActivityAction(entry: ActivityPayload) {
  try {
    let resolvedUser = entry.user;
    let resolvedEmail = entry.userEmail;
    let resolvedUserId: number | null = null;

    try {
      const session = await getCurrentSession();
      if (session) {
        resolvedUserId = session.userId || null;
        resolvedUser = resolvedUser || session.name || session.email;
        resolvedEmail = resolvedEmail || session.email;
      }
    } catch {
      // Activity logging must never block the originating admin operation.
    }

    const previousEntry = entry.previousEntry ?? entry.before ?? null;
    const explicitNewEntry = entry.newEntry ?? entry.after;
    const newEntry = {
      type: entry.type,
      user: resolvedUser || 'Administrator',
      userEmail: resolvedEmail || null,
      badgeBg: entry.badgeBg || null,
      badgeTextColor: entry.badgeTextColor || null,
      details: entry.details ?? null,
      entry: explicitNewEntry ?? null,
    };

    await db.insert(activityLogs).values({
      name: entry.action,
      status: entry.status || inferStatus(entry.action),
      userId: resolvedUserId,
      ipAddress: await getRequestIp(),
      previousEntry: previousEntry === null ? null : JSON.stringify(previousEntry),
      newEntry: JSON.stringify(newEntry),
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/activity');
    return { success: true };
  } catch (err: any) {
    console.error('logAdminActivityAction failed:', err);
    return { success: false, error: err.message || 'Failed to log activity' };
  }
}

export async function clearActivityLogsAction() {
  try {
    await db
      .update(activityLogs)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(isNull(activityLogs.deletedAt));
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/activity');
    return { success: true };
  } catch (err: any) {
    console.error('clearActivityLogsAction failed:', err);
    return { success: false, error: err.message || 'Failed to clear activity logs' };
  }
}
