"use client";

import { useEffect, useState } from "react";

export default function WhoWeAreSection({ data }: { data: any }) {
  // CMS content
  const configuredValue = (key: string, fallback: string) =>
    data && Object.prototype.hasOwnProperty.call(data, key)
      ? String(data[key] ?? "")
      : fallback;

  const eyebrow =
    configuredValue("eyebrow", "ABOUT BHT BRITISH HAJ TRAVEL LTD");

  const title =
    configuredValue("title", "We provide and offer Hajj & Umrah packages from the UK");

  const description1 =
    configuredValue(
      "description1",
      "BHT British Haj Travel Ltd is a trusted, family-run travel organisation from the UK. We provide fully ATOL protected Hajj and Umrah packages with a focus on care, comfort and spiritual fulfilment."
    );

  const image =
    configuredValue("image", "uploads\\sections\\hajj_1.jpg");

  const backgroundImage =
    configuredValue("backgroundImage", "/upload/sections/who-we-are-bg.webp");

  const featuresTitle =
    configuredValue("featuresTitle", "Why Choose BHT British Haj Travel Ltd?");

  const rawItems =
    Array.isArray(data?.items)
      ? data.items
      : [
          { value: "25+", label: "Years of Service" },
          { value: "10K+", label: "Happy Pilgrims" },
          { value: "5★", label: "Service Rating" },
          { value: "24/7", label: "Customer Support" },
        ];

  const features =
    Array.isArray(data?.features)
      ? data.features
      : [
          {
            title: "Fully ATOL Protected",
            description: "Your financial security is our priority",
            icon: "shield",
          },
          {
            title: "Islamic Guidance",
            description: "With authentic scholarly support",
            icon: "book",
          },
          {
            title: "UK Based & Trusted",
            description: "A family-run travel company",
            icon: "building",
          },
          {
            title: "Group & Family Packages",
            description: "Special arrangements for families",
            icon: "users",
          },
        ];

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 2500;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;

      const linear = Math.min((timestamp - start) / duration, 1);
      const ease = linear * (2 - linear);

      setProgress(ease);

      if (linear < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setProgress(1);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const formatStatValue = (valStr: string, p: number) => {
    if (!valStr || typeof valStr !== "string") return valStr;

    const match = valStr.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);

    if (!match) return valStr;

    const prefix = match[1] || "";
    const num = parseFloat(match[2]);
    const suffix = match[3] || "";

    const isDecimal = match[2].includes(".");

    if (isDecimal) {
      return `${prefix}${(num * p).toFixed(1)}${suffix}`;
    }

    return `${prefix}${Math.floor(num * p)}${suffix}`;
  };

  const statsItems = rawItems.map((stat: any) => ({
    ...stat,
    displayValue: formatStatValue(
      String(stat.value || ""),
      progress
    ),
  }));

  const renderFeatureIcon = (icon: string) => {
    switch (icon) {
      case "book":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-6 h-6"
          >
            <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23V5.5Z" />
            <path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5A3.5 3.5 0 0 1 20 23V5.5Z" />
          </svg>
        );

      case "building":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-6 h-6"
          >
            <path d="M3 21h18" />
            <path d="M5 21V10h4v11" />
            <path d="M10 21V5h4v16" />
            <path d="M15 21V12h4v9" />
          </svg>
        );

      case "users":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-6 h-6"
          >
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="10" r="2.5" />
            <path d="M3 20c.4-4.2 2.5-6.5 6-6.5s5.6 2.3 6 6.5" />
            <path d="M15 15c3.2 0 5 1.8 5.5 5" />
          </svg>
        );

      case "plane":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="w-6 h-6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
        </svg>
      );

      default:
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="w-6 h-6"
          >
            <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
    }
  };

  return (
    <section
      className="
        relative overflow-hidden
        py-10 md:py-14
        bg-[#eef8ff]
        bg-cover bg-center
      "
      style={{
        backgroundImage: `url("${backgroundImage.replace(/\\/g, "/").replace(/"/g, '\\"')}")`,
      }}
    >
      {/* light overlay */}
      <div className="absolute inset-0 bg-white/20" />

      <div className="relative max-w-[1500px] mx-auto px-5 md:px-8">
        <div
          className="
            grid grid-cols-1
            lg:grid-cols-[1.05fr_1.5fr_0.9fr]
            gap-8 lg:gap-10
            items-center
          "
        >
          {/* LEFT IMAGE */}
          <div>
            <div
              className="
                relative
                overflow-hidden
                rounded-[22px]
                shadow-[0_15px_40px_rgba(8,36,92,0.12)]
                aspect-[1.4/1]
              "
            >
              <img
                src={image.replace(/\\/g, "/")}
                alt="Kaaba in Makkah"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* CENTER */}
          <div
            className="
              rounded-[24px]
              bg-[#dff1ff]/55
              backdrop-blur-[2px]
              p-5 sm:p-7 lg:p-8
            "
          >
            <div
              className="
                text-[#ef2024]
                text-[11px] sm:text-xs
                tracking-[0.28em]
                uppercase
                font-bold
                mb-3
              "
            >
              {eyebrow}
            </div>

            <h2
              className="
                text-[#08245c]
                font-serif
                text-[32px]
                sm:text-[38px]
                lg:text-[44px]
                xl:text-[48px]
                leading-[1.02]
                font-bold
                mb-4
              "
              dangerouslySetInnerHTML={{ __html: title }}
            />

            <p
              className="
                text-[#294970]
                text-[15px]
                md:text-[17px]
                leading-[1.6]
                max-w-[820px]
              "
            >
              {description1}
            </p>

            {/* STATS */}
            <div
              className="
                grid grid-cols-2
                sm:grid-cols-4
                gap-3
                mt-7
              "
            >
              {statsItems.map(
                (stat: any, idx: number) => (
                  <div
                    key={idx}
                    className="
                      bg-white/95
                      border border-white
                      rounded-[16px]
                      min-h-[110px]
                      px-3 py-4
                      flex flex-col
                      items-center justify-center
                      text-center
                      shadow-[0_8px_22px_rgba(0,48,103,0.06)]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-[0_12px_30px_rgba(0,48,103,0.12)]
                    "
                  >
                    <div
                      className="
                        text-[#ef2024]
                        font-bold
                        text-[27px]
                        sm:text-[30px]
                        leading-none
                      "
                    >
                      {stat.displayValue}
                    </div>

                    <div
                      className="
                        text-[#35567e]
                        text-[12px]
                        sm:text-[13px]
                        mt-2
                        leading-tight
                        font-medium
                      "
                    >
                      {stat.label}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* RIGHT FEATURES */}
          <div className="lg:pl-2">
            <h3
              className="
                text-[#08245c]
                text-[22px]
                md:text-[25px]
                font-bold
                mb-7
              "
            >
              {featuresTitle}
            </h3>

            <div className="space-y-6">
              {features.map(
                (feature: any, idx: number) => (
                  <div
                    key={idx}
                    className="
                      flex items-start
                      gap-4
                      group
                    "
                  >
                    <div
                      className="
                        w-[58px]
                        h-[58px]
                        shrink-0
                        rounded-full
                        bg-[#062866]
                        text-white
                        flex items-center
                        justify-center
                        shadow-[0_7px_20px_rgba(6,40,102,0.15)]
                        transition-transform
                        duration-300
                        group-hover:scale-105
                      "
                    >
                      {renderFeatureIcon(
                        feature.icon
                      )}
                    </div>

                    <div className="pt-1">
                      <h4
                        className="
                          text-[#08245c]
                          text-[16px]
                          md:text-[17px]
                          font-bold
                          leading-tight
                        "
                      >
                        {feature.title}
                      </h4>

                      <p
                        className="
                          text-[#486586]
                          text-[13px]
                          md:text-[14px]
                          leading-5
                          mt-1
                        "
                      >
                        {feature.description}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}