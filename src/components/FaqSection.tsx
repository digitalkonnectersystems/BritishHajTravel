"use client";

import { useState } from "react";
import { getGuideVideoEmbedUrl } from "@/components/GuideVideoSection";

interface FaqItem {
  question?: string;
  answer?: string;
  answerBlocks?: FaqAnswerBlock[];
}

interface FaqAnswerBlock {
  type: "text" | "image" | "video";
  content?: string;
  url?: string;
  alt?: string;
}

interface FaqSectionProps {
  data?: {
    eyebrow?: string;
    title?: string;
    description?: string;
    items?: FaqItem[];
  };
}

export default function FaqSection({ data = {} }: FaqSectionProps) {
  const items = Array.isArray(data.items)
    ? data.items.filter((item) => item?.question?.trim())
    : [];
  const [openIndex, setOpenIndex] = useState(items.length > 0 ? 0 : -1);

  if (items.length === 0) return null;

  return (
    <section className="bg-white px-4 py-12 md:px-6 md:py-16">
      <div className="mx-auto max-w-[1068px]">
        {(data.eyebrow || data.title || data.description) && (
          <div className="mx-auto mb-9 max-w-3xl text-center">
            {data.eyebrow && (
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[#b50007]">
                {data.eyebrow}
              </p>
            )}
            {data.title && (
              <h2 className="text-3xl font-extrabold leading-tight text-[#020e43] md:text-4xl">
                {data.title}
              </h2>
            )}
            {data.description && (
              <p className="mt-4 text-sm leading-relaxed text-slate-600 md:text-base">
                {data.description}
              </p>
            )}
          </div>
        )}

        <div className="space-y-3">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={`${item.question}-${index}`}
                className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white transition-colors duration-200 data-[open=true]:border-[#ed1c24]"
                data-open={isOpen}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className={`flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#020e43] transition-colors md:px-5 md:py-4 md:text-[15px] ${isOpen ? "border-b-2 border-[#ed1c24]" : "hover:bg-slate-50"}`}
                >
                  <span>{item.question}</span>
                  <span
                    aria-hidden="true"
                    className={`shrink-0 text-xl leading-none text-[#ed1c24] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    ▼
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 py-7 text-sm leading-7 text-slate-600 md:px-5 md:py-8">
                    {Array.isArray(item.answerBlocks) && item.answerBlocks.length > 0 ? (
                      <div className="space-y-5">
                        {item.answerBlocks.map((block, blockIndex) => {
                          if (block.type === "image" && block.url) {
                            return <img key={blockIndex} src={block.url} alt={block.alt || ""} className="mx-auto max-h-[520px] w-full rounded-xl object-contain" />;
                          }
                          if (block.type === "video" && block.url) {
                            const embedUrl = getGuideVideoEmbedUrl(block.url);
                            return embedUrl ? (
                              <div key={blockIndex} className="aspect-video overflow-hidden rounded-xl bg-slate-950">
                                <iframe className="h-full w-full" src={embedUrl} title="FAQ video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                              </div>
                            ) : (
                              <video key={blockIndex} className="aspect-video w-full rounded-xl bg-slate-950" controls preload="metadata">
                                <source src={block.url} />
                              </video>
                            );
                          }
                          return block.content ? <div key={blockIndex} className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: block.content }} /> : null;
                        })}
                      </div>
                    ) : (
                      <div className="whitespace-pre-line">{item.answer}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
