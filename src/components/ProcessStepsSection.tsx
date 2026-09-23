"use client";

export default function ProcessStepsSection({ data = {} }: { data?: any }) {
  const steps = Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : [
    { number: 1, title: "Apply & Share Your Details", description: "Fill out our quick application form and share your travel details." },
    { number: 2, title: "Submit Required Documents", description: "Provide the necessary documents such as your passport and photos." },
    { number: 3, title: "Sit Back & Get Your Visa", description: "We handle the complete visa processing on your behalf." },
  ];
  const backgroundImage = typeof data.backgroundImage === 'string' ? data.backgroundImage.trim() : '';

  return (
    <section
      className="py-12 text-white"
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(90deg, rgba(3, 19, 65, .0), rgba(3, 19, 65, .0)), url("${backgroundImage.replace(/"/g, "'")}")`,
        backgroundPosition: data.backgroundPosition || 'center',
        backgroundSize: data.backgroundSize || 'cover',
      } : { backgroundColor: '#064e3b' }}
    >
      <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-10 px-5 md:grid-cols-2">
        <div className="space-y-6">
          <span className="eyebrow">{data.eyebrow || "IN 3 EASY STEPS"}</span>
          <h2 className="text-3xl font-serif text-primary">{data.title || "Get Your Saudi Visa"}</h2>
          <p className="text-md text-primary font-bold leading-relaxed opacity-90">{data.description || "Our Saudi visa services cover everything from application to approval. With expert guidance and fast processing, we make the process simple and stress-free."}</p>
          {(data.email || data.phone) && <div className="space-y-2 font-bold text-md">{data.email && <a className="block text-primary hover:!text-red-700 hover:underline" href={`mailto:${data.email}`}>{data.email}</a>}{data.phone && <a className="block text-primary hover:!text-red-700 hover:underline" href={`tel:${data.phone}`}>{data.phone}</a>}</div>}
        </div>
        <div className="space-y-4">
          {steps.map((step: any, index: number) => (
            <div key={`${step.number || index}-${step.title || "step"}`} className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red font-extrabold text-white">{step.number || index + 1}</div>
              <div><h3 className="mb-1 text-lg font-semibold text-primary">{step.title}</h3><p className="text-xs leading-relaxed text-slate-600">{step.description || step.detail}</p></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
