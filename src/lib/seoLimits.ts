/** Hard limits for editable SEO titles and descriptions. */
export const SEO_TITLE_LIMIT = 60;
export const SEO_DESCRIPTION_LIMIT = 160;

export function validateSeoText(input: { metaTitle?: unknown; metaDescription?: unknown } | null | undefined): string | null {
  if (!input) return null;
  if (input.metaTitle != null && String(input.metaTitle).length > SEO_TITLE_LIMIT)
    return `Meta title exceeds ${SEO_TITLE_LIMIT} characters. Shorten it before saving.`;
  if (input.metaDescription != null && String(input.metaDescription).length > SEO_DESCRIPTION_LIMIT)
    return `Meta description exceeds ${SEO_DESCRIPTION_LIMIT} characters. Shorten it before saving.`;
  return null;
}

export function seoTextIndicator(value: string, limit: number, recommendedMinimum: number): 'green' | 'yellow' | 'red' {
  if (value.length > limit) return 'red';
  return value.length >= recommendedMinimum ? 'green' : 'yellow';
}
