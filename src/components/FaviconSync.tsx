'use client';

import { useEffect } from 'react';

export function updateBrowserFavicon(url: string) {
  if (typeof document === 'undefined' || !url) return;

  let finalUrl = url;
  if (url.startsWith('/')) {
    finalUrl = `${window.location.origin}${url}`;
  }

  let mimeType = 'image/x-icon';
  const lower = finalUrl.toLowerCase();
  if (lower.endsWith('.png')) mimeType = 'image/png';
  else if (lower.endsWith('.svg')) mimeType = 'image/svg+xml';
  else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mimeType = 'image/jpeg';
  else if (lower.endsWith('.webp')) mimeType = 'image/webp';

  // Update existing favicon link tags safely without breaking React DOM trees
  const existingLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
  if (existingLinks.length > 0) {
    existingLinks.forEach((el) => {
      el.type = mimeType;
      el.href = finalUrl;
    });
  } else {
    // Create new icon links if none exist
    const link = document.createElement('link');
    link.type = mimeType;
    link.rel = 'icon';
    link.href = finalUrl;
    document.head.appendChild(link);

    const shortcutLink = document.createElement('link');
    shortcutLink.type = mimeType;
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.href = finalUrl;
    document.head.appendChild(shortcutLink);
  }
}

export default function FaviconSync({ faviconUrl }: { faviconUrl?: string }) {
  useEffect(() => {
    if (faviconUrl) {
      updateBrowserFavicon(faviconUrl);
    }
  }, [faviconUrl]);

  return null;
}
