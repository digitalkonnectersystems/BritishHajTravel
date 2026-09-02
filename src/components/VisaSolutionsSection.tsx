"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const defaultVisaSolutions = [
  {
    title: "Tourist Visa",
    description:
      "Only passport required. Explore the beauty and culture of Saudi Arabia effortlessly.",
    image: "/img/saudi-visa-1.webp",
  },
  {
    title: "Umrah Visa",
    description:
      "Requires passport and PR Card or other proof of residence. Start your spiritual journey with official Umrah visa services.",
    image: "/img/saudi-visa-2.webp",
  },
  {
    title: "Family Visit Visa",
    description:
      "Complete list of requirements sent via email. Reunite with your loved ones quickly and securely.",
    image: "/img/saudi-visa-3.jpg",
  },
  {
    title: "Resident Iqama Visa",
    description:
      "Get all the requirements sent to your inbox. Simplify your residency process with expert guidance.",
    image: "/img/saudi-visa-4.webp",
  },
  {
    title: "Business Visit Visa",
    description:
      "We'll email the full details you need. Expand your business horizons with an authorized visa service.",
    image: "/img/saudi-visa-5.webp",
  },
  {
    title: "Work Visa",
    description:
      "Contact us for detailed requirements via email. Begin your career in Saudi Arabia with professional assistance.",
    image: "/img/saudi-visa-6.jpg",
  },
  {
    title: "Personal Visit Visa",
    description:
      "Get in touch with us today to get the detailed requirements and fast-track your Saudi personal visit visa with our professional guidance.",
    image: "/img/riyadh.jpg",
  },
];

export default function VisaSolutionsSection({ data, className }: { data?: any; className?: string }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  const items =
    data?.items &&
      Array.isArray(data.items) &&
      data.items.length > 0
      ? data.items
      : defaultVisaSolutions;

  const bgClass = data?.bgColor || (isHomepage ? "bg-white" : "bg-sage");

  return (
    <section id="saudi-visa" className={`py-12 md:py-16 w-full ${bgClass} ${className || ""}`}>
      <div className="max-w-[1400px] mx-auto px-5">
        <div className="section-head center text-center mb-10">
          <div className="eyebrow uppercase text-xs font-bold tracking-widest text-gold mb-1">
            {data?.eyebrow || "EXPLORE OUR"}
          </div>

          <h2>
            {data?.title || "Saudi Visa Solutions"}
          </h2>
        </div>

        <div className="visa-grid grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((card: any, cIdx: number) => (
            <div
              key={cIdx}
              className="visa-card bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group transition-all duration-300 hover:shadow-2xl"
            >
              <div className="card-image-wrapper relative h-52 overflow-hidden">
                <Image
                  src={card.image || "/img/saudi-visa-1.webp"}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  unoptimized
                />
              </div>

              <div className="card-content p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="card-title">
                    {card.title}
                  </h3>

                  <p className="card-description">
                    {card.description}
                  </p>
                </div>

                <Link
                  href="/contact"
                  className="mt-5 inline-flex items-center justify-center bg-gold text-ink font-bold text-sm px-6 py-3 rounded-md hover:bg-gold-lt transition-colors"
                >
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}