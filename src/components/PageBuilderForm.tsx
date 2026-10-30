'use client';
import { useState } from 'react';
import { submitPageBuilderFormAction } from '@/actions/pageBuilderFormActions';
import { sanitizeNodeStyle } from '@/lib/customSectionSettings';

export default function PageBuilderForm({pageId,sectionId,block}:{pageId:number;sectionId:string;block:any}) {
  const [form,setForm]=useState<Record<string,string>>({});
  const [honeypot,setHoneypot]=useState('');
  const [working,setWorking]=useState(false);
  const [result,setResult]=useState('');
  const fields=Array.isArray(block.fields)?block.fields:[];
  return <div className="w-full">
    <h2 className="text-2xl font-semibold mb-3">{block.title||'Enquiry Form'}</h2>
    <form onSubmit={async event=>{
      event.preventDefault();if(working)return;setWorking(true);setResult('');
      try{const res=await submitPageBuilderFormAction({pageId,sectionId,blockId:block.id,fields:form,honeypot});
        if(res.success){setForm({});setResult('Your enquiry has been received. Reference: '+(res.reference||''));}
        else setResult(res.error||'Unable to submit enquiry.');
      }catch{setResult('Unable to submit enquiry. Please try again.');}
      finally{setWorking(false);}
    }} className="space-y-4">
      <div style={{position:'absolute',left:'-99999px'}} aria-hidden="true"><label>Do not fill this field<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)}/></label></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field:any)=>{
          const key=String(field.key||'');if(!/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(key))return null;
          const type=['email','tel','number','date'].includes(field.type)?field.type:'text';
          const labelStyle=sanitizeNodeStyle(field.labelStyle),controlStyle=sanitizeNodeStyle(field.style);
          const base='mt-1 w-full border border-slate-300 rounded-lg p-3 text-slate-900 bg-white';
          const val=form[key]||'';
          const change=(next:string)=>setForm(v=>({...v,[key]:next}));
          return <label key={key} className={`block font-semibold text-sm ${['textarea','checkbox'].includes(field.type)||field.fullWidth?'md:col-span-2':''}`} style={labelStyle}>
            {field.type==='checkbox'?<span className="flex gap-2 items-center"><input type="checkbox" checked={val==='yes'} onChange={e=>change(e.target.checked?'yes':'')} required={!!field.required} style={controlStyle}/>{field.label||key}{field.required?' *':''}</span>:<>{field.label||key}{field.required?' *':''}
              {field.type==='textarea'?<textarea className={base} style={controlStyle} rows={4} placeholder={field.placeholder||''} maxLength={2000} required={!!field.required} value={val} onChange={e=>change(e.target.value)}/>
              :field.type==='select'?<select className={base} style={controlStyle} value={val} required={!!field.required} onChange={e=>change(e.target.value)}><option value="">Select...</option>{String(field.options||'').split(/\r?\n/).map((opt:string)=>opt.trim()).filter(Boolean).slice(0,50).map((opt:string,i:number)=><option key={i} value={opt}>{opt}</option>)}</select>
              :<input type={type} className={base} style={controlStyle} maxLength={2000} placeholder={field.placeholder||''} required={!!field.required} value={val} onChange={e=>change(e.target.value)}/>}</>}
          </label>;
        })}
      </div>
      <button type="submit" disabled={working} style={sanitizeNodeStyle(block.buttonStyle)} className="bg-primary text-white rounded-lg px-7 py-3 font-bold disabled:opacity-50">{working?'Sending...':block.submitLabel||'Send Enquiry'}</button>
      {result&&<p role="status" className="text-sm font-semibold">{result}</p>}
    </form>
  </div>;
}
