'use client';

import { useEffect, useRef, useState } from 'react';
import { Extension } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { RICH_TEXT_PROSE_CLASS } from '@/lib/richTextProseClass';

const TextStyleCustomAttributes = Extension.create({
  name: 'textStyleCustomAttributes',
  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
          fontWeight: {
            default: null,
            parseHTML: (element) => element.style.fontWeight || null,
            renderHTML: (attributes) => {
              if (!attributes.fontWeight) return {};
              return {
                style: `font-weight: ${attributes.fontWeight}`,
              };
            },
          },
          fontFamily: {
            default: null,
            parseHTML: (element) => element.style.fontFamily || null,
            renderHTML: (attributes) => {
              if (!attributes.fontFamily) return {};
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },
});

const HEADING_FONT_STYLES: Record<string, { fontSize: string; fontWeight: string }> = {
  h1: { fontSize: '1.875rem', fontWeight: 'bold' },
  h2: { fontSize: '1.5rem', fontWeight: 'bold' },
  h3: { fontSize: '1.25rem', fontWeight: 'bold' },
  h4: { fontSize: '1.125rem', fontWeight: 'bold' },
  h5: { fontSize: '1rem', fontWeight: 'bold' },
  h6: { fontSize: '0.875rem', fontWeight: 'bold' },
};

const COLOR_OPTIONS = [
  { id: 'default', label: 'Default Ink', value: '', previewBg: '#132723' },
  { id: 'primary', label: 'Primary', value: '#004B39', previewBg: '#004B39' },
  { id: 'gold', label: 'Gold', value: '#DB9E30', previewBg: '#DB9E30' },
  { id: 'gold-lt', label: 'Gold Light', value: '#E7BE6E', previewBg: '#E7BE6E' },
  { id: 'ink-lt', label: 'Ink Light', value: '#899391', previewBg: '#899391' },
];

const FONT_OPTIONS = [
  { id: 'default', label: 'Font: Default', value: '' },
  { id: 'sans', label: 'Plus Jakarta Sans', value: 'var(--sans)' },
  { id: 'serif', label: 'Marcellus', value: 'var(--serif)' },
];

interface TiptapEditorProps {
  /** Current HTML string value */
  value: string;
  /** Called with the new HTML string on every content change */
  onChange: (html: string) => void;
  /** Optional min-height for the editable area (CSS value, default '180px') */
  minHeight?: string;
  /** Optional max-height for the editable area (CSS value, default '450px') */
  maxHeight?: string;
}

function ToolbarButton({
  onClick,
  active = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // keep editor focused
        if (!disabled) onClick();
      }}
      disabled={disabled}
      title={title}
      className={[
        'inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold transition-colors border-none cursor-pointer select-none',
        active ? 'bg-primary text-white' : 'bg-transparent text-ink hover:bg-gold/20',
        disabled ? 'opacity-30 cursor-not-allowed' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span className="w-px h-5 bg-slate-300/70 mx-1 self-center shrink-0" />;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * If the stored value contains HTML-entity-encoded tags (e.g. the user typed
 * raw `<h2>` into a plain textarea before Tiptap was active), unescape them
 * so Tiptap receives real markup instead of literal `&lt;h2&gt;` text nodes.
 *
 * This runs only in the browser, which is fine because TiptapEditor is
 * 'use client' and never SSR-rendered.
 */
function unescapeHtml(raw: string): string {
  if (!raw || typeof document === 'undefined') return raw;
  // Fast-path: if no entities present, skip the DOM round-trip
  if (!raw.includes('&lt;') && !raw.includes('&amp;') && !raw.includes('&gt;')) return raw;
  const el = document.createElement('div');
  el.innerHTML = raw;
  return el.textContent || el.innerText || raw;
}

/**
 * Normalise a value coming from the DB / props into clean HTML for Tiptap.
 * - If the string already looks like HTML (starts with `<`), return as-is.
 * - If it's entity-escaped HTML (first real char after unescaping is `<`),
 *   unescape it first.
 */
function toTiptapContent(value: string): string {
  if (!value) return '<p></p>';
  const trimmed = value.trim();
  // Already valid HTML
  if (trimmed.startsWith('<')) return trimmed;
  // Entity-encoded HTML stored as text — unescape first
  const unescaped = unescapeHtml(trimmed);
  if (unescaped.trim().startsWith('<')) return unescaped.trim();
  // Plain text — wrap in a paragraph
  return `<p>${trimmed}</p>`;
}

export default function TiptapEditor({
  value,
  onChange,
  minHeight = '220px',
  maxHeight = '420px',
}: TiptapEditorProps) {
  // Track whether the editor has been initialised so we don't re-set content
  // on the very first render (it was already provided via `content:`).
  const isMounted = useRef(false);

  const [sourceMode, setSourceMode] = useState(false);
  const [htmlSource, setHtmlSource] = useState('');
  const [, setSelectionTick] = useState(0);

  const highlightColorInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      TextStyle,
      TextStyleCustomAttributes,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    // Pass the initial HTML value directly — Tiptap parses it as markup
    content: toTiptapContent(value),
    editorProps: {
      attributes: {
        class: `${RICH_TEXT_PROSE_CLASS} px-4 py-3 focus:outline-none min-h-full`,
      },
    },
    onUpdate({ editor: ed }) {
      onChange(ed.isEmpty ? '' : ed.getHTML());
    },
    onSelectionUpdate() {
      // Auto-detect formatting on cursor move / text selection (MS Word style)
      setSelectionTick((t) => t + 1);
    },
    onTransaction() {
      setSelectionTick((t) => t + 1);
    },
    // Avoid SSR/hydration mismatch in Next.js
    immediatelyRender: false,
  });

  // Sync when the `value` prop changes externally (e.g. DB load after mount).
  // Skip the first run — content was already set via `content:` above.
  useEffect(() => {
    if (!editor) return;

    if (!isMounted.current) {
      isMounted.current = true;
      return; // skip — initial value already applied by useEditor
    }

    const incoming = toTiptapContent(value);
    const current = editor.isEmpty ? '' : editor.getHTML();

    // Only call setContent when the value genuinely differs to avoid
    // resetting cursor position on every keystroke.
    if (incoming !== current) {
      editor.commands.setContent(incoming || '<p></p>', { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  // ── Auto-Detect Tag / Heading ──
  const getActiveBlockType = () => {
    const textStyleAttrs = editor.getAttributes('textStyle');
    const inlineFontSize = textStyleAttrs?.fontSize;

    if (inlineFontSize) {
      if (inlineFontSize.includes('1.875rem') || inlineFontSize === '30px' || inlineFontSize === '28px') return 'h1';
      if (inlineFontSize.includes('1.5rem') || inlineFontSize === '24px') return 'h2';
      if (inlineFontSize.includes('1.25rem') || inlineFontSize === '20px') return 'h3';
      if (inlineFontSize.includes('1.125rem') || inlineFontSize === '18px') return 'h4';
      if (inlineFontSize.includes('1rem') || inlineFontSize === '16px') return 'h5';
      if (inlineFontSize.includes('0.875rem') || inlineFontSize === '14px') return 'h6';
    }

    for (let level = 1; level <= 6; level++) {
      if (editor.isActive('heading', { level })) {
        return `h${level}`;
      }
    }

    return 'p';
  };

  // ── Auto-Detect Font Family ──
  const getActiveFont = () => {
    const rawFont = (editor.getAttributes('textStyle').fontFamily as string)?.toLowerCase() || '';
    if (!rawFont) return 'default';
    if (rawFont.includes('serif') || rawFont.includes('marcellus')) return 'serif';
    if (rawFont.includes('sans') || rawFont.includes('jakarta')) return 'sans';
    return 'default';
  };

  // ── Auto-Detect Text Color ──
  const getActiveColor = () => {
    const rawColor = (editor.getAttributes('textStyle').color as string)?.toLowerCase() || '';
    if (!rawColor) return 'default';
    if (rawColor === '#004b39' || rawColor.includes('var(--primary)') || rawColor === 'rgb(0, 75, 57)') return 'primary';
    if (rawColor === '#db9e30' || rawColor.includes('var(--gold)') || rawColor === 'rgb(219, 158, 48)') return 'gold';
    if (rawColor === '#e7be6e' || rawColor.includes('var(--gold-lt)') || rawColor === 'rgb(231, 190, 110)') return 'gold-lt';
    if (rawColor === '#132723' || rawColor.includes('var(--ink)') || rawColor === 'rgb(19, 39, 35)') return 'ink';
    if (rawColor === '#899391' || rawColor.includes('var(--ink-light)') || rawColor.includes('var(--ink-lt)')) return 'ink-lt';
    return rawColor;
  };

  const activeBlockType = getActiveBlockType();
  const activeFont = getActiveFont();
  const activeColor = getActiveColor();

  const applyBlockType = (type: string) => {
    const isTextSelected = editor && !editor.state.selection.empty;

    if (isTextSelected) {
      // Apply style ONLY on selected text, keeping the rest of the paragraph intact
      if (type in HEADING_FONT_STYLES) {
        const { fontSize, fontWeight } = HEADING_FONT_STYLES[type];
        editor
          .chain()
          .focus()
          .setMark('textStyle', { fontSize, fontWeight })
          .run();
      } else {
        // Clear custom inline font size / weight when choosing paragraph
        editor
          .chain()
          .focus()
          .setMark('textStyle', { fontSize: null, fontWeight: null })
          .removeEmptyTextStyle()
          .run();
      }
    } else {
      // No text selected: change the block format
      if (type === 'p' || type === 'div' || type === 'span') {
        editor.chain().focus().setParagraph().run();
      } else if (type.startsWith('h')) {
        const level = parseInt(type.replace('h', ''), 10) as 1 | 2 | 3 | 4 | 5 | 6;
        editor.chain().focus().toggleHeading({ level }).run();
      }
    }
  };

  const applyFont = (fontId: string) => {
    const opt = FONT_OPTIONS.find((f) => f.id === fontId);
    if (!opt || !opt.value) {
      editor
        .chain()
        .focus()
        .setMark('textStyle', { fontFamily: null })
        .removeEmptyTextStyle()
        .run();
    } else {
      editor
        .chain()
        .focus()
        .setMark('textStyle', { fontFamily: opt.value })
        .run();
    }
  };

  const applyColor = (colorId: string) => {
    const opt = COLOR_OPTIONS.find((c) => c.id === colorId);
    if (!opt || !opt.value) {
      editor.chain().focus().unsetColor().run();
    } else {
      editor.chain().focus().setColor(opt.value).run();
    }
  };

  const handleLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter URL', prev ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    }
  };

  const toggleSourceMode = () => {
    if (!sourceMode) {
      // Visual editor -> HTML source
      setHtmlSource(editor.getHTML());
      setSourceMode(true);
    } else {
      // HTML source -> Visual editor
      editor.commands.setContent(htmlSource || '<p></p>', { emitUpdate: false });
      onChange(editor.isEmpty ? '' : editor.getHTML());
      setSourceMode(false);
    }
  };

  const currentHighlightColor = (editor.getAttributes('highlight').color as string) || '#fef08a';
  const hasHighlight = editor.isActive('highlight');
  const activeColorPreview = COLOR_OPTIONS.find((c) => c.id === activeColor)?.previewBg || (activeColor !== 'default' ? activeColor : '#132723');

  return (
    <div className="flex flex-col rounded-xl border border-gold/50 overflow-hidden bg-gold-lt/10 text-ink focus-within:border-primary transition-colors">
      {/* ── Toolbar ── */}
      <div className="shrink-0 flex flex-wrap items-center gap-1 px-2.5 py-2 bg-paper border-b border-line">
        {/* Paragraph / Heading picker */}
        <select
          value={activeBlockType}
          onChange={(e) => applyBlockType(e.target.value)}
          className="text-[11px] font-semibold border border-slate-300/80 rounded-md px-2 py-1 bg-white text-slate-800 outline-none cursor-pointer hover:border-primary transition-colors"
          title="Format / Heading"
        >
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
          <option value="h5">Heading 5</option>
          <option value="h6">Heading 6</option>
          <option value="p">Paragraph</option>
        </select>

        {/* Font Family Dropdown */}
        <select
          value={activeFont}
          onChange={(e) => applyFont(e.target.value)}
          className="text-[11px] font-semibold border border-slate-300/80 rounded-md px-2 py-1 bg-white text-slate-800 outline-none cursor-pointer hover:border-primary transition-colors"
          title="Font Family"
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.id} value={f.id} style={f.value ? { fontFamily: f.value } : undefined}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Text Color Dropdown */}
        <div className="inline-flex items-center gap-1.5 bg-white border border-slate-300/80 rounded-md px-1.5 py-0.5">
          <span
            className="w-3 h-3 rounded-full border border-slate-300 shrink-0 transition-colors"
            style={{ backgroundColor: activeColorPreview }}
            title="Active text color"
          />
          <select
            value={activeColor}
            onChange={(e) => applyColor(e.target.value)}
            className="text-[11px] font-semibold bg-transparent text-slate-800 outline-none cursor-pointer border-none p-0 pr-1 hover:text-primary transition-colors"
            title="Text Color"
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c.id} value={c.id} style={c.value ? { color: c.value, fontWeight: 'bold' } : undefined}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <Sep />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em className="not-italic font-bold" style={{ fontStyle: 'italic' }}>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolbarButton>

        <Sep />

        {/* Highlight / Background Color Controls */}
        <div className="inline-flex items-center gap-0.5 relative">
          <input
            ref={highlightColorInputRef}
            type="color"
            value={currentHighlightColor}
            onChange={(e) => {
              editor.chain().focus().toggleHighlight({ color: e.target.value }).run();
            }}
            className="sr-only"
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              highlightColorInputRef.current?.click();
            }}
            title="Highlight color"
            className={[
              'inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold transition-colors border-none cursor-pointer select-none hover:bg-gold/20',
              hasHighlight ? 'bg-amber-200 text-amber-950' : 'bg-transparent text-ink',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="px-1 py-0.5 rounded text-[11px] font-bold" style={{ backgroundColor: hasHighlight ? currentHighlightColor : 'transparent' }}>
              🖊
            </span>
          </button>
          {hasHighlight && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().unsetHighlight().run();
              }}
              title="Remove highlight"
              className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] bg-slate-200 hover:bg-red-100 hover:text-red-600 text-slate-600 cursor-pointer border-none"
            >
              ✕
            </button>
          )}
        </div>

        <Sep />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="2" cy="4" r="1.5" /><rect x="5" y="3" width="10" height="2" rx="1" />
            <circle cx="2" cy="8" r="1.5" /><rect x="5" y="7" width="10" height="2" rx="1" />
            <circle cx="2" cy="12" r="1.5" /><rect x="5" y="11" width="10" height="2" rx="1" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered list"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <text x="0" y="5" fontSize="5" fontWeight="bold">1.</text>
            <rect x="5" y="3" width="10" height="2" rx="1" />
            <text x="0" y="9" fontSize="5" fontWeight="bold">2.</text>
            <rect x="5" y="7" width="10" height="2" rx="1" />
            <text x="0" y="13" fontSize="5" fontWeight="bold">3.</text>
            <rect x="5" y="11" width="10" height="2" rx="1" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <rect x="0" y="2" width="2" height="12" rx="1" />
            <rect x="4" y="4" width="11" height="2" rx="1" />
            <rect x="4" y="8" width="9" height="2" rx="1" />
          </svg>
        </ToolbarButton>

        <Sep />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <rect x="0" y="1" width="16" height="2" rx="1" /><rect x="0" y="5" width="11" height="2" rx="1" />
            <rect x="0" y="9" width="16" height="2" rx="1" /><rect x="0" y="13" width="9" height="2" rx="1" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <rect x="0" y="1" width="16" height="2" rx="1" /><rect x="2.5" y="5" width="11" height="2" rx="1" />
            <rect x="0" y="9" width="16" height="2" rx="1" /><rect x="3.5" y="13" width="9" height="2" rx="1" />
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
            <rect x="0" y="1" width="16" height="2" rx="1" /><rect x="5" y="5" width="11" height="2" rx="1" />
            <rect x="0" y="9" width="16" height="2" rx="1" /><rect x="7" y="13" width="9" height="2" rx="1" />
          </svg>
        </ToolbarButton>

        <Sep />

        <ToolbarButton
          onClick={handleLink}
          active={editor.isActive('link')}
          title="Insert / edit link"
        >
          🔗
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().extendMarkRange('link').unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Remove link"
        >
          ✂️
        </ToolbarButton>

        <Sep />

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          —
        </ToolbarButton>
        <ToolbarButton
          onClick={toggleSourceMode}
          active={sourceMode}
          title={sourceMode ? 'Visual editor' : 'Edit HTML source'}
        >
          <code className="text-[10px]">{'</>'}</code>
        </ToolbarButton>
      </div>

      {/* ── Editable content area ── */}
      <div
        className="w-full overflow-y-auto bg-white transition-[height] duration-150 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
        style={{ minHeight, maxHeight }}
      >
        {sourceMode ? (
          <textarea
            value={htmlSource}
            onChange={(e) => {
              setHtmlSource(e.target.value);
              onChange(e.target.value);
            }}
            spellCheck={false}
            style={{ minHeight }}
            className="w-full min-h-full h-full resize-none outline-none border-none bg-white text-slate-800 font-mono text-xs leading-relaxed p-4"
          />
        ) : (
          <EditorContent
            editor={editor}
            className="min-h-full"
          />
        )}
      </div>
    </div>
  );
}
