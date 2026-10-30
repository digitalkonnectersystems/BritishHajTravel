'use client';
import { useEffect, useState } from 'react';
import { getGlobalSoldOutBadgeAction } from '@/actions/soldOutSettingsActions';
let cachedBadge: string | undefined;
let request: Promise<string> | undefined;
function loadBadge(): Promise<string> {
  if (cachedBadge !== undefined) return Promise.resolve(cachedBadge);
  if (!request) request = getGlobalSoldOutBadgeAction().then(v => cachedBadge = v).finally(() => { request = undefined; });
  return request;
}
export default function SoldOutBadge({ imageOnly = false }: { imageOnly?: boolean }) {
  const [image, setImage] = useState<string>(cachedBadge || '');
  useEffect(() => { let active = true; loadBadge().then(v => { if (active) setImage(v); }); return () => { active = false; }; }, []);
  return image ? (
    <img src={image} alt="Sold Out" className="max-h-[110px] max-w-[75%] object-contain drop-shadow-xl" loading="lazy" />
  ) : (
    <span className={`inline-flex rounded-lg border-[3px] border-white px-4 py-1.5 text-xl font-black uppercase text-white -rotate-12 shadow-xl ${imageOnly ? 'bg-black/40' : 'bg-red-700/90'}`}>
      SOLD OUT
    </span>
  );
}
