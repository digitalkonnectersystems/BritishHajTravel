'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import PageBuilderForm from './PageBuilderForm';
import { builderNodeLayout, sanitizeBuilderStyle, sanitizeNodeStyle, MAX_BUILDER_DEPTH, type BuilderNode } from '@/lib/customSectionSettings';

// This is a deliberately restricted HTML widget. Custom HTML is never allowed to execute scripts.
function safeHtml(html: string) {
  if (typeof window === 'undefined') return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P','BR','H1','H2','H3','H4','H5','H6','DIV','SPAN','STRONG','B','EM','I','U','UL','OL','LI','BLOCKQUOTE','A','TABLE','THEAD','TBODY','TR','TD','TH']);
  const dangerous = new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','MATH','FORM','INPUT','BUTTON','TEXTAREA','SELECT','LINK','META']);
  const inspect = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (!allowed.has(child.tagName)) {
        if (dangerous.has(child.tagName)) child.remove();
        else { inspect(child); child.replaceWith(...Array.from(child.childNodes)); }
        continue;
      }
      for (const attr of Array.from(child.attributes)) {
        if (child.tagName === 'A' && attr.name === 'href' && (/^https?:\/\//i.test(attr.value) || /^\/(?!\/)/.test(attr.value) || /^mailto:/i.test(attr.value) || /^tel:/i.test(attr.value))) continue;
        child.removeAttribute(attr.name);
      }
      if (child.tagName === 'A') child.setAttribute('rel','noopener noreferrer');
      inspect(child);
    }
  };
  inspect(doc.body);
  return doc.body.innerHTML;
}
function SafeHtmlBlock({ content }: {content:string}) {
  const [html,setHtml]=useState('');
  useEffect(()=>{setHtml(safeHtml(content));},[content]);
  return <div className="prose max-w-none" dangerouslySetInnerHTML={{__html:html}}/>;
}
function Heading({ level, content }: {level:string;content:string}) {
  switch(level) {
    case 'h1': return <h1>{content}</h1>;
    case 'h3': return <h3>{content}</h3>;
    case 'h4': return <h4>{content}</h4>;
    case 'h5': return <h5>{content}</h5>;
    case 'h6': return <h6>{content}</h6>;
    default: return <h2>{content}</h2>;
  }
}
function Node({node,sectionId,pageId,preview,depth}: {node:BuilderNode;sectionId:string;pageId?:number;preview:boolean;depth:number}) {
  if (!node || node.hidden === true || depth>MAX_BUILDER_DEPTH) return null;
  const style = sanitizeNodeStyle(node.style);
  const children = Array.isArray(node.children) ? node.children.slice(0,200) : [];
  const inner = (node.type === 'container' || node.type === 'grid') ?
    <div className={`${node.type === 'grid' ? 'max-sm:!grid-cols-1' : 'max-sm:!flex-col'} min-w-0`} style={{...builderNodeLayout(node),...style}}>
      {children.map((child:BuilderNode,index:number)=><Node key={child.id||index} node={child} sectionId={sectionId} pageId={pageId} preview={preview} depth={depth+1}/>) }
    </div> : node.type==='heading' ? <div style={style} className="min-w-0 text-2xl md:text-3xl font-semibold"><Heading level={node.tag||'h2'} content={String(node.content||'')}/></div> :
    node.type==='paragraph' ? <p style={style} className="whitespace-pre-line min-w-0 leading-relaxed">{node.content||''}</p> :
    node.type==='image' && typeof node.src==='string' && (/^https?:\/\//i.test(node.src) || /^\/(?!\/)/.test(node.src)) ? <img src={node.src} alt={node.alt||''} loading="lazy" style={{display:'block',maxWidth:'100%',height:'auto',...style}}/> :
    node.type==='button' && typeof node.href==='string' && (/^\/(?!\/)/.test(node.href) || /^https:\/\//.test(node.href)) ? <Link href={node.href} style={{display:'inline-block',...style}} className="bg-primary text-white font-bold px-6 py-3 rounded-lg">{node.label||'Learn More'}</Link> :
    node.type==='html' ? <div style={style}><SafeHtmlBlock content={String(node.content||'').slice(0,50000)}/></div> :
    node.type==='form' ? (preview ? <div style={style} className="border rounded p-3 bg-white/90 text-slate-800"><h3 className="font-bold mb-3">{node.title||'Enquiry Form'}</h3>{(node.fields||[]).map((f:any)=><div key={f.key} className="mb-3"><label style={sanitizeNodeStyle(f.labelStyle)} className="text-sm block">{f.label} {f.required?'*':''}</label><div style={sanitizeNodeStyle(f.style)} className="border border-slate-300 bg-white rounded min-h-9 px-2 py-2 text-xs text-slate-500">{f.placeholder||f.type}</div></div>)}<button type="button" disabled style={sanitizeNodeStyle(node.buttonStyle)} className="bg-primary text-white rounded px-4 py-2">{node.submitLabel||'Send Enquiry'}</button></div>
      : !!pageId && <div style={style}><PageBuilderForm pageId={pageId} sectionId={sectionId} block={node}/></div>) : null;
  return inner;
}
export default function CustomLayoutSection({section,pageId,preview=false}: {section:any;pageId?:number;preview?:boolean}) {
  const data=section.data||{};
  const blocks:BuilderNode[]=Array.isArray(data.blocks)?data.blocks:[];
  const width=Math.max(320,Math.min(2200,Number(data.style?.maxWidth)||1200));
  // Old flat sections continue to render without migration; new sections use nested containers/grids.
  const legacyFlat = !blocks.some(node=>node.type==='container'||node.type==='grid');
  const columns = Math.max(1,Math.min(4,Number(data.style?.columns)||1));
  return <section style={sanitizeBuilderStyle(data.style)}>
    <div className={`mx-auto min-w-0 ${legacyFlat?'max-sm:!grid-cols-1':''}`} style={{maxWidth:width,...(legacyFlat?{display:'grid',gridTemplateColumns:`repeat(${columns}, minmax(0, 1fr))`,gap:20}:{})}}>
      {blocks.slice(0,200).map((node,index)=><div key={node.id||index} style={{minWidth:0,...(legacyFlat&&node.type==='form'?{gridColumn:'1 / -1'}:{})}}><Node node={node} sectionId={section.id} pageId={pageId} preview={preview} depth={0}/></div>)}
    </div>
  </section>;
}
