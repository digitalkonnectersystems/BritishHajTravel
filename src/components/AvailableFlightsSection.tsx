"use client";

import Image from "next/image";

type FlightPoint = {
  code?: string;
  city?: string;
  time?: string;
  arrivalTime?: string;
  departureTime?: string;
  flightNumber?: string;
  className?: string;
};

type FlightDirection = {
  date?: string;
  dateEnd?: string;
  first?: FlightPoint;
  second?: FlightPoint;
  via?: FlightPoint;
  className?: string;
  flightNumber?: string;
  layoverText?: string;
  layoverDuration?: string;
};

export type AvailableFlight = {
  logo?: string;
  code?: string;
  name?: string;
  operatedBy?: string;
  originCode?: string;
  originCity?: string;
  destCode?: string;
  destCity?: string;
  time?: string;
  timeOriginCode?: string;
  price?: string;
  priceSubtext?: string;
  bookingUrl?: string;
  bookingLabel?: string;
  seatsText?: string;
  seatsValue?: string;
  badgeText?: string;
  outbound?: FlightDirection;
  return?: FlightDirection;
};

function directionFromLegacy(flight: AvailableFlight, direction: "outbound" | "return"): FlightDirection {
  const isReturn = direction === "return";
  return {
    date: isReturn ? "" : "",
    first: {
      code: isReturn ? "" : flight.originCode,
      city: isReturn ? "" : flight.originCity,
      time: isReturn ? "" : flight.time,
      flightNumber: "",
    },
    second: {
      code: isReturn ? flight.destCode : "",
      city: isReturn ? flight.destCity : "",
      time: "",
      flightNumber: "",
    },
    via: undefined,
    className: "",
    layoverText: "",
    layoverDuration: "",
  };
}

