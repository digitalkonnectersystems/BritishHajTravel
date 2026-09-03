"use client";

import React, { useEffect, useState } from "react";

interface FlipCardItem {
  logo: string;
  title: string;
  description: string;
  linkUrl?: string;
}

interface CertificationsFlipCardsSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    bgImage?: string;
    items?: FlipCardItem[];
  };
}

export default function CertificationsFlipCardsSection({
  data,
}: CertificationsFlipCardsSectionProps) {
  const {
    eyebrow = "WHY THEY MATTER",
    title = "OUR CERTIFICATIONS",
    bgImage,
    items: dataItems = [],
  } = data || {};

  const items =
    dataItems.length > 0
      ? dataItems
      : [
        {
          logo: "/img/tico.svg",
          title: "TICO",
          description:
            "TICO regulates travel agencies in Ontario, protecting consumer prepaid funds and ensuring compliance with strict Canadian travel industry regulations.",
        },
        {
          logo: "/img/iata.svg",
          title: "IATA",
          description:
            "Being an IATA accredited agency allows us to work directly with airlines, offering competitive airfares, seamless ticketing, and exclusive deals.",
        },
        {
          logo: "/img/acta.svg",
          title: "ACTA",
          description:
            "ACTA membership advocates for ethical travel practices and professional excellence across the Canadian travel industry.",
        },
        {
          logo: "/img/asta.svg",
          title: "ASTA",
          description:
            "ASTA certification connects us with global travel standards and verified international destination management networks.",
        },
        {
          logo: "/img/atac.svg",
          title: "ATAC",
          description:
            "ATAC represents air transport excellence and safe aviation ticketing protocols across Canada.",
        },
        {
          logo: "",
          title: "Saudi Ministry of Foreign Affairs",
          description:
            "Official Saudi Ministry authorization for processing Umrah, Hajj, business, and tourist visas directly from Canada.",
        },
      ];

  /**
   * Mobile click flip state
   */
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  /**
   * Detect mobile/tablet breakpoint.
   *
   * Below 768px:
   * Click/tap controls card flip.
   *
   * 768px and above:
   * Hover controls card flip.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const handleMediaChange = () => {
      const mobile = mediaQuery.matches;

      setIsMobile(mobile);

      // If switched back to desktop,
      // remove any mobile locked/flipped card.
      if (!mobile) {
        setFlippedIndex(null);
      }
    };

    handleMediaChange();

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const handleCardClick = (idx: number) => {
    // Click behavior should ONLY work on mobile.
    if (!isMobile) return;

    setFlippedIndex((current) =>
      current === idx ? null : idx
    );
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section className="py-20 relative bg-gray overflow-hidden">

      {/* Background */}
      {bgImage && (
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={bgImage}
            alt="Background pattern"
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <span className="eyebrow mx-auto block">
            {eyebrow}
          </span>

          <h2 className="section-heading font-serif head">
            {title}
          </h2>
        </div>


        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {items.map((item, idx) => {
            const isFlipped = flippedIndex === idx;

            return (
              <div
                key={idx}
                className="
                  h-64
                  w-full
                  group
                  [perspective:1000px]
                  cursor-pointer
                  md:cursor-default
                "
                onClick={() => handleCardClick(idx)}
              >

                {/* Flip Container */}
                <div
                  className={`
                    relative
                    h-full
                    w-full
                    rounded-3xl
                    transition-transform
                    duration-700
                    [transform-style:preserve-3d]
                    shadow-sm
                    md:hover:shadow-xl

                    ${isFlipped
                      ? "[transform:rotateY(180deg)]"
                      : ""
                    }

                    md:group-hover:[transform:rotateY(180deg)]
                  `}
                >

                  {/* =========================
                      FRONT SIDE
                  ========================== */}
                  <div
                    className={`
                      absolute
                      inset-0
                      h-full
                      w-full
                      rounded-3xl
                      bg-white
                      p-8
                      flex
                      items-center
                      justify-center
                      border
                      border-gray-100
                      [backface-visibility:hidden]
                      z-10
                      transition-opacity
                      duration-300

                      ${isFlipped
                        ? "opacity-0"
                        : "opacity-100"
                      }

                      md:opacity-100
                      md:group-hover:opacity-0
                    `}
                  >

                    {item.logo ? (
                      <div className="relative w-4/5 h-4/5 flex items-center justify-center">
                        <img
                          src={item.logo}
                          alt={
                            item.title ||
                            "Certification Logo"
                          }
                          loading="lazy"
                          className="
                            max-h-full
                            max-w-full
                            object-contain
                            w-36
                            md:group-hover:grayscale-0
                            md:group-hover:opacity-100
                            transition-all
                            duration-500
                          "
                        />
                      </div>
                    ) : (
                      <span className="text-primary font-bold text-center">
                        {item.title}
                      </span>
                    )}

                  </div>


                  {/* =========================
                      BACK SIDE
                  ========================== */}
                  <div
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      rounded-3xl
                      bg-white
                      text-primary
                      p-8
                      [transform:rotateY(180deg)]
                      [backface-visibility:hidden]
                      flex
                      flex-col
                      justify-center
                      items-center
                      text-center
                    "
                  >

                    <h3 className="font-bold text-lg mb-3 head">
                      {item.title}
                    </h3>

                    <p className="text-sm text-ink leading-relaxed overflow-y-auto custom-scrollbar">
                      {item.description}
                    </p>



                  </div>

                </div>
              </div>
            );
          })}

        </div>

      </div>
    </section>
  );
}
