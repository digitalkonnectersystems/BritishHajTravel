/**
 * The blog editor and frontend FAQ accordion share this data shape with the
 * existing CMS Page FAQ section. Only complete, visible Q&As are marked up.
 */
export interface BlogFaqItem {
  question: string;
  answer: string;
}

export interface BlogFaqSection {
  eyebrow: string;
  title: string;
  description: string;
  items: BlogFaqItem[];
}

export const EMPTY_BLOG_FAQS: BlogFaqSection = {
  eyebrow: 'FREQUENTLY ASKED QUESTIONS',
  title: 'Frequently Asked Questions',
  description: '',
  items: [],
};

export function normalizeBlogFaqs(value: unknown): BlogFaqSection {
  let stored = value;
  if (typeof stored === 'string') {
    try {
      stored = JSON.parse(stored);
    } catch {
      stored = null;
    }
  }

  const data = Array.isArray(stored)
    ? { items: stored }
    : stored && typeof stored === 'object'
      ? stored as Record<string, unknown>
      : {};

  const items = Array.isArray(data.items)
    ? data.items.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
      .map((item) => ({
        question: typeof item.question === 'string' ? item.question : '',
        answer: typeof item.answer === 'string' ? item.answer : '',
      }))
    : [];

  return {
    eyebrow: typeof data.eyebrow === 'string' ? data.eyebrow : EMPTY_BLOG_FAQS.eyebrow,
    title: typeof data.title === 'string' ? data.title : EMPTY_BLOG_FAQS.title,
    description: typeof data.description === 'string' ? data.description : EMPTY_BLOG_FAQS.description,
    items,
  };
}

/** Match the visible questions exactly. An incomplete FAQ is never emitted in JSON-LD. */
export function getVisibleBlogFaqs(value: unknown): BlogFaqItem[] {
  const seen = new Set<string>();
  return normalizeBlogFaqs(value).items.reduce<BlogFaqItem[]>((result, item) => {
    const question = item.question.trim();
    const answer = item.answer.trim();
    const key = question.toLocaleLowerCase('en');
    if (!question || !answer || seen.has(key)) return result;
    seen.add(key);
    result.push({ question, answer });
    return result;
  }, []);
}

/** Reject incomplete/duplicate content rather than silently publishing a partial FAQ. */
export function validateBlogFaqs(value: unknown): string | null {
  const data = normalizeBlogFaqs(value);
  if (data.items.length > 50) return 'A blog can contain a maximum of 50 FAQ questions.';
  if (data.title.length > 200 || data.eyebrow.length > 120 || data.description.length > 1500) {
    return 'FAQ heading, eyebrow, or description is too long.';
  }
  const seen = new Set<string>();
  for (let i = 0; i < data.items.length; i++) {
    const { question, answer } = data.items[i];
    if (!question.trim() || !answer.trim()) {
      return `FAQ ${i + 1} needs both a question and an answer. Remove it if it is not ready.`;
    }
    if (question.length > 500 || answer.length > 15000) {
      return `FAQ ${i + 1} is too long (max 500 question characters and 15,000 answer characters).`;
    }
    const key = question.trim().toLocaleLowerCase('en');
    if (seen.has(key)) return `FAQ ${i + 1} repeats another question.`;
    seen.add(key);
  }
  return null;
}
