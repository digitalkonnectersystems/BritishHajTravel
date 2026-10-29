'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  listRedirectsAction, saveRedirectAction, disableRedirectAction,
  enableRedirectAction, deleteRedirectAction, updateNotFoundHitStatusAction,
  deleteNotFoundHitAction,
} from '@/actions/redirectActions';
import { WaveAnalyticsChart, chartDays, dailySeries } from '@/components/admin/WaveAnalyticsChart';

type RedirectSnapshot = Awaited<ReturnType<typeof listRedirectsAction>>;
type Rule = RedirectSnapshot['rules'][number];
type Hit = RedirectSnapshot['hits'][number];

function formatHitDate(value: Date | string | null | undefined): string {
 const date = value ? new Date(value) : null;
 return date && !Number.isNaN(date.getTime()) ? date.toLocaleString('en-GB') : '—';
}

export default function RedirectsClient({initialRules,initialHits}:{initialRules:Rule[];initialHits:Hit[]}) {
 const [rules,setRules]=useState(initialRules);
 const [hits,setHits]=useState(initialHits);
 const [source,setSource]=useState('');
 const [destination,setDestination]=useState('');
 const [httpCode,setCode]=useState(308);
 const [editing,setEditing]=useState<number|undefined>();
 const [error,setError]=useState('');
 const [busy,setBusy]=useState(false);
 const [search,setSearch]=useState('');
 const [statusFilter,setStatusFilter]=useState('all');
 const [lastSynced,setLastSynced]=useState<string>('');
 const refresh = useCallback(async () => {
  try {const data = await listRedirectsAction();setRules(data.rules);setHits(data.hits);setLastSynced(new Date().toLocaleTimeString());}
  catch {setError('Could not refresh redirect data. Check the database and try again.');}
 },[]);
 useEffect(()=>{
  const id=window.setInterval(()=>{if(document.visibilityState==='visible'&&!busy)void refresh();},30000);
  return ()=>window.clearInterval(id);
 },[refresh,busy]);
 const days = useMemo(()=>chartDays(14),[]);
 const topPaths = useMemo(()=>[...hits].sort((a,b)=>Number(b.hits||0)-Number(a.hits||0)).slice(0,8),[hits]);
 const lastSeenPaths=dailySeries(hits,days.keys,h=>h.lastSeen);
 const createdRules=dailySeries(rules,days.keys,r=>r.createdAt);
 const filteredRules=rules.filter(r=>
  (statusFilter==='all'||r.status===statusFilter)&&`${r.sourcePath} ${r.destinationPath}`.toLowerCase().includes(search.toLowerCase())
 );
 const filteredHits=hits.filter(h=>`${h.requestPath}`.toLowerCase().includes(search.toLowerCase()));
 async function perform(action:()=>Promise<{success:boolean;error?:string}>) {
  setBusy(true);setError('');
  try {const result=await action();if(!result.success){setError(result.error||'Action failed.');return false;}await refresh();return true;}
  catch {setError('The request failed. Please check your connection and try again.');return false;}
  finally {setBusy(false);}
 }
 return <div className="space-y-5 p-5">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h1 className="text-2xl font-bold text-slate-900">Redirects &amp; 404 Center</h1><p className="text-sm text-slate-500">Database-backed redirect rules and unmatched CMS paths. Changes update without reloading.</p></div>
   <button type="button" disabled={busy} onClick={()=>void refresh()} className="rounded-xl bg-[#071644] px-4 py-2 text-xs font-bold text-white disabled:opacity-60">Refresh data</button>
  </div>
  {error&&<p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  {lastSynced&&<p aria-live="polite" className="text-xs text-slate-500">Last synced at {lastSynced} (auto-refresh every 30 seconds while visible)</p>}
  <form onSubmit={async e=>{e.preventDefault();if(await perform(()=>saveRedirectAction({id:editing,sourcePath:source,destinationPath:destination,httpCode}))){setSource('');setDestination('');setEditing(undefined);}}} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
   <label className="text-sm font-semibold">Broken URL<input required value={source} onChange={e=>setSource(e.target.value)} placeholder="/old-page" className="mt-2 w-full rounded-lg border border-slate-200 p-2"/></label>
   <label className="text-sm font-semibold">Redirect to<input required value={destination} onChange={e=>setDestination(e.target.value)} placeholder="/new-page" className="mt-2 w-full rounded-lg border border-slate-200 p-2"/></label>
   <label className="text-sm font-semibold">HTTP Code<select className="mt-2 w-full rounded-lg border border-slate-200 p-2" value={httpCode} onChange={e=>setCode(Number(e.target.value))}>{[307,308].map(v=><option value={v} key={v}>{v}</option>)}</select></label>
   <div className="flex items-end gap-2"><button disabled={busy} className="flex-1 rounded-lg bg-[#071644] px-3 py-2 text-white disabled:opacity-60">{busy?'Saving…':editing?'Update redirect':'Add redirect'}</button>{editing&&<button type="button" onClick={()=>{setEditing(undefined);setSource('');setDestination('');}} className="rounded-lg border px-3 py-2 text-sm">Cancel</button>}</div>
  </form>
  <div className="grid gap-4 sm:grid-cols-3">{([['404 unique paths',hits.length],['Unresolved hits',hits.filter(h=>h.status==='unresolved').reduce((a,h)=>a+Number(h.hits||0),0)],['Active redirects',rules.filter(r=>r.status==='active').length]] as const).map(([label,value])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-3xl font-bold text-[#071644]">{value}</p></div>)}</div>
  <div className="grid gap-4 xl:grid-cols-2">
   <WaveAnalyticsChart compact title="404 paths and redirect rule activity" description="404 series groups unique paths by last observed date; redirects show rules created daily, not hit-by-hit traffic." labels={days.labels} series={[{name:'404 URLs last seen',values:lastSeenPaths},{name:'Redirects created',values:createdRules}]}/>
   <WaveAnalyticsChart compact title="Most requested missing URLs" description="Ranked by total recorded 404 hits, not chronological." mode="categories" labels={topPaths.map((_,i)=>`#${i+1}`)} series={[{name:'Total recorded 404 hits',values:topPaths.map(h=>Number(h.hits||0))}]} emptyText="No recorded 404 paths"/>
  </div>
  <div className="flex flex-wrap gap-3"><input aria-label="Search redirects and 404 paths" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search paths…" className="min-w-48 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"/><select aria-label="Filter redirect status" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="all">All redirect statuses</option><option value="active">Active</option><option value="disabled">Disabled</option></select></div>
  <h2 className="text-lg font-bold text-slate-900">Redirect rules</h2>
  <div className="overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead><tr>{['Source','Destination','Code','Status','Actions'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{filteredRules.map(r=><tr className="border-t" key={r.id}><td className="p-3">{r.sourcePath}</td><td className="p-3">{r.destinationPath}</td><td className="p-3">{r.httpCode}</td><td className="p-3">{r.status}</td><td className="p-3 whitespace-nowrap"><button disabled={busy} type="button" className="text-blue-800 underline" onClick={()=>{setSource(r.sourcePath);setDestination(r.destinationPath);setCode(r.httpCode);setEditing(r.id);window.scrollTo({top:0,behavior:'smooth'});}}>Edit</button>{r.status==='active'?<button type="button" disabled={busy} className="ml-3 text-amber-800 underline" onClick={()=>void perform(()=>disableRedirectAction(r.id))}>Disable</button>:<button type="button" disabled={busy} className="ml-3 text-emerald-800 underline" onClick={()=>void perform(()=>enableRedirectAction(r.id))}>Enable</button>}<button type="button" disabled={busy} className="ml-3 text-red-700 underline" onClick={()=>{if(window.confirm(`Archive redirect ${r.sourcePath}?`))void perform(()=>deleteRedirectAction(r.id));}}>Delete</button></td></tr>)}</tbody></table>{filteredRules.length===0&&<p className="p-4 text-sm text-slate-500">No matching redirect rules.</p>}</div>
  <h2 className="text-lg font-bold text-slate-900">Unmatched CMS paths</h2>
  <div className="overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead><tr>{['URL','Hits','Status','Last seen','Actions'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{filteredHits.map(h=><tr key={h.id} className="border-t"><td className="p-3">{h.requestPath}</td><td className="p-3">{h.hits}</td><td className="p-3">{h.status}</td><td className="p-3 whitespace-nowrap">{formatHitDate(h.lastSeen)}</td><td className="p-3 whitespace-nowrap"><button type="button" className="text-blue-800 underline" onClick={()=>{setSource(h.requestPath);window.scrollTo({top:0,behavior:'smooth'});}}>Create redirect</button><button disabled={busy} type="button" className="ml-3 text-emerald-800 underline" onClick={()=>void perform(()=>updateNotFoundHitStatusAction(h.id,h.status==='resolved'?'unresolved':'resolved'))}>{h.status==='resolved'?'Reopen':'Resolve'}</button><button disabled={busy} type="button" className="ml-3 text-red-700 underline" onClick={()=>{if(window.confirm(`Archive 404 record ${h.requestPath}?`))void perform(()=>deleteNotFoundHitAction(h.id));}}>Delete</button></td></tr>)}</tbody></table>{filteredHits.length===0&&<p className="p-4 text-sm text-slate-500">No matching 404 paths.</p>}</div>
 </div>;
}
