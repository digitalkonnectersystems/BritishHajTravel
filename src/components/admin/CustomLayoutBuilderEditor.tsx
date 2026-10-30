'use client';
import { useState, type DragEvent } from 'react';
import {
  BUILDER_BLOCK_TYPES, MAX_BUILDER_DEPTH, countBuilderNodes,
  defaultBuilderData, isBuilderContainer, mapBuilderTree, newBuilderBlock,
  removeBuilderNode, type BuilderNode,
} from '@/lib/customSectionSettings';
import ImageUploadWidget from '@/components/admin/ImageUploadWidget';
import CustomLayoutSection from '@/components/CustomLayoutSection';

const input = 'w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900';
const caption = 'block text-xs font-semibold text-slate-600 mb-1';
const emailKeys = ['to', 'cc', 'bcc', 'replyTo', 'subject', 'body'] as const;
const fieldTypes = ['text','email','tel','number','date','textarea','select','checkbox'];
type StyleObject = Record<string, any>;

function StyleEditor({ value, onChange, layout = false, heading = 'Style' }: {value: StyleObject; onChange: (next: StyleObject) => void; layout?: boolean; heading?: string}) {
  const style = value || {};
  const set = (key: string, val: any) => onChange({...style, [key]: val});
  const colorField = (key: string, text: string) => <label key={key} className={caption}>{text}
    <div className="flex gap-1"><input type="color" className="h-9 w-11 border rounded" value={/^#[0-9a-f]{6}$/i.test(style[key] || '') ? style[key] : key === 'textColor' ? '#1e293b' : key === 'borderColor' ? '#dbe2ea' : '#ffffff'} onChange={e => set(key,e.target.value)} />
      <input className={`${input} min-w-0`} placeholder="inherit" value={style[key] || ''} onChange={e => set(key,e.target.value)} /></div>
  </label>;
  const numField = (key: string, label: string, min = 0, max = 300, step = 1) => <label key={key} className={caption}>{label}
    <input type="number" className={input} min={min} max={max} step={step} value={style[key] ?? ''} placeholder="Auto" onChange={e=>set(key,e.target.value === '' ? undefined : Number(e.target.value))}/>
  </label>;
  const selectField = (key: string, label: string, choices: string[]) => <label key={key} className={caption}>{label}
    <select value={style[key] ?? ''} className={input} onChange={e=>set(key,e.target.value)}><option value="">Default</option>{choices.map(opt=><option key={opt} value={opt}>{opt}</option>)}</select>
  </label>;
  return <div className="space-y-3">
    <div className="text-xs font-bold text-slate-800">{heading}</div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{colorField('backgroundColor','Background colour')}{colorField('textColor','Text colour')}{colorField('borderColor','Border colour')}
      {numField('borderWidth','Border width (px)',0,20)}{numField('borderRadius','Corner radius (px)',0,100)}
      {numField('fontSize','Font size (px)',8,100)}{selectField('fontWeight','Font weight',['300','400','500','600','700','800','900'])}
      {numField('lineHeight','Line height (e.g. 1.5)',0.8,3,0.1)}{numField('letterSpacing','Letter spacing (px)',-2,12,0.1)}
      {selectField('textAlign','Text align',['left','center','right','justify'])}
      {numField('maxWidth','Max width (px)',100,2200)}{numField('minHeight','Min height (px)',0,1400)}
      {numField('width','Width (%)',1,100)}{numField('columnSpan','Grid column span',1,12)}
      {layout && numField('gap','Gap (px)',0,160)}
      {layout && selectField('alignItems','Align children',['start','center','end','stretch'])}
      {layout && selectField('justifyContent','Justify content',['start','center','end','between','around','evenly'])}
    </div>
    <details className="border bg-slate-50 rounded-md p-2"><summary className="text-xs font-bold cursor-pointer">Spacing: individual padding and margins</summary>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">{(['Top','Right','Bottom','Left'] as const).flatMap(side=>[
        numField(`padding${side}`,`Padding ${side.toLowerCase()} (px)`,0,300),
        numField(`margin${side}`,`Margin ${side.toLowerCase()} (px)`,-160,300),
      ])}</div>
    </details>
  </div>;
}
function NodeTree({ nodes, depth, selectedId, onSelect, onAdd, onRemove, onMove, onDuplicate, onWrap, onDrop, dragging, setDragging }: {
  nodes: BuilderNode[]; depth: number; selectedId: string | null; onSelect: (id: string)=>void;
  onAdd:(parentId:string | null,type:string)=>void; onRemove:(id:string)=>void;
  onMove:(id:string,delta:number)=>void; onDuplicate:(id:string)=>void; onWrap:(id:string)=>void;
  onDrop:(source:string,target:string,position:'before'|'inside'|'after')=>void;
  dragging:string|null;setDragging:(id:string|null)=>void;
}) {
  return <div className={depth ? 'ml-4 border-l border-slate-300 pl-3 space-y-2' : 'space-y-2'}>
    {nodes.map((node,i)=> <div key={node.id} className={`rounded-md border ${selectedId === node.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'} ${dragging===node.id?'opacity-50':''}`}>
      <div draggable onDragStart={(e:DragEvent)=>{e.stopPropagation();e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',node.id);setDragging(node.id)}}
        onDragEnd={()=>setDragging(null)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();e.stopPropagation();const source=e.dataTransfer.getData('text/plain')||dragging;if(source) onDrop(source,node.id,'before');setDragging(null)}}
        className="flex flex-wrap items-center gap-1 p-2 text-xs">
        <button type="button" onClick={()=>onSelect(node.id)} className="flex-1 min-w-24 text-left font-semibold py-1 text-slate-800" title="Edit widget">☰ {node.type} {node.type==='heading'?`(${node.tag||'h2'})`:''}</button>
        {node.hidden && <span className="text-orange-600">Hidden</span>}
        <button type="button" className="px-1.5 py-1 border rounded bg-primary/60" disabled={i===0} onClick={()=>onMove(node.id,-1)} title="Move up">↑</button>
        <button type="button" className="px-1.5 py-1 border rounded bg-primary/60" disabled={i===nodes.length-1} onClick={()=>onMove(node.id,1)} title="Move down">↓</button>
        <button type="button" className="px-1.5 py-1 border rounded bg-primary/60" onClick={()=>onDuplicate(node.id)} title="Duplicate widget">Copy</button>
        <button type="button" className="px-1.5 py-1 border rounded bg-primary/60" disabled={depth>=MAX_BUILDER_DEPTH} onClick={()=>onWrap(node.id)} title="Wrap widget in a div">Wrap</button>
        <button type="button" className="px-1.5 py-1 border border-red-300 text-red-600 rounded" onClick={()=>onRemove(node.id)} title="Delete widget">×</button>
      </div>
      {isBuilderContainer(node.type) && <div className="px-2 pb-2 space-y-2">
        <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();e.stopPropagation();const source=e.dataTransfer.getData('text/plain')||dragging;if(source)onDrop(source,node.id,'inside');setDragging(null)}} className="border border-dashed border-blue-300 bg-blue-50/50 rounded p-2 text-xs text-blue-800">
          Drop here to place inside {node.type}
        </div>
        {depth < MAX_BUILDER_DEPTH && <div className="flex gap-1 flex-wrap">{BUILDER_BLOCK_TYPES.map(type=><button type="button" key={type} className="bg-primary border px-2 py-1 rounded text-[11px]" onClick={()=>onAdd(node.id,type)}>+ {type}</button>)}</div>}
        {Array.isArray(node.children)&&!!node.children.length && <NodeTree nodes={node.children} depth={depth+1} selectedId={selectedId} onSelect={onSelect} onAdd={onAdd} onRemove={onRemove} onMove={onMove} onDuplicate={onDuplicate} onWrap={onWrap} onDrop={onDrop} dragging={dragging} setDragging={setDragging}/>}
      </div>}
      <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();e.stopPropagation();const source=e.dataTransfer.getData('text/plain')||dragging;if(source) onDrop(source,node.id,'after');setDragging(null)}} className="h-2 hover:bg-blue-200" title="Drop to insert after" />
    </div>)}
  </div>;
}
export default function CustomLayoutBuilderEditor({ data, onChange }: { data: any; onChange: (key: string, value: any) => void }) {
  const current = data || defaultBuilderData();
  const style = current.style || {};
  const blocks: BuilderNode[] = Array.isArray(current.blocks) ? current.blocks : [];
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [dragging, setDragging] = useState<string|null>(null);
  const [message, setMessage] = useState('');
  const updateBlocks=(next:BuilderNode[])=>onChange('blocks',next);
  const selected = (()=>{const find=(items:BuilderNode[]):BuilderNode|undefined=>{for(const n of items){if(n.id===selectedId)return n;const child=find(Array.isArray(n.children)?n.children:[]);if(child)return child;}return undefined;};return find(blocks);})();
  const patchNode=(id:string,changes:Partial<BuilderNode>)=>updateBlocks(mapBuilderTree(blocks,n=>n.id===id?{...n,...changes}:n));
  const patchStyle=(id:string,changes:StyleObject)=>patchNode(id,{style:changes});
  const updateStyle=(value:StyleObject)=>onChange('style',value);
  const copyWithNewIds=(node:BuilderNode):BuilderNode=>({...node,id:`block-${Date.now()}-${Math.random().toString(36).slice(2,9)}`,...(Array.isArray(node.children)?{children:node.children.map(copyWithNewIds)}:{})});
  const findParent=(id:string, nodes=blocks, parentId:string|null=null,depth=0):{node:BuilderNode,parentId:string|null,depth:number}|null=>{
    for(const n of nodes){if(n.id===id)return {node:n,parentId,depth};const found=findParent(id,Array.isArray(n.children)?n.children:[],n.id,depth+1);if(found)return found;}return null;
  };
  const applyToParent=(parentId:string|null,update:(siblings:BuilderNode[])=>BuilderNode[])=>{
    if(parentId===null){updateBlocks(update(blocks));return;}
    updateBlocks(mapBuilderTree(blocks,n=>n.id===parentId?{...n,children:update(Array.isArray(n.children)?n.children:[])}:n));
  };
  const add=(parentId:string|null,type:string)=>{
    if(countBuilderNodes(blocks)>=160){setMessage('A section supports up to 160 widgets.');return;}
    const parent=parentId?findParent(parentId):null;
    if(parent && parent.depth >= MAX_BUILDER_DEPTH){setMessage('Maximum nesting depth reached.');return;}
    const node=newBuilderBlock(type);
    applyToParent(parentId,siblings=>[...siblings,node]); setSelectedId(node.id);setMessage('');
  };
  const remove=(id:string)=>{updateBlocks(removeBuilderNode(blocks,id));if(selectedId===id)setSelectedId(null);};
  const move=(id:string,delta:number)=>{const info=findParent(id);if(!info)return;applyToParent(info.parentId,siblings=>{const copy=[...siblings];const at=copy.findIndex(n=>n.id===id);if(at<0||at+delta<0||at+delta>=copy.length)return copy;[copy[at],copy[at+delta]]=[copy[at+delta],copy[at]];return copy;});};
  const duplicate=(id:string)=>{const info=findParent(id);if(!info||countBuilderNodes(blocks)>140)return;const clone=copyWithNewIds(info.node);applyToParent(info.parentId,siblings=>{const copy=[...siblings];const at=copy.findIndex(n=>n.id===id);copy.splice(at+1,0,clone);return copy;});setSelectedId(clone.id);};
  const wrap=(id:string)=>{const info=findParent(id);if(!info||info.depth>=MAX_BUILDER_DEPTH)return;const wrapper=newBuilderBlock('container');wrapper.children=[info.node];applyToParent(info.parentId,siblings=>siblings.map(n=>n.id===id?wrapper:n));setSelectedId(wrapper.id);};
  const drop=(source:string,target:string,position:'before'|'inside'|'after')=>{
    if(source===target)return;
    const src=findParent(source);const dest=findParent(target);if(!src||!dest)return;
    const contains=(n:BuilderNode,id:string):boolean=>n.id===id||(Array.isArray(n.children)&&n.children.some(c=>contains(c,id)))||false;
    if(contains(src.node,target)){setMessage('You cannot move a parent inside its own child.');return;}
    const parentId=position==='inside'?target:dest.parentId;
    if(position==='inside'&&!isBuilderContainer(dest.node.type))return;
    const subtreeDepth=(n:BuilderNode):number=>Array.isArray(n.children)&&n.children.length?1+Math.max(...n.children.map(subtreeDepth)):0;
    const newDepth=position==='inside'?dest.depth+1:dest.depth;
    if(newDepth+subtreeDepth(src.node)>MAX_BUILDER_DEPTH){setMessage('Cannot nest this widget any deeper.');return;}
    const stripped=removeBuilderNode(blocks,source);
    const insert=(siblings:BuilderNode[])=>{
      const arr=[...siblings];const idx=position==='inside'?arr.length:arr.findIndex(n=>n.id===target)+(position==='after'?1:0);
      arr.splice(idx<0?arr.length:idx,0,src.node);return arr;
    };
    const updated=parentId===null?insert(stripped):mapBuilderTree(stripped,n=>n.id===parentId?{...n,children:insert(Array.isArray(n.children)?n.children:[])}:n);
    updateBlocks(updated);setMessage('');
  };
  const fieldPatch=(fi:number,changes:Record<string,any>)=>{if(!selected)return;const next=[...(selected.fields||[])];next[fi]={...next[fi],...changes};patchNode(selected.id,{fields:next});};
  const emailPatch=(audience:'admin'|'customer',key:string,value:string)=>{if(!selected)return;patchNode(selected.id,{emailTemplates:{...selected.emailTemplates,[audience]:{...(selected.emailTemplates?.[audience]||{}),[key]:value}}});};

  return <div className="space-y-4 bg-white border border-slate-200 rounded-xl p-4">
    <div><h3 className="text-sm font-extrabold text-primary">Nested Visual Section Builder</h3>
      <p className="text-xs text-slate-500">Build a div → grid → div → heading → form hierarchy. Select any widget to edit its content, colours, typography, borders and spacing. Drag widgets into a container or reorder them.</p>
    </div>
    <details className="border rounded-lg p-3" open><summary className="font-bold text-sm cursor-pointer">Section styling</summary><div className="mt-3"><StyleEditor value={style} onChange={updateStyle} heading="Outer section settings" layout/>
      <label className={caption}>Outer content width (px)<input type="number" className={input} value={style.maxWidth??1200} onChange={e=>updateStyle({...style,maxWidth:Number(e.target.value)})}/></label></div></details>
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,0.9fr)_minmax(350px,1.1fr)] gap-4">
      <div className="space-y-2"><h4 className="text-sm font-bold">Structure / Navigator</h4>
        <div className="flex gap-1 flex-wrap">{BUILDER_BLOCK_TYPES.map(type=><button type="button" key={type} className="border rounded-md px-2 py-1.5 text-xs bg-red-500" onClick={()=>add(null,type)}>+ {type}</button>)}</div>
        {message&&<p role="alert" className="text-xs text-orange-700">{message}</p>}
        <NodeTree nodes={blocks} depth={0} selectedId={selectedId} onSelect={setSelectedId} onAdd={add} onRemove={remove} onMove={move} onDuplicate={duplicate} onWrap={wrap} onDrop={drop} dragging={dragging} setDragging={setDragging}/>
        {!blocks.length&&<p className="text-xs text-slate-500 border rounded p-5">Add a container to begin building your section.</p>}
      </div>
      <div className="border rounded-xl p-3 bg-slate-50 space-y-3 min-w-0">
        <h4 className="text-sm font-bold text-primary">{selected?`Edit ${selected.type}`:'Widget settings'}</h4>
        {!selected&&<p className="text-xs text-slate-500">Select a widget in the Navigator to customize it.</p>}
        {selected&&<>
          <label className={caption}>Widget type: {selected.type}</label>
          <label className="text-xs flex items-center gap-2 text-slate-700"><input type="checkbox" checked={!!selected.hidden} onChange={e=>patchNode(selected.id,{hidden:e.target.checked})}/> Hide this widget</label>
          {isBuilderContainer(selected.type)&&<div className="grid grid-cols-2 gap-2">
            {selected.type==='grid'&&<label className={caption}>Grid columns (desktop)<select className={input} value={Number(selected.style?.columns) || 2} onChange={e=>patchStyle(selected.id,{...selected.style,columns:Number(e.target.value)})}>{[1,2,3,4,5,6,8,12].map(n=><option key={n} value={n}>{n}</option>)}</select></label>}
            {selected.type==='container'&&<><label className={caption}>Direction<select className={input} value={selected.style?.direction === 'row' ? 'row' : 'column'} onChange={e=>patchStyle(selected.id,{...selected.style,direction:e.target.value})}><option value="column">Vertical</option><option value="row">Horizontal</option></select></label>
            <label className="text-xs flex gap-2 items-center"><input type="checkbox" checked={!!selected.style?.wrap} onChange={e=>patchStyle(selected.id,{...selected.style,wrap:e.target.checked})}/> Wrap children</label></>}
          </div>}
          {['heading','paragraph','html'].includes(selected.type)&&<div className="space-y-2">
            {selected.type==='heading'&&<label className={caption}>HTML heading level<select className={input} value={selected.tag||'h2'} onChange={e=>patchNode(selected.id,{tag:e.target.value})}>{['h1','h2','h3','h4','h5','h6'].map(tag=><option key={tag}>{tag}</option>)}</select></label>}
            <label className={caption}>{selected.type==='html'?'Safe HTML (scripts disabled)':'Text content'}<textarea rows={selected.type==='html'?8:4} className={input} value={selected.content||''} onChange={e=>patchNode(selected.id,{content:e.target.value})}/></label>
          </div>}
          {selected.type==='image'&&<div className="space-y-2"><span className={caption}>Media Library or upload</span><ImageUploadWidget value={selected.src||''} onChange={src=>patchNode(selected.id,{src})} compact/>
            <label className={caption}>Alternative text<input className={input} value={selected.alt||''} onChange={e=>patchNode(selected.id,{alt:e.target.value})}/></label></div>}
          {selected.type==='button'&&<div className="grid grid-cols-2 gap-2"><label className={caption}>Button text<input className={input} value={selected.label||''} onChange={e=>patchNode(selected.id,{label:e.target.value})}/></label><label className={caption}>Link<input className={input} value={selected.href||''} onChange={e=>patchNode(selected.id,{href:e.target.value})}/></label></div>}
          {selected.type==='form'&&<div className="space-y-3">
            <label className={caption}>Form title<input className={input} value={selected.title||''} onChange={e=>patchNode(selected.id,{title:e.target.value})}/></label>
            <label className={caption}>Submit button text<input className={input} value={selected.submitLabel||''} onChange={e=>patchNode(selected.id,{submitLabel:e.target.value})}/></label>
            <details className="border p-2 rounded bg-white" open><summary className="text-xs font-bold cursor-pointer">Form fields (fullName/email required)</summary>
              <div className="space-y-3 mt-2">{(selected.fields||[]).map((field:any,fi:number)=><div key={fi} className="border rounded p-2 space-y-2">
                <div className="flex items-center justify-between"><span className="text-xs font-semibold">{field.label||field.key}</span><button type="button" className="text-xs text-red-600" disabled={['fullName','email'].includes(field.key)} onClick={()=>patchNode(selected.id,{fields:selected.fields.filter((_:any,i:number)=>i!==fi)})}>Remove</button></div>
                <div className="grid grid-cols-2 gap-2"><label className={caption}>Field key<input className={input} disabled={['fullName','email'].includes(field.key)} value={field.key} onChange={e=>fieldPatch(fi,{key:e.target.value.replace(/[^a-zA-Z0-9_]/g,'')})}/></label>
                  <label className={caption}>Label<input className={input} value={field.label||''} onChange={e=>fieldPatch(fi,{label:e.target.value})}/></label>
                  <label className={caption}>Field type<select className={input} value={field.type||'text'} onChange={e=>fieldPatch(fi,{type:e.target.value})}>{fieldTypes.map(t=><option key={t} value={t}>{t}</option>)}</select></label>
                  <label className="flex gap-2 items-center text-xs"><input type="checkbox" checked={!!field.required} disabled={['fullName','email'].includes(field.key)} onChange={e=>fieldPatch(fi,{required:e.target.checked})}/>Required</label>
                </div>
                {field.type==='select'&&<label className={caption}>Options (one per line)<textarea rows={3} className={input} value={field.options||''} onChange={e=>fieldPatch(fi,{options:e.target.value})}/></label>}
                <div className="grid grid-cols-2 gap-2"><label className={caption}>Placeholder<input className={input} value={field.placeholder||''} onChange={e=>fieldPatch(fi,{placeholder:e.target.value})}/></label>
                  <label className={caption}>Field width<select className={input} value={field.fullWidth?'full':'half'} onChange={e=>fieldPatch(fi,{fullWidth:e.target.value==='full'})}><option value="half">Half row</option><option value="full">Full row</option></select></label></div>
                <details className="border rounded p-2"><summary className="text-xs font-bold cursor-pointer">This field: typography, padding, background, border</summary>
                  <div className="mt-3"><StyleEditor heading="Label appearance" value={field.labelStyle||{}} onChange={val=>fieldPatch(fi,{labelStyle:val})}/>
                    <StyleEditor heading="Input appearance" value={field.style||{}} onChange={val=>fieldPatch(fi,{style:val})}/></div>
                </details>
              </div>)}
              <button type="button" disabled={(selected.fields||[]).length>=20} className="text-xs border bg-blue-50 rounded px-3 py-2" onClick={()=>patchNode(selected.id,{fields:[...(selected.fields||[]),{key:`field${(selected.fields||[]).length+1}`,label:'New Field',type:'text',required:false}]})}>+ Add form field</button></div>
            </details>
            <details className="border p-2 rounded bg-white"><summary className="text-xs font-bold cursor-pointer">Form submit button styling</summary><div className="mt-3"><StyleEditor value={selected.buttonStyle||{}} onChange={val=>patchNode(selected.id,{buttonStyle:val})}/></div></details>
            {(['admin','customer'] as const).map(audience=><details key={audience} className="border rounded bg-white p-2"><summary className="text-xs font-bold cursor-pointer capitalize">{audience} email notification</summary>
              <div className="space-y-2 mt-3">{emailKeys.map(key=><label key={key} className={caption}>{key==='replyTo'?'Reply-To':key.toUpperCase()}{key==='body'?<textarea rows={7} className={`${input} font-mono`} value={selected.emailTemplates?.[audience]?.[key]||''} onChange={e=>emailPatch(audience,key,e.target.value)}/>:<input className={input} value={selected.emailTemplates?.[audience]?.[key]||''} onChange={e=>emailPatch(audience,key,e.target.value)}/>}</label>)}
                <p className="text-[11px] text-slate-500">Placeholders: [Customer Name], [Customer Email], [Customer Phone], [Form Name], [enquiryNumber] and each form field key.</p>
              </div></details>)}
          </div>}
          <div className="border-t pt-3"><StyleEditor heading={`Individual ${selected.type} styling`} layout={isBuilderContainer(selected.type)} value={selected.style||{}} onChange={v=>patchStyle(selected.id,v)}/></div>
        </>}
      </div>
    </div>
    <details className="border rounded-lg p-3"><summary className="text-xs font-bold cursor-pointer">Visual preview (forms are disabled)</summary>
      <div className="mt-3 border rounded-lg overflow-hidden"><CustomLayoutSection section={{id:'builder-preview',data:current}} preview /></div>
    </details>
  </div>;
}
