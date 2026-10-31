'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CheckSquare, Eye, CloudUpload, FileImage, FileText, Film, Grid2X2, ImageIcon, LayoutList, RefreshCcw, Search, Trash2, WandSparkles, X, RotateCcw } from 'lucide-react';

export type MediaItem = { id: number; name: string; relativePath: string; url: string; mimeType: string; sizeBytes: number; storage: string; status: string };
export default function MediaLibrary({ onSelect, multiple = false, onClose, accept = 'image/*' }: { onSelect?: (items: MediaItem[]) => void; multiple?: boolean; onClose?: () => void; accept?: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [picked, setPicked] = useState<Record<number, MediaItem>>({});
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [sort, setSort] = useState('newest');
  const [status, setStatus] = useState<'active' | 'trash'>('active');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [active, setActive] = useState(0);
  const [trash, setTrash] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const limit = 40;
  const acceptedType = accept.startsWith('video/') ? 'videos' : accept.includes('pdf') ? 'documents' : accept.includes('image/') ? 'images' : 'all';
  const effectiveType = onSelect && acceptedType !== 'all' ? acceptedType : type;
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ search, type: effectiveType, sort, status, page: String(page), limit: String(limit) });
      const response = await fetch(`/api/admin/media?${params}`, { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Failed to load media');
      setItems(body.items); setTotal(body.total); setActive(body.active); setTrash(body.trash);
    } catch (e) { setError(e instanceof Error ? e.message : 'Media Library unavailable'); }
    finally { setLoading(false); }
  }, [effectiveType, sort, status, page, search]);
  useEffect(() => { const timer = setTimeout(() => { void load(); }, search ? 250 : 0); return () => clearTimeout(timer); }, [load]);
  useEffect(() => { setSelected([]); setPicked({}); setPage(1); }, [status, effectiveType, sort, search]);
  const action = async (command: string, ids?: number[]) => {
    setBusy(command); setError(''); setMessage('');
    try {
      let cursor = 0, scanned = 0, optimized = 0, skipped = 0, failed = 0, saved = 0;
      const failures: string[] = [];
      let updated = 0;
      let hasMore = true;
      while (hasMore) {
        const response = await fetch('/api/admin/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: command, ids, cursor }) });
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error(body.error || 'Operation failed');
        scanned += body.indexed || 0;
        optimized += body.optimized || 0; skipped += body.skipped || 0; failed += body.failed || 0; saved += body.bytesSaved || 0;
        updated += body.updated || 0;
        if (body.failures) failures.push(...body.failures.slice(0, 3));
        hasMore = (command === 'rescan' || command === 'optimize') && body.hasMore === true;
        if (hasMore) {
          if (body.nextCursor === cursor) throw new Error('Scan/optimizer made no progress');
          cursor = body.nextCursor;
          setMessage(command === 'rescan' ? `Indexed ${scanned} media files...` : `Optimized ${optimized} files; ${failed} errors...`);
        }
      }
      if (command === 'optimize') setMessage(`Optimized ${optimized} files, skipped ${skipped}, failed ${failed}. Saved ${(saved / 1024).toFixed(1)} KB.${failures.length ? ' ' + failures.slice(0, 2).join('; ') : ''}`);
      else if (command === 'rescan') setMessage(`Scanned ${scanned} existing media files.`);
      else setMessage(`${updated} entries updated. No physical files were deleted.`);
      setSelected([]); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Operation failed'); }
    finally { setBusy(''); }
  };
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy('upload'); setError(''); setMessage('');
    let succeeded = 0;
    try {
      for (const file of Array.from(files)) {
        if (/\.svg$/i.test(file.name) || file.type === 'image/svg+xml') {
          throw new Error(`${file.name}: SVG uploads are not supported in Media Library. Use PNG, JPG or WebP instead.`);
        }
        const data = new FormData(); data.set('file', file); data.set('subfolder', 'uploads');
        const response = await fetch('/api/admin/upload', { method: 'POST', body: data });
        const body = await response.json();
        if (!response.ok || !body.success) throw new Error(`${file.name}: ${body.error || 'Upload failed'}`);
        succeeded++;
      }
      setStatus('active'); setPage(1); setMessage(`${succeeded} file(s) uploaded/reused and indexed.`); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed'); if (succeeded) setMessage(`${succeeded} uploaded before failure`); }
    finally { if (inputRef.current) inputRef.current.value = ''; setBusy(''); }
  };
  const choose = (item: MediaItem) => {
    const id = item.id;
    setPicked(previous => ({ ...previous, [id]: item }));
    setSelected(previous => multiple ? (previous.includes(id) ? previous.filter(k => k !== id) : [...previous, id]) : [id]);
  };
  const icon = (mime: string) => mime.startsWith('image/') ? <FileImage className="h-4 w-4" /> : mime.startsWith('video/') ? <Film className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  const resultItems = selected.map(id => picked[id]).filter((item): item is MediaItem => !!item);
  return <div className="w-full space-y-5 text-slate-800">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><div className="rounded-full bg-blue-100 p-3 text-[#020E43]"><ImageIcon className="h-6 w-6" /></div><div><h2 className="text-xl font-bold text-ink">Media Library <span className="ml-1 rounded-full bg-[#020E43] px-2 py-1 text-xs text-white">{active} Files</span></h2><p className="text-xs pt-2 text-slate-500">Upload once, reuse across pages, packages, blogs and settings</p></div></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!!busy} onClick={() => action('optimize')} className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-60"><WandSparkles className="h-4 w-4" />Media Optimizer</button>
        <button type="button" disabled={!!busy} onClick={() => action('rescan')} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2.5 text-xs font-semibold text-[#082a34] hover:bg-amber-400 disabled:opacity-60"><RefreshCcw className="h-4 w-4" />Rescan Media</button>
        <button type="button" disabled={!!busy} onClick={() => inputRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-[#020E43] px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-60"><CloudUpload className="h-4 w-4" />Upload Media</button>
        {onClose && <button type="button" onClick={onClose} aria-label="Close library" className="rounded-lg border border-slate-200 p-2.5 hover:bg-slate-100"><X className="h-4 w-4" /></button>}
        <input ref={inputRef} data-no-media-picker="true" type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/x-icon,.ico,.pdf,video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => void upload(e.target.files)} />
      </div>
    </div>
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold"><button type="button" onClick={() => setStatus('active')} className={`rounded-lg px-3 py-2 ${status === 'active' ? 'bg-white text-[#020E43] shadow-sm' : 'text-slate-600'}`}>All Media <span className="ml-1 rounded-full bg-[#020E43] px-1.5 py-0.5 text-white">{active}</span></button>{!onSelect && <button type="button" onClick={() => setStatus('trash')} className={`rounded-lg px-3 py-2 ${status === 'trash' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'}`}>Trash Folder <span className="ml-1 rounded-full bg-slate-300 px-1.5">{trash}</span></button>}</div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => setView('grid')} aria-label="Grid view" className={`rounded-md p-2 ${view === 'grid' ? 'bg-white text-[#020E43]' : 'text-slate-500'}`}><Grid2X2 className="h-4 w-4" /></button><button type="button" onClick={() => setView('list')} aria-label="List view" className={`rounded-md p-2 ${view === 'list' ? 'bg-white text-[#020E43]' : 'text-slate-500'}`}><LayoutList className="h-4 w-4" /></button></div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3"><div className="relative flex min-w-48 flex-1 items-center"><Search className="absolute left-3 h-4 w-4 text-[#020E43]" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search filename or path..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-600" /></div>
        {!onSelect && <select value={type} onChange={e => setType(e.target.value)} aria-label="File type" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs"><option value="all">All File Types</option><option value="images">Images</option><option value="documents">PDFs</option><option value="videos">Videos</option></select>}
        <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort media" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs"><option value="newest">Newest First</option><option value="oldest">Oldest First</option></select></div>
    </div>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">{error}{error.includes('media_files') && ' Run sql/20261027_media_library.sql in phpMyAdmin, then click Rescan Media.'}</div>}
    {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">{message}</div>}
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600"><label className="inline-flex cursor-pointer items-center gap-2"><input type="checkbox" checked={items.length > 0 && items.every(i => selected.includes(i.id))} onChange={e => { setSelected(e.target.checked ? Array.from(new Set([...selected, ...items.map(i => i.id)])) : selected.filter(id => !items.some(item => item.id === id))); if (e.target.checked) setPicked(previous => ({ ...previous, ...Object.fromEntries(items.map(item => [item.id, item])) })); }} className="accent-emerald-700" /> Select All ({items.length} visible)</label>
      <div className="flex items-center gap-2">{selected.length > 0 && <span>{selected.length} selected</span>}{selected.length === 1 && picked[selected[0]] && <button type="button" onClick={() => setPreview(picked[selected[0]])} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-emerald-800"><Eye className="h-4 w-4" />Preview</button>}{selected.length > 0 && !onSelect && <button type="button" disabled={!!busy} onClick={() => action(status === 'active' ? 'trash' : 'restore', selected)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-red-700">{status === 'active' ? <Trash2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}{status === 'active' ? 'Move to Trash' : 'Restore'}</button>}{onSelect && <button type="button" disabled={!resultItems.length || !!busy} onClick={() => onSelect(resultItems)} className="inline-flex items-center gap-2 rounded-lg bg-[#064e3b] px-4 py-2 font-bold text-white disabled:opacity-50"><Check className="h-4 w-4" />Use Selected ({resultItems.length})</button>}</div>
    </div>
    {loading ? <div className="rounded-2xl bg-white p-14 text-center text-sm text-slate-500">Loading media...</div> : items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center text-sm text-slate-500">No media found. Click Rescan Media to index existing files or upload a new image.</div> :
      <div className={view === 'grid' ? 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5' : 'space-y-2'}>
        {items.map(item => <button type="button" key={item.id} onClick={() => choose(item)} className={`group overflow-hidden border text-left transition hover:shadow-md ${view === 'grid' ? 'rounded-2xl bg-white shadow-sm' : 'flex items-center gap-4 rounded-xl bg-white p-2'} ${selected.includes(item.id) ? 'border-emerald-700 ring-2 ring-emerald-300' : 'border-slate-200'}`}>
          <div className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 ${view === 'grid' ? 'aspect-[5/4] w-full' : 'h-16 w-20 rounded-lg'}`}>
            {item.mimeType.startsWith('image/') ? <img loading="lazy" src={item.url} alt={item.name} className="h-full w-full object-contain" /> : <span className="text-emerald-700">{icon(item.mimeType)}</span>}
            <span className={`absolute left-2 top-2 rounded-md border bg-white p-1 ${selected.includes(item.id) ? 'border-emerald-700 text-emerald-700' : 'border-slate-200 text-slate-300'}`}>{selected.includes(item.id) ? <CheckSquare className="h-4 w-4" /> : <span className="block h-4 w-4" />}</span>
          </div>
          <div className="min-w-0 flex-1 p-2.5"><p className="truncate text-xs font-bold text-slate-800" title={item.name}>{item.name}</p><p className="mt-1 truncate text-[11px] text-slate-500" title={item.relativePath}>{item.relativePath}</p><div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-slate-500"><span className="rounded bg-emerald-50 px-1.5 py-0.5 font-bold uppercase text-emerald-800">{item.mimeType.split('/').pop()}</span><span>{(item.sizeBytes / 1024).toFixed(1)} KB</span></div></div>
        </button>)}
      </div>}
    <div className="flex items-center justify-between gap-3 text-xs text-slate-500"><span>Showing {items.length} of {total} matching media files</span><div className="flex items-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Previous</button><span>Page {page} / {Math.max(1, Math.ceil(total / limit))}</span><button type="button" disabled={page * limit >= total} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:opacity-40">Next</button></div></div>
    {busy && <p role="status" className="text-center text-xs font-semibold text-primary">{busy === 'upload' ? 'Uploading and optimizing...' : busy === 'rescan' ? 'Indexing media...' : 'Processing media...'}</p>}
    {preview && <div role="dialog" aria-modal="true" aria-label="Media preview" className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/75 p-4" onMouseDown={e => { if (e.target === e.currentTarget) setPreview(null); }}><div className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="truncate font-bold text-[#092a35]">{preview.name}</h3><button type="button" aria-label="Close preview" onClick={() => setPreview(null)} className="rounded-lg p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="flex max-h-[65vh] min-h-40 items-center justify-center overflow-hidden rounded-xl bg-slate-100">{preview.mimeType.startsWith('image/') ? <img src={preview.url} alt={preview.name} className="max-h-[65vh] w-full object-contain" /> : <a href={preview.url} target="_blank" rel="noreferrer" className="font-semibold text-emerald-800 underline">Open file in a new tab</a>}</div><p className="mt-3 break-all text-xs text-slate-600">{preview.url} · {(preview.sizeBytes / 1024).toFixed(1)} KB · {preview.storage}</p></div></div>}
  </div>;
}
