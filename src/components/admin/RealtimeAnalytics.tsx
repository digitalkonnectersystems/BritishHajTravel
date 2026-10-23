'use client';
import { useEffect,useState } from 'react';
import { getDashboardRealtimeAction } from '@/actions/dashboardRealtimeActions';
export type AnalyticsSnapshot=Awaited<ReturnType<typeof getDashboardRealtimeAction>>;
const colors=['#0d9488','#2563eb','#f59e0b'];
function SmoothPlot({values,color}:{values:number[];color:string}) {
 const top=Math.max(1,...values); const height=100, width=400;
 const pts=values.map((v,i)=>({x:i*width/(Math.max(1,values.length-1)),y:height-8-(v/top)*(height-16)}));
 const path=pts.map((p,i)=>{if(!i)return `M ${p.x} ${p.y}`;const prev=pts[i-1];const mid=(prev.x+p.x)/2;return ` C ${mid} ${prev.y}, ${mid} ${p.y}, ${p.x} ${p.y}`}).join('');
 return <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>;
}
export default function RealtimeAnalytics({initial}:{initial:AnalyticsSnapshot}) {
 const [snapshot,setSnapshot]=useState(initial);const [error,setError]=useState('');
 useEffect(()=>{let mounted=true;const refresh=async()=>{if(document.visibilityState!=='visible')return;try{const result=await getDashboardRealtimeAction();if(mounted){setSnapshot(result);setError('');}}catch{if(mounted)setError('Refresh unavailable. Showing last successfully fetched database counts.');}};const timer=window.setInterval(refresh,60000);return()=>{mounted=false;window.clearInterval(timer);};},[]);
 const items=[['Enquiries',snapshot.counts.enquiries],['New enquiries',snapshot.counts.newEnquiries],['Umrah packages',snapshot.counts.umrah],['Hajj packages',snapshot.counts.hajj],['Visa solutions',snapshot.counts.visas],['CMS pages',snapshot.counts.pages],['Published blogs',snapshot.counts.blogs],['404 paths',snapshot.counts.brokenPaths],['Active redirects',snapshot.counts.redirects]] as const;
 const max=Math.max(1,...snapshot.enquiryTrend,...snapshot.activityTrend);
 const share=snapshot.enquiryTrend.map((v,i)=>Math.round(100*v/Math.max(1,v+snapshot.activityTrend[i])));
 return <section className="rounded-3xl border border-slate-200 bg-white p-5"><div className="mb-4 flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900 mb-2">Project Visual Analytics</h2><p className="text-xs text-slate-500">Live database totals and 14-day daily activity. Refreshes every 60 seconds when this tab is visible.</p></div><time className="text-xs text-slate-500">Synced: {new Date(snapshot.refreshedAt).toLocaleTimeString('en-GB')}</time></div>{error&&<p role="status" className="text-sm text-amber-700">{error}</p>}<div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-9">{items.map(([label,value])=><div key={label} className="rounded-xl border bg-slate-50 p-3"><p className="text-[10px] font-semibold text-slate-500">{label}</p><p className="text-2xl font-extrabold text-slate-900">{value}</p></div>)}</div><div className="rounded-2xl border bg-slate-50 p-4"><div className="flex flex-wrap gap-4 text-xs font-semibold"><span style={{color:colors[0]}}>● Enquiries per day</span><span style={{color:colors[1]}}>● Admin activities per day</span><span style={{color:colors[2]}}>● Enquiry share (scaled)</span></div><svg className="mt-3 w-full" viewBox="0 0 400 115" role="img" aria-label="14-day line chart for actual enquiries, admin activity counts and relative share"><SmoothPlot values={snapshot.enquiryTrend} color={colors[0]}/><SmoothPlot values={snapshot.activityTrend} color={colors[1]}/><SmoothPlot values={share.map(v=>v*max/100)} color={colors[2]}/></svg><div className="flex justify-between text-[10px] text-slate-500"><span>{snapshot.days[0]}</span><span>{snapshot.days[snapshot.days.length-1]}</span></div></div></section>;
}
