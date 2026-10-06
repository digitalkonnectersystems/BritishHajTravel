/** Shared server-side recipient normalization for every form. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

export function parseEmailRecipients(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(parseEmailRecipients);
  if (typeof value !== 'string') return [];
  return value.split(/[;,\n]+/).map((part) => part.trim()).filter(Boolean);
}

export function normalizeEmailRecipients(value: unknown): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const candidate of parseEmailRecipients(value)) {
    const key = candidate.toLowerCase();
    if (!EMAIL_RE.test(candidate) || seen.has(key)) continue;
    seen.add(key);
    result.push(candidate);
  }
  return result;
}

export function dedupeRecipientChannels(to: unknown, cc: unknown, bcc: unknown) {
  const used = new Set<string>();
  const take = (value: unknown) => {
    const result: string[] = [];
    for (const candidate of normalizeEmailRecipients(value)) {
      const key = candidate.toLowerCase();
      if (used.has(key)) continue;
      used.add(key);
      result.push(candidate);
    }
    return result;
  };

  // Precedence is intentional: TO, then BCC, then CC.
  // A mailbox receives one admin copy even if entered in multiple fields.
  const uniqueTo = take(to);
  const uniqueBcc = take(bcc);
  const uniqueCc = take(cc);
  return { to: uniqueTo, cc: uniqueCc, bcc: uniqueBcc };
}

export function includesRecipient(channels: { to: string[]; cc: string[]; bcc: string[] }, email: string) {
  const key = email.trim().toLowerCase();
  return [...channels.to, ...channels.cc, ...channels.bcc].some((candidate) => candidate.toLowerCase() === key);
}

export function hasInvalidEmailRecipient(value: unknown): boolean {
  return parseEmailRecipients(value).some((candidate) => !EMAIL_RE.test(candidate.trim()));
}
