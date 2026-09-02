"use client";

import Image from "next/image";

interface MarqueeTrackProps {
  type: "travel" | "airline";
  images: { src: string; alt?: string }[];
  speedMs?: number;
  direction?: "left" | "right";
  cardStyle?: boolean;
}

export default function MarqueeTrack({ type, images, speedMs = 35000, direction = "left", cardStyle = false }: MarqueeTrackProps) {
  // Duplicate images for infinite scroll loop, and filter out any with empty sources
  const displayImages = [...images, ...images].filter((img) => img.src && img.src.trim() !== "");
  const animationDuration = `${speedMs / 1000}s`;
  const animationDirection = direction === "right" ? "reverse" : "normal";

  return (
    <div className="marquee-widget">
      <div className="marquee-wrapper overflow-hidden md:overflow-visible">
        <div
          ref={(el) => {
            if (el) {
              el.style.animationDuration = animationDuration;
              el.style.animationDirection = animationDirection;
            }
          }}
          className={`marquee-track ${type}`}
        >
          {displayImages.map((img, idx) => (
            <div className={`marquee-item ${cardStyle ? 'p-3' : ''}`} key={idx}>
              <div className={`w-full h-full flex items-center justify-center ${cardStyle ? 'min-h-[110px]' : ''}`}>
                {img.src.startsWith('data:') ? (
                  <img
                    src={img.src}
                    alt={img.alt || "Partner logo"}
                    className="w-auto h-auto max-h-[60px] max-w-full object-contain"
                  />
                ) : (
                  <Image
                    src={img.src}
                    alt={img.alt || "Partner logo"}
                    width={200}
                    height={80}
                    className="w-[210px] h-auto max-w-full mb-wt-home"
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
