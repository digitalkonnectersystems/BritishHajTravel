"use client";

export default function WhatWeProvideSection({ data }: { data: any }) {
  const eyebrow = data?.eyebrow || "WHAT WE PROVIDE";
  const title = data?.title || "Lowest fares, exclusive<br />travel deals, real trust";
  const image = data?.image || "uploads\\sections\\hajj_1.jpg";
  
  const defaultItems = [
    { title: 'Lowest Fares', desc: 'We offer the lowest rates on the market, sourced across every route into Jeddah.' },
    { title: 'Special Deals', desc: 'Fixed-price Umrah packages with hotels, meals and transport included.' },
    { title: 'Trusted & Certified', desc: 'A fully accredited travel agency you can rely on, licensed across Canada.' },
    { title: 'Pilgrimage Services', desc: 'Visa processing, group support — the full spiritual journey, arranged.' },
  ];

  const items = data?.items?.length ? data.items : defaultItems;

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Image */}
          <div className="order-2 lg:order-1">
            <div className="rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgb(0,0,0,0.1)] w-full aspect-square max-w-[600px] mx-auto lg:mx-0">
              <img
                src={image.replace(/\\/g, '/')}
                alt="What We Provide"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2">
            <h3 className="eyebrow">{eyebrow}</h3>
            <h2 
              className="text-4xl md:text-5xl font-serif text-ink leading-[1.15] mb-6"
              dangerouslySetInnerHTML={{ __html: title }}
            />

            <div className="flex flex-col">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex gap-6 items-start py-6 border-b border-gray-200">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#faeed8] flex items-center justify-center text-gold font-serif text-lg">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <h4 className="text-ink font-serif text-lg mb-2">{item.title}</h4>
                    <p className="text-ink-soft text-sm leading-relaxed">
                      {item.desc || item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
