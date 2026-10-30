/** A deliberately restrictive SVG allowlist for files served as first-party media.
 * SVG is XML and can execute code if it contains event handlers, foreignObject,
 * links, CSS, external resources or other active markup. Accept simple icons only.
 * An unsupported or ambiguous SVG is rejected instead of being modified silently.
 */
const ELEMENTS = new Set([
  'svg', 'g', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline',
  'polygon', 'defs', 'linearGradient', 'radialGradient', 'stop',
  'clipPath', 'mask', 'title', 'desc', 'text', 'tspan',
]);
const ATTRIBUTES = new Set([
  'xmlns', 'version', 'viewBox', 'width', 'height', 'x', 'y', 'x1', 'y1',
  'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'id', 'class',
  'fill', 'fill-rule', 'fill-opacity', 'stroke', 'stroke-width',
  'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit',
  'stroke-dasharray', 'stroke-dashoffset', 'stroke-opacity', 'opacity',
  'transform', 'clip-path', 'mask', 'offset', 'stop-color', 'stop-opacity',
  'gradientUnits', 'gradientTransform', 'fx', 'fy', 'spreadMethod',
  'preserveAspectRatio', 'font-size', 'font-family', 'font-weight',
  'text-anchor', 'dominant-baseline', 'letter-spacing', 'vector-effect',
  'shape-rendering', 'role', 'aria-label', 'focusable',
]);
const FRAGMENT_REF = /^url\(\s*['"]?#[a-zA-Z][a-zA-Z0-9_.:-]*['"]?\s*\)$/;

export function validateSafeSvg(input: Buffer): Buffer {
  if (input.length > 2 * 1024 * 1024) throw new Error('SVG must be smaller than 2 MB');
  let xml = new TextDecoder('utf-8', { fatal: true }).decode(input);
  xml = xml.replace(/^\uFEFF/, '').trim();
  xml = xml.replace(/^<\?xml\s+version=["']1\.[01]["'](?:\s+encoding=["']UTF-8["'])?\s*\?>\s*/i, '');
  // Reject entities, declarations, processing instructions, CSS, scripts, links,
  // and other features rather than attempting to sanitize unknown XML syntax.
  if (!xml || xml.length > 2_000_000 || /[&]|<!|<\?|\]\]>/.test(xml)) {
    throw new Error('SVG contains unsupported XML features or entities');
  }
  const stack: string[] = [];
  const tag = /<\s*(\/?)\s*([A-Za-z][A-Za-z0-9]*)\b([^<>]*?)(\/?)\s*>/g;
  let index = 0;
  let rootSeen = false;
  for (let match = tag.exec(xml); match; match = tag.exec(xml)) {
    const between = xml.slice(index, match.index);
    if (/[<>]/.test(between) || (stack.length === 0 && between.trim())) {
      throw new Error('Invalid SVG markup');
    }
    index = tag.lastIndex;
    const closing = Boolean(match[1]);
    const element = match[2];
    const attributes = match[3];
    const selfClosing = Boolean(match[4]);
    if (!ELEMENTS.has(element)) throw new Error(`Unsupported SVG element: ${element}`);
    if (closing) {
      if (attributes.trim() || selfClosing || stack.pop() !== element) throw new Error('Invalid SVG closing tag');
      continue;
    }
    if (stack.length === 0) {
      if (rootSeen || element !== 'svg') throw new Error('SVG must have exactly one svg root');
      rootSeen = true;
    }
    const attributePattern = /([A-Za-z][A-Za-z0-9-]*)\s*=\s*(?:"([^"<>]*)"|'([^'<>]*)')/g;
    let attributeIndex = 0;
    const seen = new Set<string>();
    for (let attribute = attributePattern.exec(attributes); attribute; attribute = attributePattern.exec(attributes)) {
      if (attributes.slice(attributeIndex, attribute.index).trim()) throw new Error('Invalid SVG attribute syntax');
      attributeIndex = attributePattern.lastIndex;
      const name = attribute[1];
      const value = attribute[2] ?? attribute[3] ?? '';
      if (!ATTRIBUTES.has(name) || seen.has(name)) throw new Error(`Unsupported SVG attribute: ${name}`);
      seen.add(name);
      if (value.length > 4096 || /[\x00-\x1F]/.test(value) || /(?:javascript|data|vbscript|https?|file):/i.test(value)) {
        if (!(name === 'xmlns' && value === 'http://www.w3.org/2000/svg')) {
          throw new Error(`Unsafe SVG ${name} attribute`);
        }
      }
      if (name === 'xmlns' && (element !== 'svg' || value !== 'http://www.w3.org/2000/svg')) {
        throw new Error('Unsupported SVG XML namespace');
      }
      if (value.includes('url(') && (!['fill','stroke','clip-path','mask'].includes(name) || !FRAGMENT_REF.test(value))) {
        throw new Error('External SVG references are not allowed');
      }
    }
    if (attributes.slice(attributeIndex).trim()) throw new Error('Invalid SVG attributes');
    if (!selfClosing) stack.push(element);
  }
  if (!rootSeen || stack.length || /[<>]/.test(xml.slice(index)) || xml.slice(index).trim()) {
    throw new Error('Invalid or unbalanced SVG XML');
  }
  return Buffer.from(xml, 'utf8');
}
