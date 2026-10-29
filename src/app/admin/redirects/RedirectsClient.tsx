'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveRedirectAction, disableRedirectAction } from '@/actions/redirectActions';
import { WaveAnalyticsChart, chartDays, dailySeries } from '@/components/admin/WaveAnalyticsChart';
export default function RedirectsClient({initialRules,initialHits}:{initialRules:any[],initialHits:any[]}) {
 const [source,setSource]=useState(''); const [destination,setDestination]=useState('');
 const [httpCode,setCode]=useState(308); const [error,setError]=useState('');const [saving,setSaving]=useState(false);
 const [editing,setEditing]=useState<number|undefined>(); const router=useRouter();
 const days = chartDays(14);
 const lastSeenPaths = dailySeries(initialHits, days.keys, hit => hit.lastSeen);
 const createdRules = dailySeries(initialRules, days.keys, rule => rule.createdAt);
 const topPaths = [...initialHits].sort((a,b) => Number(b.hits || 0) - Number(a.hits || 0)).slice(0,8);

 return <div className="space-y-5 p-5"><div><h1 className="text-2xl font-bold">Redirects &amp; 404 Center</h1><p className="text-sm text-slate-500">Real database-backed internal redirects and unmatched CMS page hits.</p></div>
 <form onSubmit={async e=>{e.preventDefault();setSaving(true);setError('');try{const result=await saveRedirectAction({id:editing,sourcePath:source,destinationPath:destination,httpCode});if(result.success){setSource('');setDestination('');setEditing(undefined);router.refresh();}else setError(result.error||'Could not save.');}finally{setSaving(false);}}} className="grid gap-3 rounded-2xl border bg-white p-5 sm:grid-cols-4"><label className="text-sm font-semibold">Broken URL<input required value={source} onChange={e=>setSource(e.target.value)} placeholder="/old-page" className="mt-2 w-full rounded-lg border p-2"/></label><label className="text-sm font-semibold">Redirect to<input required value={destination} onChange={e=>setDestination(e.target.value)} placeholder="/new-page" className="mt-2 w-full rounded-lg border p-2"/></label><label className="text-sm font-semibold">Code<select className="mt-2 w-full rounded-lg border p-2" value={httpCode} onChange={e=>setCode(Number(e.target.value))}>{[307,308].map(v=><option key={v}>{v}</option>)}</select></label><button disabled={saving} className="self-end rounded-lg bg-emerald-900 px-4 py-2 text-white">{saving?'Saving...':editing?'Update redirect':'Add redirect'}</button>{error&&<p role="alert" className="text-sm text-red-700 sm:col-span-4">{error}</p>}</form>
 <div className="grid gap-4 sm:grid-cols-3">{[['404 unique paths',initialHits.length],['Unresolved hits',initialHits.filter(h=>h.status==='unresolved').reduce((a,h)=>a+h.hits,0)],['Active redirects',initialRules.filter(r=>r.status==='active').length]].map(([label,value])=><div key={label} className="rounded-2xl border bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="text-3xl font-bold">{value}</p></div>)}</div>
 <div className="grid gap-4 xl:grid-cols-2">
   <WaveAnalyticsChart
     compact
     title="404 paths and redirect rule activity"
     description="404 series counts unique paths by most recent observation date, not daily requests. Redirect series shows rules created each day."
     labels={days.labels}
     series={[{name:'404 URLs last seen',values:lastSeenPaths},{name:'Redirects created',values:createdRules}]}
   />
   <WaveAnalyticsChart
     compact
     title="Most requested missing URLs"
     description="Top eight URLs ranked by total recorded 404 hits. Positions represent rank, not dates."
     mode="categories"
     labels={topPaths.map((path,index) => `#${index+1}`)}
     series={[{name:'Total recorded 404 hits',values:topPaths.map(path=>Number(path.hits || 0))}]}
     emptyText="No recorded 404 paths"
   />
 </div>
 <h2 className="text-lg font-bold">Redirect rules</h2><div className="overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead><tr>{['Source','Destination','Code','Status','Actions'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{initialRules.map(r=><tr className="border-t" key={r.id}><td className="p-3">{r.sourcePath}</td><td className="p-3">{r.destinationPath}</td><td className="p-3">{r.httpCode}</td><td className="p-3">{r.status}</td><td className="p-3"><button type="button" className="text-emerald-800 underline" onClick={()=>{setSource(r.sourcePath);setDestination(r.destinationPath);setCode(r.httpCode);setEditing(r.id);}}>Edit</button> <button type="button" className="ml-2 text-red-700 underline" disabled={r.status==='disabled'} onClick={async()=>{await disableRedirectAction(r.id);router.refresh();}}>Disable</button></td></tr>)}</tbody></table></div>
 <h2 className="text-lg font-bold">Unmatched CMS paths</h2><div className="overflow-x-auto rounded-xl bg-white"><table className="w-full text-left text-sm"><thead><tr><th className="p-3">URL</th><th className="p-3">Hits</th><th className="p-3">Last seen</th><th className="p-3">Action</th></tr></thead><tbody>{initialHits.map(h=><tr key={h.id} className="border-t"><td className="p-3">{h.requestPath}</td><td className="p-3">{h.hits}</td><td className="p-3">{new Date(h.lastSeen).toLocaleString('en-GB')}</td><td className="p-3"><button className="text-emerald-700 underline" onClick={()=>{setSource(h.requestPath);window.scrollTo({top:0,behavior:'smooth'});}}>Create redirect</button></td></tr>)}</tbody></table></div>
 </div>;
}
