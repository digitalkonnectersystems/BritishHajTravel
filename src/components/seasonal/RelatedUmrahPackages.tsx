import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { relatedUmrahPages } from '@/lib/seasonalUmrah';

/** Crawlable links to existing Umrah landing pages; no duplicate page content. */
export default function RelatedUmrahPackages({
  currentPath,
  extraPages = [],
}: {
  currentPath: string;
  extraPages?: { label: string; href: string; detail?: string }[];
}) {
  const normalize = (path: string) => `/${path.replace(/^\/+|\/+$/g, '')}`;
  const current = normalize(currentPath);
  const seen = new Set<string>();
  const related = [...relatedUmrahPages, ...extraPages].filter((item) => {
    const path = normalize(item.href);
    if (path === current || path === '/umrah-packages' || seen.has(path)) return false;
    seen.add(path);
    return true;
  });

  return (
    <section className="bg-white py-6 md:py-10" aria-labelledby="other-umrah-packages-heading">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-6">
        <div className="mb-7 flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">EXPLORE MORE</p>
            <h2 id="other-umrah-packages-heading" className="font-serif text-primary text-[clamp(1.5rem,2.2vw,2.25rem)] leading-[0.98]">Explore Other Umrah Packages</h2>
          </div>
          <Link href="/umrah-packages/" className="inline-flex shrink-0 items-center gap-2 text-xs font-extrabold text-red transition-colors hover:text-[#ed1b24]">
            VIEW ALL UMRAH PACKAGES <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[180px] min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-red hover:shadow-[0_10px_28px_rgba(2,14,67,0.09)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red"
            >
              <CalendarDays size={24} aria-hidden="true" className="text-red" />
              <h3 className="mt-4 font-serif text-lg leading-tight text-primary">{item.label}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.detail || 'Explore Umrah travel information and packages'}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-extrabold text-red transition-all group-hover:gap-3">
                VIEW PAGE <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
