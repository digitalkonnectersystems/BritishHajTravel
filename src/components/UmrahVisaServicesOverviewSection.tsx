"use client";

const defaultRows = [
  ["Umrah visa application processing time", "Same day (within 24 hours) | TLC apply"],
  ["Competitive visa fee for type of Visa Application for Saudi Arabia", "WhatsApp Us +44 795 7197 390 For Price"],
  ["Umrah Visa", "Single entry visa for 90 days (30 day’s duration of stay ) with Medical cover"],
  ["Saudi Tourist Visa (UK-British / European Passport Holders Only)", "Multiple-entry visa for 90 day’s ( 90 day’s duration of stay ) with Medical cover"],
  ["Apply Umrah visa application online with British Hajj Travel", "E – Umrah Visa"],
  ["Non British passport holders can also obtain Tourist Visa", "USA, UK and Schengen visa holders (Business visa / Family visa / 2-5 holders / EU Settlement visa holders)"],
  ["Urgent Umrah Visa", "Within 24 hours (same day)"],
  ["Tailor-made Umrah Visa & Packages", "Including Flights, Accommodations, Zaviads and Transportation"],
  ["Umrah Visa Only", "Without Hotel Booking customers per own Umrah journey"],
  ["Available Online Support", "24/7 Support + 365 Days Per Annum (Holiday's)"],
];

export default function UmrahVisaServicesOverviewSection({ data = {} }: { data?: any }) {
  const rows = Array.isArray(data.rows) && data.rows.length > 0 ? data.rows : defaultRows;
  return (
    <section className="umrah-visa-services-overview">
      <div className="umrah-visa-services-overview-inner">
        <div className="umrah-visa-overview-content">
          <h2>{data.title || "British Hajj Travel Limited – Umrah Visa Services"}</h2>
          <p className="umrah-visa-overview-subtitle">{data.subtitle || "Approved by Ministry of Hajj / Umrah | Saudi Arabia Visa Services Overview"}</p>
          <div className="umrah-visa-overview-table" role="table">
            {rows.map((row: any, index: number) => (
              <div className="umrah-visa-overview-row" role="row" key={index}>
                <div role="cell">{row[0] || ""}</div>
                <div role="cell">{row[1] || ""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
