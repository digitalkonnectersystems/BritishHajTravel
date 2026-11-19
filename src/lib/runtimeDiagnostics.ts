/**
 * Temporary, opt-in runtime diagnostics. No DB writes, HTTP calls or user data.
 * Enable in Hostinger environment: BHT_RUNTIME_DIAGNOSTICS=1
 * Optional all-route tracing: BHT_RUNTIME_DIAGNOSTICS_ALL_ROUTES=1
 * Remove both flags or set them to 0 after investigating.
 *
 * This module is intentionally safe to import from both proxy.ts and server code.
 */
export type RuntimeFields = Record<string, string | number | boolean | null | undefined>;

type ErrorWithCause = {
  name?: unknown;
  message?: unknown;
  code?: unknown;
  cause?: unknown;
  stack?: unknown;
};

export function isRuntimeDiagnosticsEnabled(): boolean {
  return process.env.BHT_RUNTIME_DIAGNOSTICS === '1';
}

export function shouldTracePublicPath(pathname: string): boolean {
  if (!isRuntimeDiagnosticsEnabled()) return false;
  if (process.env.BHT_RUNTIME_DIAGNOSTICS_ALL_ROUTES === '1') return true;
  return /^\/(?:hajj-2027(?:\/|$)|robots\.txt$|sitemap\.xml$|letstravel(?:\/|$)|admin(?:\/|$))/.test(pathname);
}

function scrub(value: string): string {
  // Never output query strings, credentials, email addresses or phone numbers.
  return value
    .replace(/(https?:\/\/[^\s?#]+)\?[^\s#]*/gi, '$1?[redacted]')
    .replace(/(?:password|token|secret|authorization|cookie|apikey|api_key)\s*[:=]\s*[^,\s}]+/gi, '[credential]')
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/\+?\d[\d ()-]{8,}\d/g, '[phone]')
    .replace(/[\r\n]+/g, ' ')
    .slice(0, 320);
}

function safeFields(fields: RuntimeFields) {
  const safe: Record<string, string | number | boolean | null> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    safe[key] = typeof value === 'string' ? scrub(value) : value;
  }
  return safe;
}

export function runtimeInfo(event: string, fields: RuntimeFields = {}): void {
  runtimeLog('info', event, fields);
}

export function runtimeWarn(event: string, fields: RuntimeFields = {}): void {
  runtimeLog('warn', event, fields);
}

function runtimeLog(level: 'info' | 'warn' | 'error', event: string, fields: RuntimeFields): void {
  if (!isRuntimeDiagnosticsEnabled()) return;
  const entry = JSON.stringify({ at: new Date().toISOString(), level, event, ...safeFields(fields) });
  const line = `[BHT_RUNTIME] ${entry}`;
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

/** Log useful exception identifiers without exposing request bodies or sessions. */
export function runtimeError(event: string, error: unknown, fields: RuntimeFields = {}): void {
  if (!isRuntimeDiagnosticsEnabled()) return;
  const top = error && typeof error === 'object' ? error as ErrorWithCause : null;
  const cause = top?.cause && typeof top.cause === 'object' ? top.cause as ErrorWithCause : null;
  const data: RuntimeFields = {
    ...fields,
    errorName: typeof top?.name === 'string' ? top.name : 'UnknownError',
    errorCode: typeof top?.code === 'string' ? top.code : undefined,
    errorMessage: typeof top?.message === 'string' ? top.message : undefined,
    causeName: typeof cause?.name === 'string' ? cause.name : undefined,
    causeCode: typeof cause?.code === 'string' ? cause.code : undefined,
    causeMessage: typeof cause?.message === 'string' ? cause.message : undefined,
    // Include only the first two source locations. They aid RCA without dumping user data.
    stackTop: typeof top?.stack === 'string'
      ? top.stack.split('\n').slice(1, 3).join(' | ')
      : undefined,
  };
  runtimeLog('error', event, data);
}
