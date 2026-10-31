/**
 * Validate first-party SVG assets without accepting active SVG content.
 * Common icon exporters add XML declarations, comments, harmless metadata,
 * standard XML entities and CSS classes. These must not break uploads.
 * Executable markup, external references, events and risky CSS are rejected.
 * Render the result only as an image, never inline SVG or object/embed.
 */
const ELEMENTS = new Set([
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline',
  'polygon', 'defs', 'linearGradient', 'radialGradient', 'stop',
  'clipPath', 'mask', 'title', 'desc', 'text', 'tspan', 'style',
  'use', 'symbol', 'pattern', 'image',
]);
const ATTRIBUTES = new Set([
  'xmlns', 'xmlns:xlink', 'version', 'viewBox', 'width', 'height',
  'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
  'd', 'points', 'id', 'class', 'fill', 'fill-rule', 'fill-opacity',
  'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
  'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset',
  'stroke-opacity', 'opacity', 'transform', 'clip-path', 'mask',
  'offset', 'stop-color', 'stop-opacity', 'gradientUnits',
  'gradientTransform', 'fx', 'fy', 'spreadMethod', 'preserveAspectRatio',
  'font-size', 'font-family', 'font-weight', 'text-anchor',
  'dominant-baseline', 'letter-spacing', 'vector-effect',
  'shape-rendering', 'role', 'aria-label', 'aria-hidden', 'focusable',
  'style', 'type', 'xml:space', 'xlink:href', 'href', 'display',
  'color', 'color-interpolation-filters', 'paint-order',
  'fill-rule', 'clip-rule', 'stroke-dashoffset', 'stroke-linejoin',
]);
const FRAGMENT = /^#[A-Za-z_][\w.:-]*$/;
const FRAGMENT_URL = /^url\(\s*['"]?#[A-Za-z_][\w.:-]*['"]?\s*\)$/;
const STYLE_PROPS = new Set([
  'fill','fill-rule','fill-opacity','stroke','stroke-width','stroke-linecap',
  'stroke-linejoin','stroke-dasharray','stroke-dashoffset','stroke-opacity',
  'opacity','stop-color','stop-opacity','clip-path','mask','color','display',
  'font-size','font-family','font-weight','text-anchor','paint-order',
  'vector-effect','shape-rendering','enable-background',
]);

function decodeEntities(value: string) {
  return value.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos);/g, (_, entity: string) => {
    const predefined: Record<string,string> = {amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"};
    if (predefined[entity]) return predefined[entity];
    const n = entity.startsWith('#x') ? parseInt(entity.slice(2),16) : parseInt(entity.slice(1),10);
    if (!Number.isFinite(n) || n < 1 || n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) throw new Error('Invalid XML entity');
    return String.fromCodePoint(n);
  });
}
function validateEntities(value: string): string {
  if (/&(?!(?:#x[0-9a-fA-F]+|#[0-9]+|amp|lt|gt|quot|apos);)/.test(value)) {
    throw new Error('SVG contains unsupported XML entities');
  }
  return decodeEntities(value);
}
function validateCss(css: string) {
  const value = validateEntities(css);
  if (/[\\@<>]/.test(value) || /(?:expression|behavior|javascript|data|import|binding|https?|file):?/i.test(value)) {
    throw new Error('Unsafe SVG CSS');
  }
  // Style blocks use simple class/id/tag selectors. No CSS variables, at-rules,
  // selectors which could style the surrounding document, or external assets.
  const blocks = value.includes('{')
    ? [...value.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => [m[1],m[2]])
    : [['',value]];
  if (value.includes('{') && blocks.map(([selector,body]) => `${selector}{${body}}`).join('').replace(/\s/g,'') !== value.replace(/\s/g,'')) {
    throw new Error('Unsupported SVG stylesheet');
  }
  for (const [selector, declarations] of blocks) {
    if (selector && !/^\s*(?:[.#]?[A-Za-z_][\w-]*)(?:\s*,\s*[.#]?[A-Za-z_][\w-]*)*\s*$/.test(selector)) throw new Error('Unsupported SVG CSS selector');
    for (const declaration of declarations.split(';')) {
      if (!declaration.trim()) continue;
      const match = /^\s*([a-z-]+)\s*:\s*(.+?)\s*$/.exec(declaration);
      if (!match || !STYLE_PROPS.has(match[1])) throw new Error('Unsupported SVG CSS property');
      const v = match[2];
      if (v.length > 512 || /[{};\\]/.test(v) || /url\s*\(/i.test(v) && !FRAGMENT_URL.test(v) || /[<>]/.test(v)) throw new Error('Unsafe SVG CSS value');
    }
  }
}

export function validateSafeSvg(input: Buffer): Buffer {
  if (input.length === 0 || input.length > 2 * 1024 * 1024) throw new Error('SVG must be between 1 byte and 2 MB');
  let xml = new TextDecoder('utf-8',{fatal:true}).decode(input).replace(/^\uFEFF/,'').trim();
  xml = xml.replace(/^<\?xml\s+version=["']1\.[01]["'](?:\s+encoding=["'](?:UTF-8|utf-8)["'])?(?:\s+standalone=["'](?:yes|no)["'])?\s*\?>\s*/,'');
  // Common old Adobe SVG exports include the standard public SVG 1.1 DTD.
  // Discard that declaration without resolving it. Internal subsets and all
  // other DTDs stay forbidden.
  xml = xml.replace(/^<!DOCTYPE\s+svg\s+PUBLIC\s+["']-\/\/W3C\/\/DTD SVG 1\.1\/\/EN["']\s+["']http:\/\/www\.w3\.org\/Graphics\/SVG\/1\.1\/DTD\/svg11\.dtd["']\s*>\s*/i, '');
  // Comments and editor metadata are not part of rendered artwork.
  xml = xml.replace(/<!--[\s\S]*?-->/g,'');
  xml = xml.replace(/<metadata\b[^>]*>[\s\S]*?<\/metadata\s*>/g,'');
  // Ignore unused editor namespace declarations; active namespaced content
  // still fails the strict allowlist below.
  xml = xml.replace(/\s+xmlns:([A-Za-z][\w.-]*)\s*=\s*(["'][^"']*["'])/g, (full, prefix: string) => {
    if (prefix === 'xlink') return full;
    const usage = new RegExp(`(?:<\\/?|\\s)${prefix}:`);
    return usage.test(xml.replace(full, '')) ? full : '';
  });
  // Reject all DTDs (including internal entities) and processing instructions.
  if (!xml || /<!|<\?|\]\]>|<\s*(?:script|foreignObject|iframe)\b/i.test(xml)) {
    throw new Error('SVG contains unsupported XML features or entities');
  }
  validateEntities(xml);
  const stack: string[] = [];
  const tag = /<\s*(\/?)\s*([A-Za-z][A-Za-z0-9]*)\b([^<>]*?)(\/?)\s*>/g;
  let index = 0;
  let rootSeen = false;
  for (let match = tag.exec(xml); match; match = tag.exec(xml)) {
    const between = xml.slice(index,match.index);
    if (/[<>]/.test(between) || (!stack.length && between.trim())) throw new Error('Invalid SVG markup');
    if (stack[stack.length-1] === 'style') validateCss(between);
    index = tag.lastIndex;
    const [,closing,element,attributes,selfClosing] = match;
    if (!ELEMENTS.has(element)) throw new Error(`Unsupported SVG element: ${element}`);
    if (closing) {
      if (attributes.trim() || selfClosing || stack.pop() !== element) throw new Error('Invalid SVG closing tag');
      continue;
    }
    if (!stack.length) {
      if (rootSeen || element !== 'svg') throw new Error('SVG must have exactly one svg root');
      rootSeen = true;
    }
    const attrPattern = /([A-Za-z_][A-Za-z0-9_.:-]*)\s*=\s*(?:"([^"<>]*)"|'([^'<>]*)')/g;
    let last = 0;
    const seen = new Set<string>();
    for (let attr = attrPattern.exec(attributes); attr; attr = attrPattern.exec(attributes)) {
      if (attributes.slice(last,attr.index).trim()) throw new Error('Invalid SVG attribute syntax');
      last = attrPattern.lastIndex;
      const name = attr[1];
      const value = validateEntities(attr[2] ?? attr[3] ?? '');
      if (!ATTRIBUTES.has(name) || seen.has(name)) throw new Error(`Unsupported SVG attribute: ${name}`);
      seen.add(name);
      if (value.length > 4096 || /[\x00-\x1F<>]/.test(value)) throw new Error(`Unsafe SVG ${name} attribute`);
      if (name === 'xmlns' && (element !== 'svg' || value !== 'http://www.w3.org/2000/svg')) throw new Error('Unsupported SVG XML namespace');
      if (name === 'xmlns:xlink' && (element !== 'svg' || value !== 'http://www.w3.org/1999/xlink')) throw new Error('Unsupported SVG XML namespace');
      if (name === 'type' && (element !== 'style' || value !== 'text/css')) throw new Error('Unsupported SVG type');
      if (name === 'xlink:href' || name === 'href') {
        if (!FRAGMENT.test(value)) throw new Error('External SVG references are not allowed');
      } else if (name === 'style') {
        validateCss(value);
      } else if (value.includes('url(')) {
        if (!['fill','stroke','clip-path','mask'].includes(name) || !FRAGMENT_URL.test(value)) throw new Error('External SVG references are not allowed');
      } else if (/(?:javascript|data|vbscript|https?|file):/i.test(value) && name !== 'xmlns' && name !== 'xmlns:xlink') {
        throw new Error(`Unsafe SVG ${name} attribute`);
      }
    }
    if (attributes.slice(last).trim()) throw new Error('Invalid SVG attributes');
    if (!selfClosing) stack.push(element);
  }
  if (!rootSeen || stack.length || /[<>]/.test(xml.slice(index)) || xml.slice(index).trim()) throw new Error('Invalid or unbalanced SVG XML');
  return Buffer.from(xml,'utf8');
}
