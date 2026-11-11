'use server';
import { requireAdmin } from '@/lib/requireAdmin';
import { db } from '@/db';
import { activityLogs, enquiries, notFoundHits, backendLogs, emailDeliveryLogs, sitemapLogs } from '@/db/schema';
import { and, count, gte, lt, isNull, eq, sql, type AnyColumn } from 'drizzle-orm';
import { ACTIVITY_CATEGORIES, type ActivityPeriod, classifyActivity, reportBounds } from '@/lib/activityAnalytics';

export async function getActivityAnalyticsAction(period: ActivityPeriod = '14d') {
  await requireAdmin();
  const { days, start, endExclusive, first, last } = reportBounds(period);
  // The DB runs in UTC. +05:00 groups events by local Asia/Karachi calendar day.
  const localDay = (column: AnyColumn) => sql<string>`DATE_FORMAT(DATE_ADD(${column}, INTERVAL 5 HOUR), '%Y-%m-%d')`;
  const activityDay = sql<string>`DATE_FORMAT(DATE_ADD(${activityLogs.createdAt}, INTERVAL 5 HOUR), '%Y-%m-%d')`;
  const activityType = sql<string>`CASE WHEN JSON_VALID(${activityLogs.newEntry}) THEN COALESCE(JSON_UNQUOTE(JSON_EXTRACT(${activityLogs.newEntry}, '$.type')), 'other') ELSE 'other' END`;
  const whereDates = (column: AnyColumn) => and(gte(column, start), lt(column, endExclusive));
  const [audit, forms, notFound, errors, deliveries, sitemap] = await Promise.all([
    db.select({ day: activityDay, type: activityType, action: activityLogs.name, total: count() })
      .from(activityLogs).where(and(gte(activityLogs.createdAt, start), lt(activityLogs.createdAt, endExclusive), isNull(activityLogs.deletedAt)))
      .groupBy(activityDay, activityType, activityLogs.name),
    db.select({ day: localDay(enquiries.createdAt), total: count() }).from(enquiries)
      .where(whereDates(enquiries.createdAt)).groupBy(localDay(enquiries.createdAt)),
    db.select({ day: localDay(notFoundHits.createdAt), total: count() }).from(notFoundHits)
      .where(and(gte(notFoundHits.createdAt, start), lt(notFoundHits.createdAt, endExclusive), isNull(notFoundHits.deletedAt)))
      .groupBy(localDay(notFoundHits.createdAt)),
    db.select({ day: localDay(backendLogs.createdAt), total: count() }).from(backendLogs)
      .where(and(gte(backendLogs.createdAt, start), lt(backendLogs.createdAt, endExclusive), isNull(backendLogs.deletedAt), eq(backendLogs.severity, 'error')))
      .groupBy(localDay(backendLogs.createdAt)),
    db.select({ day: localDay(emailDeliveryLogs.createdAt), total: count() }).from(emailDeliveryLogs)
      .where(and(gte(emailDeliveryLogs.createdAt, start), lt(emailDeliveryLogs.createdAt, endExclusive), isNull(emailDeliveryLogs.deletedAt)))
      .groupBy(localDay(emailDeliveryLogs.createdAt)),
    db.select({ day: localDay(sitemapLogs.createdAt), total: count() }).from(sitemapLogs)
      .where(and(gte(sitemapLogs.createdAt, start), lt(sitemapLogs.createdAt, endExclusive)))
      .groupBy(localDay(sitemapLogs.createdAt)),
  ]);
  const categories = ACTIVITY_CATEGORIES.map(c => ({ ...c, values: days.map(() => 0), total: 0 }));
  const lookup = new Map(categories.map(c => [c.key, c]));
  const keyIndex = new Map(days.map((d, i) => [d, i]));
  const add = (key: string, day: string, total: number) => {
    const entry = lookup.get(key);
    const index = keyIndex.get(String(day));
    if (entry && index !== undefined) { entry.values[index] += Number(total) || 0; entry.total += Number(total) || 0; }
  };
  for (const row of audit) {
    const key = classifyActivity(row.type, row.action);
    if (key) add(key, row.day, row.total);
  }
  for (const row of forms) add('frontend.forms', row.day, row.total);
  for (const row of notFound) add('frontend.404', row.day, row.total);
  for (const row of errors) add('system.errors', row.day, row.total);
  for (const row of deliveries) add('system.email', row.day, row.total);
  for (const row of sitemap) add('system.sitemap', row.day, row.total);
  return {
    period, first, last, days, categories,
    totals: {
      frontend: categories.filter(c => c.group === 'frontend').reduce((n, c) => n + c.total, 0),
      backend: categories.filter(c => c.group === 'backend').reduce((n, c) => n + c.total, 0),
      system: categories.filter(c => c.group === 'system').reduce((n, c) => n + c.total, 0),
    },
    generatedAt: new Date().toISOString(),
  };
}
