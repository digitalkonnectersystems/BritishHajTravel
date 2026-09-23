"use client";

import DynamicIcon from "@/components/ui/DynamicIcon";
import styles from "./FlightAccommodationSection.module.css";

const defaults = {
  flight: {
    title: "Flight Details",
    subtitle: "Custom Flights",
    airline: "Custom Airline",
    departure: "May 21st 2026",
    returnDate: "May 21st 2026",
    duration: "14 Days / 13 Nights",
  },
  accommodation: {
    title: "Accommodation",
    subtitle: "Hotels & Transportation",
    makkah: "Pullman Zamzam Makkah",
    madinah: "Pullman Zamzam Madina",
    transport: "High Speed Train",
    transportSubtitle: "Madinah to Makkah",
    tentLocation: "Maqtar Al Kabsh / Al Muaisam",
  },
};

export default function FlightAccommodationSection({ data = {} }: { data?: any }) {
  const flight = { ...defaults.flight, ...(data.flight || {}) };
  const accommodation = { ...defaults.accommodation, ...(data.accommodation || {}) };

  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <article className={styles.panel}>
          <div className={styles.header}>
            <DynamicIcon name={data.flightIcon || "Plane"} />
            <div><h2>{flight.title}</h2><p>{flight.subtitle}</p></div>
          </div>
          <div className={styles.body}>
            <div className={styles.detail}>
              <DynamicIcon name="PlaneTakeoff" /><div><small>Airline</small><strong>{flight.airline}</strong></div>
            </div>
            <div className={styles.detail}>
              <DynamicIcon name="CalendarDays" /><div className={styles.wide}><small>Travel Dates</small><div className={styles.dates}><span><small>Departure</small><strong>{flight.departure}</strong></span><span><small>Return</small><strong>{flight.returnDate}</strong></span></div></div>
            </div>
            <div className={styles.detail}>
              <DynamicIcon name="Clock3" /><div><small>Duration</small><strong>{flight.duration}</strong></div>
            </div>
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.header}>
            <DynamicIcon name={data.accommodationIcon || "Building2"} />
            <div><h2>{accommodation.title}</h2><p>{accommodation.subtitle}</p></div>
          </div>
          <div className={styles.body}>
            <div className={styles.detail}>
              <DynamicIcon name="Hotel" /><div className={styles.wide}><small>Hotels</small><div className={styles.hotelRow}><span><small>Makkah</small><strong>{accommodation.makkah}</strong></span></div><div className={styles.hotelRow}><span><small>Madinah</small><strong>{accommodation.madinah}</strong></span></div></div>
            </div>
            <div className={styles.detail}>
              <DynamicIcon name="TrainFront" /><div><small>Hotels</small><strong>{accommodation.transport}</strong><small>{accommodation.transportSubtitle}</small></div>
            </div>
            <div className={styles.detail}>
              <DynamicIcon name="TentTree" /><div><small>Tent Location</small><strong>{accommodation.tentLocation}</strong></div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
