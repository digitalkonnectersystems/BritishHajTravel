"use client";

import Image from "next/image";

type SeatCard = {
  logo?: string;
  airline?: string;
  flightLabel?: string;
  departure?: string;
  returnDate?: string;
  route?: string;
  seats?: string;
  baggage?: string;
  price?: string;
  bookingLabel?: string;
  bookingUrl?: string;
};

type AvailableSeatsData = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: unknown[];
};

function isSeatCard(value: unknown): value is SeatCard {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return ['logo', 'airline', 'flightLabel', 'departure', 'returnDate', 'route', 'seats', 'baggage', 'price', 'bookingLabel', 'bookingUrl']
    .every((key) => {
      const field = (value as Record<string, unknown>)[key];
      return field === undefined || typeof field === 'string';
    });
}

export default function AvailableSeatsSection({ data }: { data?: AvailableSeatsData }) {
  const cards = Array.isArray(data?.items) ? data.items.filter(isSeatCard) : [];
  if (cards.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#f1f9ff] px-4 py-8 md:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="section-head center text-center mb-8">
          {data?.eyebrow ? <span className="eyebrow mx-auto block">{data.eyebrow}</span> : null}
          {data?.title ? <h2 className="section-heading font-serif text-primary">{data.title}</h2> : null}
          {data?.subtitle ? <p className="mt-2 text-sm text-slate-600">{data.subtitle}</p> : null}
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card, index) => (
            <article key={`${card.flightLabel || "flight"}-${index}`} className="rounded-xl bg-white p-5 shadow-[0_8px_25px_rgba(54,122,180,.12)]">
              <div className="flex items-start justify-between gap-3">
                <div className="relative h-12 w-28 shrink-0">
                  {card.logo ? <Image src={card.logo} alt={card.airline || "Airline logo"} fill className="object-contain object-left" unoptimized /> : <span className="text-sm font-bold text-primary">{card.airline || "Airline"}</span>}
                </div>
                <span className="pt-1 text-lg font-bold text-primary">{card.flightLabel || `Flight ${index + 1}`}</span>
              </div>
              <div className="mt-3 space-y-2 text-s text-primary">
                <p>▣ <span className="ml-1">Depart: {card.departure || ""} {card.route || ""}</span></p>
                <p>↪ <span className="ml-1">Return: {card.returnDate || ""} {card.route ? card.route.split(" - ").reverse().join(" - ") : ""}</span></p>
                <p>♧ <span className="ml-1">{card.seats || "Seats Available"}</span></p>
                <p>▣ <span className="ml-1">{card.baggage || "Baggage allowance"}</span></p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-lg bg-[#fff1f5] px-3 py-3 text-xs font-bold text-red">{card.price || "£TBC / Person"}</span>
                <a href={card.bookingUrl || "/contact"} className="rounded-full border border-red px-4 py-2 text-xs font-bold text-red transition hover:bg-red hover:text-white">{card.bookingLabel || "Book Now"} →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
