'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { RICH_TEXT_PROSE_CLASS } from '@/lib/richTextProseClass';

// Editor content is HTML. Treat tags as markup rather than printing them as
// text, but never insert untrusted attributes, scripts or arbitrary embeds.
const ALLOWED = new Set([
  'p', 'div', 'span', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'hr', 'pre', 'code', 'mark', 'sub', 'sup', 'table',
  'thead', 'tbody', 'tr', 'th', 'td',
]);
const DROP = new Set(['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'svg', 'math', 'template']);
const STYLES = new Set(['color', 'background-color', 'font-size', 'font-family', 'font-weight', 'text-align', 'text-decoration', 'width', 'display', 'vertical-align', 'margin-left', 'margin-right']);

function normalizeEditorHtml(raw: string): string {
  const value = (raw || '').trim();
  if (!value || !/&lt;\/?(?:p|h[1-6]|strong|div|ul|ol|blockquote|span|br|a)\b/i.test(value)) return value;
  // Fully entity-escaped fragments are common in old rich-text records.
  // Decode only when the entire value is recognisable HTML markup.
  if (/^&lt;(?:p|div|h[1-6]|ul|ol|blockquote|strong|span)\b/i.test(value) && /&lt;\/[a-z][\w-]*&gt;\s*$/i.test(value)) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;
    if (/^<(?:p|div|h[1-6]|ul|ol|blockquote|strong|span)\b/i.test(textarea.value)) return textarea.value;
  }
  // Early Tiptap versions saved some source-mode HTML as escaped text in
  // paragraphs. Only convert paragraphs wholly consisting of recognizable
  // HTML; leave ordinary encoded less-than signs and code blocks intact.
  const documentValue = new DOMParser().parseFromString(value, 'text/html');
  for (const paragraph of Array.from(documentValue.body.querySelectorAll('p'))) {
    if (paragraph.children.length || !paragraph.textContent) continue;
    const decoded = paragraph.textContent.trim();
    if (!/^<(?:p|div|h[1-6]|ul|ol|li|strong|em|blockquote|span|a)\b/i.test(decoded) || !/<\/[a-z][\w-]*>\s*$/i.test(decoded)) continue;
    const template = documentValue.createElement('template');
    template.innerHTML = decoded;
    paragraph.replaceWith(template.content);
  }
  if (documentValue.body.innerHTML !== value) return documentValue.body.innerHTML;
  return value;
}

function safeUrl(url: string, image: boolean): boolean {
  const clean = url.trim();
  if (!clean) return false;
  if (clean.startsWith('/') && !clean.startsWith('//')) return true;
  if (image) return /^https:\/\//i.test(clean);
  return /^(https?:\/\/|mailto:|tel:|#)/i.test(clean);
}

function normalizeRichTextUrl(url: string): string {
  const clean = url.trim();
  return clean.startsWith('/uploads/')
    ? clean.replace(/^\/uploads\//, '/images_BHT/uploads/')
    : clean;
}

function scrubHtml(html: string, stripInlineTypography = false): string {
  const doc = new DOMParser().parseFromString(normalizeEditorHtml(html), 'text/html');
  const visit = (root: Element) => {
    for (const child of Array.from(root.children)) {
      const tag = child.tagName.toLowerCase();
      if (DROP.has(tag)) { child.remove(); continue; }
      visit(child);
      if (!ALLOWED.has(tag)) { child.replaceWith(...Array.from(child.childNodes)); continue; }
      for (const attr of Array.from(child.attributes)) {
        const key = attr.name.toLowerCase(), value = attr.value.trim();
        const allowed =
          (tag === 'a' && key === 'href' && safeUrl(value, false)) ||
          (tag === 'img' && key === 'src' && safeUrl(value, true)) ||
          ((tag === 'img' || tag === 'a') && (key === 'alt' || key === 'title')) ||
          (tag === 'img' && key === 'width' && /^\d{1,4}(px)?$/.test(value)) ||
          (tag === 'img' && key === 'data-align' && /^(left|center|right)$/.test(value)) ||
          (key === 'style');
        if (!allowed) { child.removeAttribute(attr.name); continue; }
        if (key === 'style') {
          const safeDeclarations = value.split(';').map(part => {
            const colon = part.indexOf(':');
            if (colon < 0) return '';
            const property = part.slice(0, colon).trim().toLowerCase();
            const setting = part.slice(colon + 1).trim();
            if (stripInlineTypography && (property === 'font-size' || property === 'font-family')) return '';
            if (!STYLES.has(property) || !setting || /[<>{};\\]|url\s*\(|expression\s*\(|@import/i.test(setting)) return '';
            if (!/^[-\w\s.,#()%\/+\"']{1,100}$/.test(setting)) return '';
            return `${property}: ${setting}`;
          }).filter(Boolean);
          if (safeDeclarations.length) child.setAttribute('style', safeDeclarations.join('; '));
          else child.removeAttribute('style');
        }
        if (tag === 'a' && key === 'href') child.setAttribute('href', normalizeRichTextUrl(value));
      }
      if (tag === 'a') { child.setAttribute('rel', 'noopener noreferrer'); }
    }
  };
  visit(doc.body);
  return doc.body.innerHTML;
}

function handleRichTextClick(event: MouseEvent<HTMLDivElement>) {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const anchor = target.closest('a');
  if (!(anchor instanceof HTMLAnchorElement) || !event.currentTarget.contains(anchor)) return;
  if (!anchor.textContent?.toLowerCase().includes('download visa application form')) return;

  const url = new URL(anchor.href, window.location.href);
  if (!/^https?:$/.test(url.protocol) || !url.pathname.toLowerCase().endsWith('.pdf')) return;

  event.preventDefault();
  window.open(url.toString(), '_blank', 'noopener,noreferrer');

  const download = document.createElement('a');
  download.href = url.toString();
  download.download = url.pathname.split('/').pop() || 'visa-application-form.pdf';
  document.body.appendChild(download);
  download.click();
  download.remove();
}

export default function SafeRichText({ html, className = '', unstyled = false, stripInlineTypography = false }: { html: string; className?: string; unstyled?: boolean; stripInlineTypography?: boolean }) {
  const [sanitized, setSanitized] = useState('');
  useEffect(() => { setSanitized(scrubHtml(html || '', stripInlineTypography)); }, [html, stripInlineTypography]);
  // Components with a dedicated typographic system may opt out of the shared prose utility classes.
  const proseClass = unstyled ? className : `${RICH_TEXT_PROSE_CLASS} ${className}`;
  // Render as plain text until the browser sanitizer has processed the HTML.
  if (!sanitized) return <div className={proseClass} onClick={handleRichTextClick}>{html && !/<\/?[a-z]/i.test(html) ? html : null}</div>;
  return <div className={proseClass} onClick={handleRichTextClick} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
