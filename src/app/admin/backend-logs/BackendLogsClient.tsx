'use client';

import { useCallback, useEffect, useState } from 'react';
import { listBackendLogsAction, testBackendLoggerAction, updateBackendLogStatusAction, deleteBackendLogAction } from '@/actions/backendLogActions';

type BackendLog = Awaited<ReturnType<typeof listBackendLogsAction>>[number];

function formatLogDate(value: Date | string | null | undefined): string {
 const date = value ? new Date(value) : null;
 return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-GB') : '—';
}
export default function BackendLogsClient({logs}:{logs:BackendLog[]}) {
 const [items,setItems]=useState(logs);
 const [search,setSearch]=useState('');
 const [level,setLevel]=useState('all');
 const [status,setStatus]=useState('all');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [lastSynced,setLastSynced]=useState('');
 const refresh=useCallback(async()=>{
  try{setItems(await listBackendLogsAction());setLastSynced(new Date().toLocaleTimeString());}
  catch{setError('Could not reload backend diagnostics.');}
 },[]);
 useEffect(()=>{const interval=window.setInterval(()=>{if(document.visibilityState==='visible'&&!busy)void refresh();},30000);return()=>window.clearInterval(interval);},[refresh,busy]);
 const filtered=items.filter(l=>(level==='all'||l.severity===level)&&(status==='all'||l.status===status)&&`${l.message} ${l.category} ${l.source||''}`.toLowerCase().includes(search.toLowerCase()));
 async function perform(action:()=>Promise<{success:boolean;error?:string}>) {
  setBusy(true);setError('');
  try{const result=await action();if(!result.success){setError(result.error||'Action failed.');return;}await refresh();}
  catch{setError('Request failed. Please check your connection.');}finally{setBusy(false);}
 }
 return <div className="space-y-5 p-5">
  <div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Backend Logs</h1><p className="text-sm text-slate-500">Database-backed application diagnostics; Hostinger runtime/build logs require server-side access.</p></div><div className="flex gap-2"><button type="button" className="rounded-lg border bg-white px-4 py-2" disabled={busy} onClick={()=>void perform(testBackendLoggerAction)}>Test Logger</button><button type="button" className="rounded-lg bg-[#071644] px-4 py-2 text-white" disabled={busy} onClick={()=>void refresh()}>Refresh</button></div></div>
  <div className="grid gap-4 sm:grid-cols-3">{([['Log source','Database'],['Matching records',String(filtered.length)],['Open errors',String(items.filter(l=>l.severity==='error'&&l.status==='open').length)]] as const).map(([label,val])=><div key={label} className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-bold text-[#071644]">{val}</p></div>)}</div>
  <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">Application diagnostics are recorded by explicit server actions, enquiry endpoints and email handlers. Hosting process logs, build output and unhandled framework errors are not automatically ingested.</p>
  {error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  {lastSynced&&<p aria-live="polite" className="text-xs text-slate-500">Synced at {lastSynced}. Refreshes every 30 seconds while visible.</p>}
  <div className="flex flex-wrap gap-3 rounded-xl bg-white p-4"><input aria-label="Search log messages" placeholder="Search messages…" value={search} onChange={e=>setSearch(e.target.value)} className="min-w-40 flex-1 rounded-lg border p-2"/><select aria-label="Severity filter" value={level} onChange={e=>setLevel(e.target.value)} className="rounded-lg border p-2"><option value="all">All severities</option><option value="info">Info</option><option value="warning">Warning</option><option value="error">Error</option></select><select aria-label="Log status filter" value={status} onChange={e=>setStatus(e.target.value)} className="rounded-lg border p-2"><option value="all">All statuses</option><option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select></div>
  <div className="overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead><tr>{['Time','Severity','Category','Source','Message','Status','Actions'].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{filtered.map(l=><tr className="border-t" key={l.id}><td className="p-3 whitespace-nowrap">{formatLogDate(l.createdAt)}</td><td className="p-3 capitalize">{l.severity}</td><td className="p-3">{l.category}</td><td className="p-3">{l.source||'Application'}</td><td className="p-3 max-w-md break-words">{l.message}</td><td className="p-3"><select aria-label={`Status for diagnostic ${l.id}`} disabled={busy} className="rounded-lg border border-slate-200 p-2" value={l.status} onChange={e=>void perform(()=>updateBackendLogStatusAction(l.id,e.target.value as 'open'|'acknowledged'|'resolved'))}><option value="open">Open</option><option value="acknowledged">Acknowledged</option><option value="resolved">Resolved</option></select></td><td className="p-3"><button type="button" disabled={busy} className="text-red-700 underline" onClick={()=>{if(window.confirm('Archive this diagnostic event?'))void perform(()=>deleteBackendLogAction(l.id));}}>Archive</button></td></tr>)}</tbody></table>{filtered.length===0&&<p className="p-5 text-sm text-slate-500">No matching diagnostic events.</p>}</div>
 </div>;
}
