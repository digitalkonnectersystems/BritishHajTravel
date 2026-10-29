import 'server-only';
import {db} from '@/db';
import {backendLogs} from '@/db/schema';

export type BackendEvent={severity:'info'|'warning'|'error';category:string;message:string;source?:string};
function scrub(message:unknown) {
 return String(message??'').replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[email]')
  .replace(/(?:Bearer\s+)[A-Za-z0-9._~-]+/gi,'Bearer [redacted]')
  .replace(/(?:password|token|secret|authorization)\s*[:=]\s*[^,\s]+/gi,'credential=[redacted]')
  .replace(/\+?\d[\d ()-]{8,}\d/g,'[phone]')
  .slice(0,1600);
}
export async function writeBackendLog(input:BackendEvent):Promise<boolean> {
 try {await db.insert(backendLogs).values({severity:input.severity,category:scrub(input.category).slice(0,70),message:scrub(input.message),source:scrub(input.source||'application').slice(0,191)});return true;}
 catch(error) {console.error('[backend-logs] Persistence failed',error);return false;}
}
export function databaseErrorCode(error:unknown):string {
 const err=error as {code?:unknown;cause?:{code?:unknown}}|null;
 const code=err?.code||err?.cause?.code;
 return typeof code==='string'&&/^[A-Z0-9_]{2,50}$/.test(code)?code:'UNSPECIFIED';
}
