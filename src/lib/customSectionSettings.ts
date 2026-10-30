import type { CSSProperties } from 'react';

export const BUILDER_BLOCK_TYPES = ['container','grid','heading','paragraph','image','button','html','form'] as const;
export type BuilderBlockType = typeof BUILDER_BLOCK_TYPES[number];
export type BuilderNode = {
  id: string; type: string; content?: string; children?: BuilderNode[]; style?: Record<string, unknown>;
  [key: string]: any;
};
export const isBuilderContainer = (type: string) => type === 'container' || type === 'grid';
export const MAX_BUILDER_DEPTH = 9;

const makeId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
export const newBuilderBlock = (type: string): BuilderNode => ({
  id: makeId(), type,
  content: type === 'heading' ? 'Your Heading' : type === 'paragraph' ? 'Add your text here.' : type === 'html' ? '<p>Custom content</p>' : '',
  tag: 'h2', children: isBuilderContainer(type) ? [] : undefined,
  style: isBuilderContainer(type) ? { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, gap: 16, columns: 2, direction: 'column' } : {},
  src: '', alt: '', href: '/contact', label: 'Learn More', title: 'Enquiry Form', submitLabel: 'Send Enquiry',
  fields: type === 'form' ? [
    { key: 'fullName', label: 'Full Name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Phone', type: 'tel', required: false },
    { key: 'message', label: 'Message', type: 'textarea', required: false },
  ] : undefined,
  emailTemplates: type === 'form' ? {
    admin: { to: '', cc: '', bcc: '', replyTo: '[Customer Email]', subject: 'New [Form Name] | [Customer Name]', body: '<h2>New [Form Name]</h2><p>Name: [Customer Name]</p><p>Email: [Customer Email]</p><p>Phone: [Customer Phone]</p><p>Reference: [enquiryNumber]</p><p>[message]</p>' },
    customer: { to: '[Customer Email]', cc: '', bcc: '', replyTo: '', subject: 'We received your enquiry | [enquiryNumber]', body: '<p>Dear [Customer Name],</p><p>We have received your enquiry and will contact you soon.</p><p>Reference: [enquiryNumber]</p>' },
  } : undefined,
});
export const defaultBuilderData = () => {
  const container = newBuilderBlock('container');
  container.children = [newBuilderBlock('heading'), newBuilderBlock('paragraph')];
  return {
    title: 'Custom Section',
    style: { backgroundColor: '#ffffff', textColor: '#1e293b', paddingTop: 32, paddingBottom: 32, paddingLeft: 20, paddingRight: 20, marginTop: 0, marginBottom: 0, maxWidth: 1200, columns: 1 },
    blocks: [container],
  };
};

function color(value: unknown) {
  return typeof value === 'string' && (/^#[a-f\d]{3,8}$/i.test(value) || /^(transparent|inherit|currentColor)$/i.test(value)) ? value : undefined;
}
function num(value: unknown, min: number, max: number): number | undefined {
  if (value === '' || value === null || value === undefined) return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : undefined;
}
export function sanitizeNodeStyle(source: any): CSSProperties {
  const s = source && typeof source === 'object' ? source : {};
  const result: CSSProperties = {};
  const set = (name: keyof CSSProperties, value: unknown) => { if (value !== undefined) (result as any)[name] = value; };
  set('backgroundColor', color(s.backgroundColor));
  set('color', color(s.textColor));
  set('borderColor', color(s.borderColor));
  set('fontSize', num(s.fontSize, 8, 100));
  set('fontWeight', [300,400,500,600,700,800,900].includes(Number(s.fontWeight)) ? Number(s.fontWeight) : undefined);
  set('lineHeight', num(s.lineHeight, 0.8, 3));
  set('letterSpacing', num(s.letterSpacing, -2, 12));
  set('borderRadius', num(s.borderRadius, 0, 100));
  set('borderWidth', num(s.borderWidth, 0, 20));
  if (result.borderWidth) result.borderStyle = 'solid';
  set('gap', num(s.gap, 0, 160));
  set('rowGap', num(s.rowGap, 0, 160));
  set('columnGap', num(s.columnGap, 0, 160));
  set('maxWidth', num(s.maxWidth, 100, 2200));
  set('minHeight', num(s.minHeight, 0, 1400));
  const span = num(s.columnSpan, 1, 12);
  if (span) result.gridColumn = `span ${Math.floor(span)} / span ${Math.floor(span)}`;
  if (s.width === 'auto' || s.width === '100%') set('width', s.width);
  else if (s.width !== '' && s.width !== undefined && s.width !== null) set('width', `${num(s.width, 0, 100) ?? 100}%`);
  for (const key of ['paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft'] as const) {
    set(key, num(s[key], key.startsWith('margin') ? -160 : 0, 300));
  }
  const textAlign = ['left','center','right','justify'].includes(s.textAlign) ? s.textAlign : undefined;
  set('textAlign', textAlign);
  if (['start','center','end','stretch'].includes(s.alignItems)) result.alignItems = s.alignItems === 'start' ? 'flex-start' : s.alignItems === 'end' ? 'flex-end' : s.alignItems;
  if (['start','center','end','between','around','evenly'].includes(s.justifyContent)) {
    result.justifyContent = ({start:'flex-start',end:'flex-end',between:'space-between',around:'space-around',evenly:'space-evenly'} as Record<string,string>)[s.justifyContent] || s.justifyContent;
  }
  return result;
}
export function sanitizeBuilderStyle(source: any): CSSProperties {
  return { backgroundColor: '#ffffff', color: '#1e293b', ...sanitizeNodeStyle(source) };
}
export function builderNodeLayout(node: BuilderNode): CSSProperties {
  const s = node.style || {};
  if (node.type === 'grid') {
    const columns = Math.max(1, Math.min(12, Number(s.columns) || 2));
    return { display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: num(s.gap,0,160) ?? 16 };
  }
  if (node.type === 'container') return { display: 'flex', flexDirection: s.direction === 'row' ? 'row' : 'column', flexWrap: s.wrap === true ? 'wrap' : 'nowrap', gap: num(s.gap,0,160) ?? 16 };
  return {};
}
export function findBuilderNode(nodes: unknown, id: string, depth = 0): BuilderNode | undefined {
  if (!Array.isArray(nodes) || depth > MAX_BUILDER_DEPTH) return;
  for (const node of nodes.slice(0, 200)) {
    if (!node || typeof node !== 'object' || node.hidden === true) continue;
    if (node.id === id) return node as BuilderNode;
    const match = findBuilderNode(node.children, id, depth + 1);
    if (match) return match;
  }
  return;
}
export function mapBuilderTree(nodes: BuilderNode[], callback: (node: BuilderNode) => BuilderNode, depth = 0): BuilderNode[] {
  if (depth > MAX_BUILDER_DEPTH) return nodes;
  return nodes.map(n => callback({ ...n, ...(Array.isArray(n.children) ? {children: mapBuilderTree(n.children, callback, depth + 1)} : {}) }));
}
export function removeBuilderNode(nodes: BuilderNode[], id: string): BuilderNode[] {
  return nodes.filter(n => n.id !== id).map(n => ({ ...n, ...(Array.isArray(n.children) ? {children: removeBuilderNode(n.children, id)} : {}) }));
}
export function countBuilderNodes(nodes: unknown, depth = 0): number {
  if (!Array.isArray(nodes) || depth > MAX_BUILDER_DEPTH) return 0;
  return nodes.reduce((sum: number, n: BuilderNode) => sum + 1 + countBuilderNodes(n?.children, depth + 1), 0);
}
