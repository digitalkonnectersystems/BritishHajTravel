/** Small dependency-free, paginated, printable PDF report for activity log exports. */
export type ActivityExportRow = {
  date: string;
  category: string;
  action: string;
  status: string;
  user: string;
  email: string;
  ipAddress: string;
  details: string;
};

function safeText(text: string, limit = 160) {
  return String(text || '').replace(/[\r\n\t]/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF]/g, '?').slice(0, limit)
    .replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

export function activityReportPdf(rows: ActivityExportRow[], from: string, to: string): Buffer {
  const PAGE_W = 842, PAGE_H = 595;
  const pages = Math.max(1, Math.ceil(rows.length / 16));
  const objects: string[] = [];
  // Use one-indexed reference identifiers for a conventional PDF cross-reference table.
  const add = (value: string) => { objects.push(value); return objects.length; };
  const catalog = add('');
  const pageTree = add('');
  const font = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageRefs: number[] = [];
  const write = (commands: string[], x: number, y: number, value: string, size = 9, color = '0.01 0.055 0.263') => {
    commands.push(`${color} rg BT /F1 ${size} Tf 1 0 0 1 ${x} ${y} Tm (${safeText(value)}) Tj ET`);
  };
  for (let pageIndex = 0; pageIndex < pages; pageIndex++) {
    const commands: string[] = [];
    commands.push(`0.008 0.055 0.263 rg 0 519 ${PAGE_W} 76 re f`);
    commands.push('0.7098 0 0.0275 rg 0 514 842 5 re f');
    write(commands, 35, 556, 'BRITISH HAJ TRAVEL  |  ACTIVITY LOG REPORT', 16, '1 1 1');
    write(commands, 35, 533, `From ${from} to ${to}  |  Asia/Karachi  |  ${rows.length} records`, 9, '1 1 1');
    commands.push('0.93 0.95 0.98 rg 30 480 782 23 re f');
    const cols = [35, 149, 269, 440, 574, 665, 737];
    ['Date / time','Section','Action','User','IP address','Status'].forEach((label,i) => write(commands, cols[i], 488, label, 9));
    const pageRows = rows.slice(pageIndex * 16, (pageIndex + 1) * 16);
    pageRows.forEach((row, index) => {
      const y = 465 - index * 27;
      if (index % 2 === 0) commands.push(`0.976 0.982 0.991 rg 30 ${y - 19} 782 27 re f`);
      const values = [row.date, row.category, row.action, row.user, row.ipAddress, row.status];
      const limits = [21, 24, 32, 21, 20, 12];
      values.forEach((value, col) => write(commands, cols[col], y, value.slice(0, limits[col]), 8));
      const sub = [row.email, row.details].filter(Boolean).join(' | ');
      if (sub) write(commands, 35, y - 11, sub, 7, '0.35 0.42 0.51');
    });
    commands.push('0.85 0.87 0.9 RG 30 34 m 812 34 l S');
    write(commands, 35, 20, 'Administrative audit records. Generated from stored records, not a server process log.', 8, '0.35 0.42 0.51');
    write(commands, 738, 20, `Page ${pageIndex + 1} / ${pages}`, 8);
    const stream = commands.join('\n') + '\n';
    const page = add('');
    const content = add(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}endstream`);
    objects[page - 1] = `<< /Type /Page /Parent ${pageTree} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`;
    pageRefs.push(page);
  }
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pageTree} 0 R >>`;
  objects[pageTree - 1] = `<< /Type /Pages /Kids [${pageRefs.map(id => `${id} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`;
  let result = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0];
  objects.forEach((value, i) => {
    offsets.push(Buffer.byteLength(result, 'latin1'));
    result += `${i + 1} 0 obj\n${value}\nendobj\n`;
  });
  const xref = Buffer.byteLength(result, 'latin1');
  result += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) result += `${String(offset).padStart(10,'0')} 00000 n \n`;
  result += `trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(result, 'latin1');
}
