'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import type { BlogFaqSection } from '@/lib/blogFaq';

interface BlogFaqEditorProps {
  value: BlogFaqSection;
  onChange: (value: BlogFaqSection) => void;
}

export default function BlogFaqEditor({ value, onChange }: BlogFaqEditorProps) {
  const changeField = (field: 'eyebrow' | 'title' | 'description', next: string) => {
    onChange({ ...value, [field]: next });
  };
  const changeItem = (index: number, field: 'question' | 'answer', next: string) => {
    onChange({
      ...value,
      items: value.items.map((item, i) => i === index ? { ...item, [field]: next } : item),
    });
  };
  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= value.items.length) return;
    const items = [...value.items];
    const [item] = items.splice(from, 1);
    items.splice(to, 0, item);
    onChange({ ...value, items });
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="m-0 text-base font-extrabold text-slate-900">Blog FAQs</h2>
          <p className="mb-0 mt-1 text-xs leading-5 text-slate-500">
            Uses the same FAQ accordion as CMS pages. Saving complete questions and answers
            automatically updates this blog&apos;s FAQPage schema without removing its Article or custom JSON-LD.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
          {value.items.length} question{value.items.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-xs font-bold text-slate-700">
          Small heading (optional)
          <input
            value={value.eyebrow}
            maxLength={120}
            onChange={(event) => changeField('eyebrow', event.target.value)}
            placeholder="FREQUENTLY ASKED QUESTIONS"
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
        <label className="block text-xs font-bold text-slate-700">
          Section title (H2)
          <input
            value={value.title}
            maxLength={200}
            onChange={(event) => changeField('title', event.target.value)}
            placeholder="Frequently Asked Questions"
            className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
          />
        </label>
      </div>
      <label className="mt-3 block text-xs font-bold text-slate-700">
        Description (optional)
        <textarea
          value={value.description}
          maxLength={1500}
          rows={2}
          onChange={(event) => changeField('description', event.target.value)}
          placeholder="A short introduction to the questions below"
          className="mt-1 block w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-primary"
        />
      </label>

      <div className="mt-5 space-y-3">
        {value.items.map((item, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-primary">FAQ {index + 1}</span>
              <div className="flex items-center gap-1">
                <button type="button" title="Move up" aria-label={`Move FAQ ${index + 1} up`} disabled={index === 0}
                  onClick={() => moveItem(index, index - 1)} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" title="Move down" aria-label={`Move FAQ ${index + 1} down`} disabled={index === value.items.length - 1}
                  onClick={() => moveItem(index, index + 1)} className="rounded-md p-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" title="Remove question" aria-label={`Remove FAQ ${index + 1}`}
                  onClick={() => onChange({ ...value, items: value.items.filter((_, i) => i !== index) })}
                  className="rounded-md p-1.5 text-red hover:bg-red/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <label className="block text-xs font-bold text-slate-600">
              Question
              <input
                value={item.question}
                maxLength={500}
                onChange={(event) => changeItem(index, 'question', event.target.value)}
                placeholder="Enter the question"
                className="mt-1 mb-3 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
            <label className="block text-xs font-bold text-slate-600">
              Answer
              <textarea
                value={item.answer}
                maxLength={15000}
                rows={4}
                onChange={(event) => changeItem(index, 'answer', event.target.value)}
                placeholder="Enter the answer displayed in the accordion and FAQ schema"
                className="mt-1 block w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
              />
            </label>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-[11px] text-slate-500">Unfinished or repeated questions cannot be published. Removing all questions removes the automatic FAQ schema.</p>
        <button type="button" disabled={value.items.length >= 50}
          onClick={() => onChange({ ...value, items: [...value.items, { question: '', answer: '' }] })}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-40">
          <Plus className="h-4 w-4" /> Add Question
        </button>
      </div>
    </div>
  );
}
