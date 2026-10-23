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

const defaultCards: SeatCard[] = [
  { logo: "/img/air/wizz.png", airline: "Wizz Air", flightLabel: "Flight 1", departure: "18 Dec 2025", returnDate: "02 Jan 2026", route: "LGW - JED", seats: "40 Seats Available", baggage: "32 KG Baggage", price: "£TBC / Person" },
  { logo: "/img/air/wizz.png", airline: "Wizz Air", flightLabel: "Flight 2", departure: "20 Dec 2025", returnDate: "03 Jan 2026", route: "LGW - JED", seats: "85 Seats Available", baggage: "32 KG Baggage", price: "£TBC / Person" },
  { logo: "/img/air/wizz.png", airline: "Wizz Air", flightLabel: "Flight 3", departure: "22 Dec 2025", returnDate: "06 Jan 2026", route: "LGW - JED", seats: "45 Seats Available", baggage: "32 KG Baggage", price: "£TBC / Person" },
];

export default function AvailableSeatsSection({ data }: { data?: any }) {
  const cards: SeatCard[] = Array.isArray(data?.items) && data.items.length ? data.items : defaultCards;
  return (
    <section className="relative overflow-hidden bg-[#f1f9ff] px-4 py-12 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="section-head center text-center mb-8">
          <span className="eyebrow mx-auto block">{data?.eyebrow || "AVAILABLE SEATS"}</span>
          <h2 className="section-heading font-serif text-primary">{data?.title || "UMRAH ALLOCATION SEATS 2025 - 2026"}</h2>
          <p className="mt-2 text-sm text-slate-600">{data?.subtitle || "On First come first serve basis HURRY as LIMITED STOCK"}</p>
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
