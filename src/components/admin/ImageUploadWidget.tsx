'use client';

import {ImageIcon,Images,Trash2} from 'lucide-react';
import {useMediaPicker} from './MediaPickerProvider';

interface ImageUploadWidgetProps {
  value:string;
  onChange:(url:string)=>void;
  subfolder?:string;
  compact?:boolean;
  hideManualUrl?:boolean;
  hideDeleteButton?:boolean;
}
export default function ImageUploadWidget({value,onChange,compact=false,hideManualUrl=false,hideDeleteButton=false}:ImageUploadWidgetProps){
  const open=useMediaPicker();
  const choose=()=>open({accept:'image/*',multiple:false,onSelect:items=>{
    if(items[0]) {onChange(items[0].url);}
  }});
  return <div className={`flex w-full ${compact?'flex-row flex-wrap items-center gap-3':'flex-col gap-3'}`}>
    {value?<div className={`group relative overflow-hidden rounded-xl border border-emerald-200 bg-slate-50 ${compact?'h-16 w-20 shrink-0':'aspect-video w-full max-w-[220px]'}`}>
      <img src={value} alt="Selected media" className="h-full w-full object-contain"/>
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/55 opacity-0 transition group-hover:opacity-100"><button type="button" onClick={choose} className="rounded-lg bg-white px-2 py-1.5 text-xs font-semibold text-emerald-800">Change</button>{!hideDeleteButton&&<button type="button" aria-label="Remove image" onClick={()=>onChange('')} className="rounded-lg bg-red-600 p-1.5 text-white"><Trash2 className="h-4 w-4"/></button>}</div>
    </div>:<button type="button" onClick={choose} className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 font-bold text-emerald-900 hover:border-emerald-600 hover:bg-emerald-100 ${compact?'px-3 py-2 text-xs':'p-4 text-sm'}`}><Images className="h-4 w-4"/>Choose from Media Library</button>}
    {value&&<button type="button" onClick={choose} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800"><ImageIcon className="h-4 w-4"/>Choose another image</button>}
    {!hideManualUrl&&<input type="text" value={value||''} onChange={e=>onChange(e.target.value)} placeholder="Or paste an image URL..." className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500"/>}
  </div>;
}
