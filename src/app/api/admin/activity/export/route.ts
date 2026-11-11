import { NextRequest, NextResponse } from 'next/server';
import { getCurrentSession } from '@/lib/auth';
import { db } from '@/db';
import { activityLogs, users } from '@/db/schema';
import { and, asc, eq, gte, isNull, lt } from 'drizzle-orm';
import { classifyActivity, validateActivityExportDates } from '@/lib/activityAnalytics';
import { activityReportPdf, type ActivityExportRow } from '@/lib/activityReportPdf';
import { logAdminActivityAction } from '@/actions/activityActions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_RECORDS = 20000;
function safeCsvField(value: string) {
  let text = String(value ?? '').replace(/\u0000/g, '');
  // Prevent Excel/LibreOffice from interpreting untrusted audit details as formulas.
  if (/^\s*[=+@\-\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
function clean(value: unknown, max = 1000) { return typeof value === 'string' ? value.slice(0, max) : ''; }

export async function GET(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session || !['super_admin','admin'].includes(session.role)) return NextResponse.json({ error: 'Admin permission required' }, { status: 403 });
  const url = new URL(request.url);
  const from = url.searchParams.get('from') || '';
  const to = url.searchParams.get('to') || '';
  const format = url.searchParams.get('format') || '';
  if (format !== 'csv' && format !== 'pdf') return NextResponse.json({error:'Choose CSV or PDF'}, {status:400});
  let bounds: ReturnType<typeof validateActivityExportDates>;
  try { bounds = validateActivityExportDates(from, to); }
  catch (error) { return NextResponse.json({error: error instanceof Error ? error.message : 'Invalid dates'}, {status:400}); }
  try {
    const rows = await db.select({
      id: activityLogs.id,
      createdAt: activityLogs.createdAt,
      action: activityLogs.name,
      status: activityLogs.status,
      typeData: activityLogs.newEntry,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
      userEmail: users.email,
    }).from(activityLogs)
      .leftJoin(users, eq(activityLogs.userId, users.id))
      .where(and(isNull(activityLogs.deletedAt), gte(activityLogs.createdAt, bounds.start), lt(activityLogs.createdAt, bounds.endExclusive)))
      .orderBy(asc(activityLogs.createdAt), asc(activityLogs.id))
      .limit(MAX_RECORDS + 1);
    if (rows.length > MAX_RECORDS) return NextResponse.json({error:`Too many entries for one export (over ${MAX_RECORDS}). Select a shorter date range.`}, {status:413});
    const output: ActivityExportRow[] = rows.map(row => {
      let info: Record<string,unknown> = {};
      try { info = row.typeData ? JSON.parse(row.typeData) : {}; } catch { /* Older unstructured entries remain usable. */ }
      const kind = clean(info.type, 60);
      const key = classifyActivity(kind, row.action) || 'frontend.forms';
      return {
        date: row.createdAt ? new Date(row.createdAt).toLocaleString('en-GB', {timeZone:'Asia/Karachi',hour12:false}) : '',
        category: key,
        action: clean(row.action, 255),
        status: clean(row.status, 64),
        user: clean(info.user, 180) || clean(row.userName, 180) || 'Administrator',
        email: clean(info.userEmail, 255) || clean(row.userEmail, 255),
        ipAddress: clean(row.ipAddress, 64),
        details: clean(info.details, 1000),
      };
    });
    const filename = `BHT-activity-logs_${from}_to_${to}.${format}`;
    const payload = format === 'csv'
      ? Buffer.from('\uFEFF' + [
        ['Date (Asia/Karachi)','Category','Action','User','Email','IP Address','Status','Details'].map(safeCsvField).join(','),
        ...output.map(row => [row.date,row.category,row.action,row.user,row.email,row.ipAddress,row.status,row.details].map(safeCsvField).join(',')),
      ].join('\r\n'), 'utf8')
      : activityReportPdf(output, from, to);
    await logAdminActivityAction({ type: 'settings', action: 'Exported Activity Logs', details: `${format.toUpperCase()} export, ${from} to ${to}, ${output.length} records` });
    return new NextResponse(new Uint8Array(payload), {
      status: 200,
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv; charset=utf-8' : 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, private',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Activity export failed:', error);
    return NextResponse.json({error:'Could not generate the activity log export. Check backend logs.'}, {status:500});
  }
}
