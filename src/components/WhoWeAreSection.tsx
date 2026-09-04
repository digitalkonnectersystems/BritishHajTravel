"use client";

import { useEffect, useState } from "react";

export default function WhoWeAreSection({ data }: { data: any }) {
  // Use data from the CMS if available, otherwise fallback to hardcoded
  const eyebrow = data?.eyebrow || "WHO WE ARE";
  const title = data?.title || "We provide and offer<br />Hajj & Umrah packages";
  const description1 = data?.description1 || "British Hajj Travel proudly provides reliable and professional Hajj and Umrah services across United Kingdom. With years of experience serving the Muslim community, we are committed to making your sacred journey smooth, comfortable, and spiritually fulfilling.";
  const description2 = data?.description2 || "Whether you are traveling for Hajj, Umrah, or Saudi Visa services, our expert team is here to guide you every step of the way.";
  const image = data?.image || "uploads\\sections\\hajj_1.jpg";
  const reviewText = data?.reviewText || "\"Every detail handled — from visa to hotel, steps from the Haram.\"";

  const rawItems = (data?.items && Array.isArray(data.items) && data.items.length > 0)
    ? data.items
    : [
      { value: '25+', label: 'Years Serving UK' },
      { value: '1k+', label: 'Pilgrims Guided' },
      { value: '5★', label: 'Hotels, Every Package' }
    ];

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 2500;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const linear = Math.min((timestamp - start) / duration, 1);
      const ease = linear * (2 - linear);
      setProgress(ease);

      if (linear < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setProgress(1);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const formatStatValue = (valStr: string, p: number) => {
    if (!valStr || typeof valStr !== 'string') return valStr;
    const match = valStr.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return valStr;

    const prefix = match[1] || '';
    const num = parseFloat(match[2]);
    const suffix = match[3] || '';
    const isDecimal = match[2].includes('.');

    if (isDecimal) {
      const current = (num * p).toFixed(1);
      return `${prefix}${current}${suffix}`;
    }

    const current = Math.floor(num * p);
    return `${prefix}${current}${suffix}`;
  };

  const statsItems = rawItems.map((stat: any) => ({
    ...stat,
    displayValue: formatStatValue(String(stat.value || ''), progress)
  }));

  return (
    <section className="py-12 md:py-16 bg-primary">
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left: Image */}
          <div className="relative justify-self-center lg:justify-self-end">
            <div className="rounded-[40px] bg-white overflow-hidden shadow-2xl relative aspect-square w-[90vw] max-w-[600px]">
              <img src={image.replace(/\\/g, '/')} alt="Kaaba" className="w-full h-full object-cover" />
            </div>

            {/* Review Badge */}
            <div className="absolute bottom-4 -left-2 sm:bottom-8 sm:-left-8 bg-white p-5 rounded-2xl shadow-xl w-64">
              <div className="flex text-gold text-sm mb-2">★★★★★</div>
              <p className="text-xs text-ink-soft font-medium leading-relaxed">
                {reviewText}
              </p>
            </div>
          </div>

          {/* Right: Text & Stats */}
          <div>
            <h3 className="eyebrow">{eyebrow}</h3>
            <h2
              className="text-white font-serif section-heading leading-tight mb-6"
              dangerouslySetInnerHTML={{ __html: title }}
            />
            <p className="!text-[18px] text-white/90 mb-6 leading-relaxed text-sm md:text-base">
              {description1}
            </p>
            <p className="!text-[18px] text-white/90 mb-10 leading-relaxed text-sm md:text-base">
              {description2}
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-5">
              {statsItems.map((stat: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#FAF9F5]/90 rounded-xl sm:rounded-2xl p-2.5 sm:p-5 md:p-6 text-center border border-[#E3D9C6] shadow-xs flex flex-col items-center justify-center transition-all hover:shadow-md"
                >
                  <div className="text-gold font-serif text-xl sm:text-3xl md:text-4xl mb-1 sm:mb-2 font-normal leading-none">{stat.displayValue}</div>
                  <div className="text-[10px] sm:text-xs md:text-[13px] font-medium text-ink-soft leading-tight sm:leading-snug">{stat.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
