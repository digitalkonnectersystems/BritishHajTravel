'use client';

import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import MediaLibrary,{type MediaItem} from './MediaLibrary';

type PickerArgs = {onSelect:(items:MediaItem[])=>void;multiple?:boolean;accept?:string};
const PickerContext = createContext<((args:PickerArgs)=>void)|null>(null);
export function useMediaPicker(){const context=useContext(PickerContext);if(!context)throw new Error('MediaPickerProvider is required');return context;}

/** Also catches older native file inputs in admin CRUDs without editing their data model. */
export default function MediaPickerProvider({children}:{children:ReactNode}) {
  const [picker,setPicker]=useState<PickerArgs|null>(null);
  const openPicker=useCallback((args:PickerArgs)=>setPicker(args),[]);
  useEffect(()=>{
    const intercept=(event:MouseEvent)=>{
      const target=event.target;
      if(!(target instanceof HTMLInputElement)||target.type!=='file'||target.hasAttribute('data-no-media-picker'))return;
      event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();
      const input=target;
      openPicker({accept:input.accept||'image/*',multiple:input.multiple,onSelect:async selected=>{
        try {
          const chosen = input.multiple ? selected : selected.slice(0,1);
          const dt = new DataTransfer();
          for(const item of chosen){
            const response=await fetch(item.url,{cache:'no-store'});
            if(!response.ok)throw new Error(`Cannot read ${item.url}`);
            const blob=await response.blob();
            dt.items.add(new File([blob],item.name,{type:item.mimeType,lastModified:Date.now()}));
          }
          input.files=dt.files;
          input.dispatchEvent(new Event('change',{bubbles:true}));
          setPicker(null);
        }catch(e){window.alert(e instanceof Error?e.message:'Unable to load selected media');}
      }});
    };
    document.addEventListener('click',intercept,true);
    return()=>document.removeEventListener('click',intercept,true);
  },[openPicker]);
  useEffect(()=>{
    if(!picker)return;
    const keydown=(event:KeyboardEvent)=>{if(event.key==='Escape')setPicker(null);};
    window.addEventListener('keydown',keydown);
    return()=>window.removeEventListener('keydown',keydown);
  },[picker]);
  return <PickerContext.Provider value={openPicker}>
    {children}
    {picker&&<div role="dialog" aria-modal="true" aria-label="Choose media" className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm" onMouseDown={e=>{if(e.target===e.currentTarget)setPicker(null);}}><div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-[#f1f6f5] p-5 shadow-2xl sm:p-7"><MediaLibrary multiple={picker.multiple} accept={picker.accept} onClose={()=>setPicker(null)} onSelect={items=>{try{Promise.resolve(picker.onSelect(items)).then(()=>setPicker(null)).catch(e=>window.alert(e instanceof Error?e.message:'Media selection failed'));}catch(e){window.alert(e instanceof Error?e.message:'Media selection failed');}}}/></div></div>}
  </PickerContext.Provider>;
}