function formatFlightDate(value?: string) {
  if (!value) return "";
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function formatFlightDateRange(start?: string, end?: string) {
  const formattedStart = formatFlightDate(start);
  const formattedEnd = formatFlightDate(end);
  if (!formattedStart) return formattedEnd;
  if (!formattedEnd) return formattedStart;
  return `${formattedStart} - ${formattedEnd}`;
}

function getDirection(flight: AvailableFlight, direction: "outbound" | "return") {
  const saved = flight[direction];
  const legacy = directionFromLegacy(flight, direction);
  return {
    ...legacy,
    ...(saved || {}),
    first: { ...legacy.first, ...(saved?.first || {}) },
    second: { ...legacy.second, ...(saved?.second || {}) },
  };
}

function Segment({ point, fallbackCode }: { point?: FlightPoint; fallbackCode: string }) {
  return (
    <div className="min-w-0 text-center">
      <div className="text-base font-bold tracking-wide text-[#10254a] sm:text-lg md:text-xl">{point?.code || fallbackCode}</div>
      <div className="truncate text-[10px] text-slate-400">{point?.city || ""}</div>
      <div className="whitespace-nowrap text-[10px] text-slate-500 sm:text-[11px]">{point?.time || ""}</div>
    </div>
  );
}

function RouteRow({ first, second, className, flightNumber, fallbackFirst, fallbackSecond }: {
  first?: FlightPoint;
  second?: FlightPoint;
  className?: string;
  flightNumber?: string;
  fallbackFirst: string;
  fallbackSecond: string;
}) {
  const classValue = (className || first?.className || "").replace(/^class\s*/i, "");
  const firstPoint = first?.departureTime ? { ...first, time: first.departureTime } : first;
  const secondPoint = second?.arrivalTime ? { ...second, time: second.arrivalTime } : second;
  return (
    <div className="grid grid-cols-[minmax(0,.85fr)_minmax(56px,1fr)_minmax(0,.85fr)] items-center gap-1 py-1 sm:grid-cols-[minmax(62px,1fr)_minmax(80px,1.2fr)_minmax(62px,1fr)] sm:gap-2">
      <Segment point={firstPoint} fallbackCode={fallbackFirst} />
      <div className="relative flex min-w-0 items-center justify-center">
        <div className="absolute left-0 right-0 border-t border-dashed border-red" />
        <div className="relative z-10 flex min-w-0 flex-col items-center bg-white px-1 text-center sm:min-w-24 sm:px-2">
          <span className="text-[10px] font-medium text-[#10254a]">{flightNumber || ""}</span>
          <span className="text-[10px] font-semibold text-red">{classValue ? `Class ${classValue}` : ""}</span>
        </div>
      </div>
      <Segment point={secondPoint} fallbackCode={fallbackSecond} />
    </div>
  );
}

function DirectionBlock({ label, direction, fallbackFirst, fallbackSecond }: {
  label: string;
  direction: FlightDirection;
  fallbackFirst: string;
  fallbackSecond: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:text-[11px]">
        <span>{label}</span>
        <span className="normal-case text-[#10254a]">{formatFlightDateRange(direction.date, direction.dateEnd)}</span>
      </div>
      {direction.via ? (
        <>
          <RouteRow first={direction.first} second={direction.via} className={direction.first?.className || direction.className} flightNumber={direction.first?.flightNumber} fallbackFirst={fallbackFirst} fallbackSecond={direction.via.code || fallbackSecond} />
          {direction.layoverText || direction.layoverDuration ? (
            <div className="flex items-center justify-between gap-2 rounded bg-[#fff0f2] px-2 py-1 text-[10px] text-[#10254a] sm:px-3 sm:text-[11px]">
              <span>{direction.layoverText || "Layover"}</span>
              <span className="font-semibold">{direction.layoverDuration || ""}</span>
            </div>
          ) : null}
          <RouteRow first={direction.via} second={direction.second} className={direction.second?.className || direction.className} flightNumber={direction.second?.flightNumber} fallbackFirst={direction.via.code || fallbackFirst} fallbackSecond={fallbackSecond} />
        </>
      ) : (
        <RouteRow first={direction.first} second={direction.second} className={direction.className} flightNumber={direction.first?.flightNumber || direction.second?.flightNumber} fallbackFirst={fallbackFirst} fallbackSecond={fallbackSecond} />
      )}
      {direction.layoverText || direction.layoverDuration ? (
        <div className={`${direction.via ? "hidden" : ""} flex items-center justify-between gap-2 rounded bg-[#fff0f2] px-2 py-1 text-[10px] text-[#10254a] sm:px-3 sm:text-[11px]`}>
          <span>{direction.layoverText || "Layover"}</span>
          <span className="font-semibold">{direction.layoverDuration || ""}</span>
        </div>
      ) : null}
    </div>
  );
}

export default function AvailableFlightsSection({ data, bookingTarget }: { data?: any; bookingTarget?: string }) {
  const items: AvailableFlight[] = Array.isArray(data?.items) ? data.items.filter((item: AvailableFlight) => Boolean(item && (item.name || item.code))) : [];
  if (items.length === 0) return null;
  return (
    <section className="overflow-hidden bg-[#f2f8ff] py-8 sm:py-10 md:py-16">
      <div className="mx-auto w-full max-w-5xl px-3 sm:px-4">
        <div className="section-head center mb-6 text-center sm:mb-8">
          <span className="eyebrow mx-auto block">{data?.eyebrow || ""}</span>
          <h2 className="section-heading font-serif tracking-tight text-primary">
            {data?.title || ""}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-2">
          {items.map((flight: AvailableFlight, index: number) => {
            const outbound = getDirection(flight, "outbound");
            const returning = getDirection(flight, "return");
            const bookingUrl = flight.bookingUrl || bookingTarget || "";
            return (
              <article key={`${flight.code || "flight"}-${index}`} className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md sm:p-5 md:p-6">
                <div className="mb-3 flex items-start justify-between gap-2 border-b border-slate-200 pb-3 sm:mb-4 sm:gap-3 sm:pb-4">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    {flight.logo ? (
                      <div className="relative h-9 w-20 shrink-0 sm:h-11 sm:w-28">
                        <Image src={flight.logo} alt={flight.name || "Airline logo"} fill className="object-contain object-left" unoptimized />
                      </div>
                    ) : (
                      <div className="flex h-9 min-w-12 items-center justify-center rounded bg-red px-2 text-xs font-bold text-white sm:h-11 sm:min-w-14 sm:text-sm">{flight.code || "AIR"}</div>
                    )}
                    <div className="min-w-0">
                      <h3 className="truncate text-xs font-bold text-[#10254a] sm:text-sm">{flight.name || "Airline flight"}</h3>
                      <p className="text-[11px] text-slate-500">{flight.operatedBy || ""}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded border border-red px-1.5 py-1 text-[10px] font-bold text-red sm:px-2 sm:text-xs">{flight.badgeText || ""}</span>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <DirectionBlock label="Outbound" direction={outbound} fallbackFirst={flight.originCode || ""} fallbackSecond={flight.destCode || ""} />
                  <div className="border-t border-dashed border-slate-200 pt-2 sm:pt-3">
                    <DirectionBlock label="Return" direction={returning} fallbackFirst={flight.destCode || ""} fallbackSecond={flight.originCode || ""} />
                  </div>
                </div>
                <div className="mt-3 flex flex-col items-start gap-3 border-t border-slate-200 pt-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex min-w-0 items-center gap-2 text-[10px] text-slate-600 sm:text-[11px]">
                    <span className="text-base text-[#10254a]" aria-hidden="true">♿</span>
                    <span><strong className="font-semibold">Available Seats:</strong> {flight.seatsValue || flight.seatsText?.replace(/^available seats:\s*/i, "") || ""}</span>
                  </p>
                  <div className="text-right">
                    <div className="text-xl font-bold text-[#10254a] sm:text-2xl">{flight.price || ""}</div>
                    <div className="text-[10px] italic text-slate-500">{flight.priceSubtext || ""}</div>
                  </div>
                </div>
                {bookingUrl ? (
                  <a href={bookingUrl} target={bookingTarget ? undefined : "_blank"} rel="noopener noreferrer" className="mt-3 block w-full rounded bg-red py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-lt sm:mt-4 sm:text-xs">
                    {flight.bookingLabel || "Select this route"} →
                  </a>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
