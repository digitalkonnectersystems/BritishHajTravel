/** Server/client-safe deterministic form subject rendering. Never interpolate an unrecognised token. */
export function resolveSubmissionSubject(pattern: string, formName: string, fields: Record<string, unknown> = {}): string {
  const safeForm = String(formName || 'Form Submission').replace(/[\r\n]+/g, ' ').trim().slice(0, 120);
  const raw = String(pattern || '').trim() || '[form_name]';
  const name = String(fields.fullName || fields.name || fields.pilgrimName || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 90);
  const result = raw.replace(/\[(form_name|subject)\]/gi, safeForm).replace(/\[(name|full_name)\]/gi, name).replace(/[\r\n]+/g, ' ').trim();
  return (result.includes(safeForm) ? result : `${safeForm} | ${result}`).slice(0, 240);
}
