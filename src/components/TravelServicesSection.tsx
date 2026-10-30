"use client";

import DynamicIcon from "@/components/ui/DynamicIcon";

export default function TravelServicesSection({ data }: { data: any }) {
  const eyebrow = data?.eyebrow || "";
  const title = data?.title || "";
  const subtitle = data?.subtitle || "";

  const services = Array.isArray(data?.items) ? data.items.filter((item: any) => item?.title) : [];
  if (!services.length) return null;

  return (
    <section className="py-8 md:py-10 bg-primary">
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="text-center flex flex-col items-center mb-10">
          <h3 className="eyebrow">{eyebrow}</h3>
          <h2
            className="section-heading text-white"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          {subtitle && (
            <p className="text-white/90 max-w-2xl mt-4 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s: any, i: number) => (
            <div
              key={i}
              className="group bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.06)] border border-[#eef0e4] hover:scale-[1.04] transition-all duration-300 cursor-pointer text-center flex flex-col items-center justify-center aspect-square"
            >
              <div className="w-16 h-16 flex items-center justify-center mb-5 text-[var(--red)]">
                <DynamicIcon name={s.icon || 'Star'} className="w-30 h-30" strokeWidth={1.5} />
              </div>
              <h4 className="text-primary text-center font-bold text-xl mb-2 leading-snug">{s.title}</h4>
              <p className="text-ink text-md leading-relaxed font-medium text-center">{s.desc || s.description}</p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
