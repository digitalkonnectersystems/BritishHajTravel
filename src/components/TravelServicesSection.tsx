"use client";

import DynamicIcon from "@/components/ui/DynamicIcon";

export default function TravelServicesSection({ data }: { data: any }) {
  const eyebrow = data?.eyebrow || "SERVICES WE OFFER";
  const title = data?.title || "Select your preferred travel<br />service";
  const subtitle = data?.subtitle || "";

  const defaultServices = [
    { title: 'Umrah Packages', desc: 'Flexible departures with flights, stays & guidance included.', icon: 'Star' },
    { title: 'Hajj Packages', desc: 'Fully accredited pilgrimage packages, curated end to end.', icon: 'Briefcase' },
    { title: 'Airline Tickets', desc: 'Best-fare flights sourced from every route into Jeddah.', icon: 'ArrowLeftRight' },
    { title: 'Saudi Visa Services', desc: 'Full visa processing, handled and confirmed before departure.', icon: 'CreditCard' },
    { title: 'Hotel Booking', desc: '5-star stays within walking distance of the Haram.', icon: 'Home' },
    { title: 'Global Flight Reservations', desc: 'Worldwide reliable flight bookings for any itinerary.', icon: 'Globe' },
    { title: 'Travel Documentation', desc: 'Guidance on every document your journey requires.', icon: 'FileText' },
    { title: 'Group & Private Tours', desc: 'Private, guided, and fully customizable itineraries.', icon: 'User' },
  ];

  const services = data?.items?.length ? data.items : defaultServices;

  return (
    <section className="py-12 md:py-16 bg-primary">
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
              <div className="w-16 h-16 flex items-center justify-center mb-5 text-[var(--gold)]">
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
