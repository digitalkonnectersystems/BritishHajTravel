import { dedupeRecipientChannels } from './emailRecipients';

export type FormEmailRoutingRule = {
  id: string;
  forms: string[];
  sendTo: string;
  cc: string;
  bcc: string;
};

/** Preserve saved groups and blank channels; migrate only old one-form-per-rule records. */
export function normalizeFormRoutingRules(input: unknown): FormEmailRoutingRule[] {
  if (!Array.isArray(input)) return [];
  const rules: FormEmailRoutingRule[] = input.map((item, index) => {
    const value = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const forms = Array.isArray(value.forms)
      ? Array.from(new Set(value.forms.filter((key): key is string => typeof key === 'string' && !!key.trim()).map(key => key.trim())))
      : [];
    const recipients = dedupeRecipientChannels(value.sendTo, value.cc, value.bcc);
    return {
      id: typeof value.id === 'string' && value.id.trim() ? value.id.trim() : `route_${index + 1}`,
      forms,
      sendTo: recipients.to.join(', '),
      cc: recipients.cc.join(', '),
      bcc: recipients.bcc.join(', '),
    };
  });

  const legacy = rules.length > 0 && rules.every(rule => rule.forms.length === 1 && rule.id === `form_${rule.forms[0]}`);
  if (!legacy) return rules;

  const byRecipients = new Map<string, FormEmailRoutingRule>();
  for (const rule of rules) {
    const signature = JSON.stringify([rule.sendTo.toLowerCase(), rule.cc.toLowerCase(), rule.bcc.toLowerCase()]);
    const group = byRecipients.get(signature);
    if (group) group.forms.push(rule.forms[0]);
    else byRecipients.set(signature, { ...rule, id: `route_migrated_${byRecipients.size + 1}`, forms: [...rule.forms] });
  }
  return Array.from(byRecipients.values());
}

/** An explicitly empty channel MUST NOT inherit another form's address. */
export function recipientsForForm(rules: unknown, formKey: string) {
  const match = normalizeFormRoutingRules(rules).find(rule => rule.forms.includes(formKey));
  return match
    ? dedupeRecipientChannels(match.sendTo, match.cc, match.bcc)
    : { to: [] as string[], cc: [] as string[], bcc: [] as string[] };
}
