import { db } from '@/db';
import { systemSettings } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

// Database-backed signing key. Keep it server-only; do not expose it via
// settings routes, browser props, logs, or client-side code.
// Short process-local cache avoids an extra MySQL query for every admin request.
const CACHE_MS = 30_000;
let cached: { secret: string; until: number } | null = null;
let pending: Promise<string> | null = null;

async function loadSessionSecret(): Promise<string> {
  const rows = await db
    .select({ value1: systemSettings.value1 })
    .from(systemSettings)
    .where(and(
      eq(systemSettings.id, 1),
      eq(systemSettings.name, 'BHT_SESSION_SECRET'),
      eq(systemSettings.status, true),
      isNull(systemSettings.deletedAt),
    ))
    .limit(1);

  const secret = rows[0]?.value1;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('Session secret missing or too short: expected active system_settings row id=1, name=BHT_SESSION_SECRET, with value1 >=32 bytes.');
  }

  cached = { secret, until: Date.now() + CACHE_MS };
  return secret;
}

export async function getSessionSecret(): Promise<string> {
  if (cached && Date.now() < cached.until) return cached.secret;
  // Deduplicate concurrent calls within a server instance.
  if (!pending) {
    pending = loadSessionSecret().finally(() => { pending = null; });
  }
  return pending;
}
