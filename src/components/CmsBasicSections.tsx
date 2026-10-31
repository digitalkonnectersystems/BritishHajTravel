import Image from 'next/image';

export default function CmsBasicSection({ type, data }: { type: string; data: any }) {
  const d = data || {};
  const items = Array.isArray(d.items) ? d.items : [];
  if (type === 'Stats Grid') {
    const valid = items.filter((item: any) => item?.label && item?.value !== undefined && item?.value !== '');
    if (!valid.length) return null;
    return <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20 mb-8"><div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-slate-100">{valid.map((item: any, i: number) => <div key={i} className="flex flex-col items-center justify-center p-2"><h3 className="text-2xl md:text-3xl font-bold text-primary font-serif m-0">{String(item.value)}</h3><p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 m-0">{item.label}</p></div>)}</div></div>;
  }
  if (type === 'Intro') {
    if (!d.title && !d.description && !d.eyebrow) return null;
    return <div className="wrap my-8"><div className="bg-primary border border-primary rounded-2xl p-8 max-w-7xl mx-auto shadow-xs">{d.eyebrow && <span className="eyebrow">{d.eyebrow}</span>}{d.title && <h2 className="font-serif mb-3 text-white">{d.title}</h2>}{d.description && <p className="text-white/90 text-sm leading-relaxed font-normal m-0">{d.description}</p>}</div></div>;
  }
  if (['Image+Text','Why Choose Us','Intro (Text + Image)'].includes(type)) {
    if (!d.image && !d.title && !d.description && !d.eyebrow) return null;
    const features = Array.isArray(d.features) ? d.features : [];
    return <div className="wrap"><section className="about-section reveal"><div className="grid-2 about_page_why_choose"><div className="about-image">{d.image && <Image src={d.image} alt={d.title || 'Section illustration'} width={800} height={450} unoptimized={/\.svg(?:[?#]|$)/i.test(d.image)} className="w-full h-auto" />}</div><div className="about-content">{d.eyebrow && <span className="eyebrow">{d.eyebrow}</span>}{d.title && <h2 className="section-title">{d.title}</h2>}{d.description && <p>{d.description}</p>}{d.subheading && <h4 className="text-sm font-bold text-slate-800 mt-4 mb-2">{d.subheading}</h4>}{features.length > 0 && <ul className="features-list grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-700 font-medium list-none p-0 mt-3">{features.map((f: any,i: number) => <li key={i} className="flex items-start gap-2"><span className="text-red font-bold">✓</span>{typeof f === 'string' ? f : (f?.title || f?.description || '')}</li>)}</ul>}</div></div></section></div>;
  }
  if (type === 'Services Grid') {
    if (!items.length && !d.title && !d.description && !d.eyebrow) return null;
    return <section className="services-section py-10"><div className="wrap"><div className="flex flex-col items-center text-center mb-4">{d.eyebrow && <span className="eyebrow mx-auto block">{d.eyebrow}</span>}{d.title && <h2 className="sectionpr-title">{d.title}</h2>}{d.description && <p>{d.description}</p>}</div>{items.length > 0 && <div className="flex flex-col md:grid md:grid-cols-2 gap-6">{items.map((item: any,i: number) => <div key={i} className="about-service-card"><div className="flex items-center gap-3 mb-4"><span className="service-icon text-2xl p-2.5 rounded-xl bg-slate-50 border border-slate-100">{item.icon}</span><div><h3 className="text-[20px] font-bold head m-0">{item.title}</h3>{item.subtitle && <span className="text-[14px] font-semibold text-red block mt-0.5">{item.subtitle}</span>}</div></div><p className="text-[14px] text-ink-soft leading-relaxed font-normal m-0">{item.description}</p></div>)}</div>}</div></section>;
  }
  if (type === 'Accreditations Bar' || type === 'Badges Cards') {
    if (!items.length) return null;
    return <div className="max-w-6xl mx-auto px-4 my-8"><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{items.map((b: any,i: number) => <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center gap-3"><div className="w-12 h-12 rounded-full bg-emerald-50/80 flex items-center justify-center text-primary text-xl">{b.image || b.logo || (b.iconType === 'image' && b.icon) ? <Image src={b.image || b.logo || b.icon} alt={b.title || 'Accreditation'} width={48} height={48} unoptimized={/\.svg(?:[?#]|$)/i.test(b.image || b.logo || b.icon)} className="w-full h-full object-contain" /> : b.iconType === 'fontawesome' || !b.iconType ? <i className={b.icon}></i> : <span className="font-bold text-sm">{b.icon}</span>}</div>{b.title && <span className="text-xs font-bold tracking-wider text-slate-500 uppercase">{b.title}</span>}</div>)}</div></div>;
  }
  return null;
}
