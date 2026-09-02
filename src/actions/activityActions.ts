'use server';

import { db } from '@/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { getCurrentSession } from '@/lib/auth';
import { formatRelativeTime } from '@/lib/formatTime';

export interface ActivityItem {
  id: string;
  type: 'pages' | 'users' | 'packages' | 'visas' | 'settings' | 'enquiries' | 'menus';
  action: string;
  user: string;
  userEmail?: string;
  badgeBg?: string;
  badgeTextColor?: string;
  details?: string;
  timestamp: string;
  timeAgo?: string;
}

export async function getRecentActivities(limit?: number): Promise<ActivityItem[]> {
  unstable_noStore();
  try {
    const setting = await db.select().from(siteSettings).where(eq(siteSettings.key, 'activity_logs')).limit(1);
    if (setting && setting.length > 0) {
      const parsed = JSON.parse(setting[0].value);
      if (Array.isArray(parsed)) {
        const enriched = parsed.map((item: ActivityItem) => ({
          ...item,
          timeAgo: formatRelativeTime(item.timestamp),
        }));
        return enriched.slice(0, limit || 100);
      }
    }
    return [];
  } catch (err) {
    console.error('getRecentActivities DB query failed:', err);
    return [];
  }
}

export async function logAdminActivityAction(entry: {
  type: 'pages' | 'users' | 'packages' | 'visas' | 'settings' | 'enquiries' | 'menus';
  action: string;
  user?: string;
  userEmail?: string;
  badgeBg?: string;
  badgeTextColor?: string;
  details?: string;
}) {
  try {
    let resolvedUser = entry.user;
    let resolvedEmail = entry.userEmail;
    let resolvedBadgeBg = entry.badgeBg;
    let resolvedBadgeTextColor = entry.badgeTextColor;

    if (!resolvedUser || !resolvedBadgeBg) {
      try {
        const session = await getCurrentSession();
        if (session) {
          resolvedUser = resolvedUser || session.name || session.email;
          resolvedEmail = resolvedEmail || session.email;
        }
      } catch (sessionErr) {
        // Ignore session extraction error
      }
    }

    const newActivity: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: entry.type,
      action: entry.action,
      user: resolvedUser || 'Administrator',
      userEmail: resolvedEmail || undefined,
      badgeBg: resolvedBadgeBg || undefined,
      badgeTextColor: resolvedBadgeTextColor || undefined,
      details: entry.details,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
    };

    let currentActivities: ActivityItem[] = [];
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, 'activity_logs')).limit(1);

    if (existing && existing.length > 0) {
      try {
        currentActivities = JSON.parse(existing[0].value);
        if (!Array.isArray(currentActivities)) currentActivities = [];
      } catch (e) {
        currentActivities = [];
      }
    }

    const newActivities = [newActivity, ...currentActivities].slice(0, 150);
    const json = JSON.stringify(newActivities);

    if (existing && existing.length > 0) {
      await db.update(siteSettings).set({ value: json, updatedAt: new Date() }).where(eq(siteSettings.key, 'activity_logs'));
    } else {
      await db.insert(siteSettings).values({ key: 'activity_logs', value: json });
    }

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
    await db.delete(siteSettings).where(eq(siteSettings.key, 'activity_logs'));
    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/activity');
    return { success: true };
  } catch (err: any) {
    console.error('clearActivityLogsAction failed:', err);
    return { success: false, error: err.message || 'Failed to clear activity logs' };
  }
}
