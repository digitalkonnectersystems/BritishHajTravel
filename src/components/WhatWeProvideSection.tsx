"use client";

import { useState } from "react";

/* ---------- VIDEO HELPERS ---------- */

/** Extract a YouTube video ID from watch / youtu.be / shorts / live / embed URLs (or a raw ID). */
function getYouTubeId(value: string): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
    if (!host.endsWith("youtube.com") && !host.endsWith("youtube-nocookie.com"))
      return null;
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live")
      return parts[1] || null;
    return null;
  } catch {
    // Allow a raw video ID to be pasted directly
    return /^[a-zA-Z0-9_-]{11}$/.test(trimmed) ? trimmed : null;
  }
}

/** Parse a YouTube `t`/`start` param ("90", "2m30s", "1h2m3s") into whole seconds. */
function youTubeStartSeconds(url: URL): string | null {
  const raw = (url.searchParams.get("t") || url.searchParams.get("start") || "").trim();
  if (!raw) return null;
  const plain = /^(\d+)(s)?$/.exec(raw);
  if (plain) return plain[1];
  const parts = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
  if (parts) {
    const seconds =
      Number(parts[1] || 0) * 3600 +
      Number(parts[2] || 0) * 60 +
      Number(parts[3] || 0);
    return seconds > 0 ? String(seconds) : null;
  }
  return null;
}

/** Build an embeddable player URL (YouTube incl. live streams, Vimeo, or raw embed URLs). */
function getEmbedUrl(value: string, autoplay: boolean): string {
  const trimmed = value.trim();
  const ytParams = `autoplay=${autoplay ? 1 : 0}&rel=0&playsinline=1&modestbranding=1`;
  try {
    const url = new URL(trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      if (id) {
        return `https://www.youtube.com/embed/${id}?${ytParams}`;
      }
    }
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      let videoId: string | null = null;
      if (url.pathname === "/watch") videoId = url.searchParams.get("v");
      else if (
        parts[0] === "embed" ||
        parts[0] === "shorts" ||
        parts[0] === "live"
      )
        videoId = parts[1] || null;

      if (videoId) {
        const start = youTubeStartSeconds(url);
        const startParam = start ? `&start=${start}` : "";
        return `https://www.youtube.com/embed/${videoId}?${ytParams}${startParam}`;
      }
      // Covers /live_stream?channel=... (live) and any other YouTube embed pattern
      const sep = trimmed.includes("?") ? "&" : "?";
      return `${trimmed}${sep}${ytParams}`;
    }
    if (host.endsWith("vimeo.com")) {
      const numericId = url.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
      if (numericId) {
        return `https://player.vimeo.com/video/${numericId}?autoplay=${autoplay ? 1 : 0}`;
      }
      const sep = trimmed.includes("?") ? "&" : "?";
      return `${trimmed}${sep}autoplay=${autoplay ? 1 : 0}`;
    }
    // Any other (already embeddable) URL is passed through untouched
    return trimmed;
  } catch {
    const id = getYouTubeId(trimmed);
    if (id) return `https://www.youtube.com/embed/${id}?${ytParams}`;
    return trimmed;
  }
}

/** Direct video files play in a native HTML5 player instead of an iframe. */
function isDirectVideoFile(value: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(value.trim());
}

export default function WhatWeProvideSection({ data }: { data: any }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const eyebrow =
    data?.eyebrow || "DISCOVER A HIGHER PURPOSE";

  const title =
    data?.title || "Your Spiritual Journey<br />Starts Here";

  const description =
    data?.description ||
    data?.subtitle ||
    "Join thousands of pilgrims who have trusted us for a safe, comfortable and spiritually enriching Hajj & Umrah experience. We take care of every detail, so you can focus on what truly matters.";

  const image =
    data?.image || "uploads\\sections\\hajj_1.jpg";

  const backgroundImage =
    data?.backgroundImage || "/images/spiritual-journey-bg.webp";

  const badgeTitle =
    data?.badgeTitle || "A journey of faith";

  const badgeSubtitle =
    data?.badgeSubtitle || "A lifetime of memories";

  const decorativeText =
    data?.decorativeText || "Travel with\nPurpose";

  /* ---------- VIDEO STATE (click-to-play embedded video) ---------- */

  const videoUrl = (data?.videoUrl || "").trim();

  const hasVideo = Boolean(videoUrl);

  const videoFit = data?.videoFit === "contain" ? "contain" : "cover";

  const youtubeId = hasVideo ? getYouTubeId(videoUrl) : null;

  // Auto YouTube thumbnail (used when no custom poster is set)
  const autoThumbUrl = youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/maxresdefault.jpg`
    : "";
  const autoThumbFallback = youtubeId
    ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
    : "";

  // Poster priority: custom uploaded poster > auto YouTube thumbnail > section image
  const videoPoster =
    (data?.videoPoster || autoThumbUrl || image)
      .toString()
      .replace(/\\/g, "/");

  const embedSrc = hasVideo && !isDirectVideoFile(videoUrl)
    ? getEmbedUrl(videoUrl, true)
    : "";

  const directVideoSrc = hasVideo && isDirectVideoFile(videoUrl)
    ? videoUrl
    : "";

  const defaultItems = [
    {
      title: "Trusted Travel Partner",
      desc: "Years of experience in Hajj & Umrah travel",
      icon: "plane",
    },
    {
      title: "Complete Travel Support",
      desc: "Flights, hotels, visas and ground transport",
      icon: "users",
    },
    {
      title: "A Journey of Peace",
      desc: "Comfort, care and spiritual guidance at every step",
      icon: "shield",
    },
  ];

  const items =
    data?.items?.length ? data.items : defaultItems;

  const renderIcon = (icon: string) => {
    switch (icon) {
      case "users":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-6 h-6"
          >
            <circle cx="9" cy="8" r="3" />
            <circle cx="17" cy="9" r="2.5" />
            <path d="M3 20c.5-4.3 2.5-6.5 6-6.5s5.5 2.2 6 6.5" />
            <path d="M15 14c3.2 0 5.2 2 5.5 6" />
          </svg>
        );

      case "shield":
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-6 h-6"
          >
            <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );

      default:
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-6 h-6"
          >
            <path d="m3 11 18-8-8 18-2.5-7.5L3 11Z" />
            <path d="m10.5 13.5 4-4" />
          </svg>
        );
    }
  };

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#f3f9ff]
        bg-cover
        bg-center
        py-10
        md:py-14
        lg:py-16
      "
      style={{
        backgroundImage: `url("${backgroundImage.replace(/\\/g, "/").replace(/"/g, '\\"')}")`,
      }}
    >
      {/* soft white overlay */}
      <div className="absolute inset-0 bg-white/25" />

      <div className="relative max-w-[1500px] mx-auto px-5 md:px-8">
        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[1.05fr_1fr_0.65fr]
            gap-8
            lg:gap-10
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
                aspect-[1.45/1]
                shadow-[0_15px_40px_rgba(4,35,91,0.15)]
              "
            >
              {hasVideo && isPlaying ? (
                /* ---------- ACTIVE PLAYER (plays inline on this site) ---------- */
                directVideoSrc ? (
                  <video
                    src={directVideoSrc}
                    poster={videoPoster}
                    controls
                    autoPlay
                    playsInline
                    className={
                      videoFit === "cover"
                        ? "absolute inset-0 h-full w-full object-cover"
                        : "absolute inset-0 h-full w-full object-contain"
                    }
                  />
                ) : (
                  <div className="absolute inset-0 bg-black">
                    <div
                      className="
                        absolute
                        left-1/2
                        top-1/2
                        -translate-x-1/2
                        -translate-y-1/2
                      "
                      style={
                        videoFit === "cover"
                          ? {
                              aspectRatio: "16 / 9",
                              minWidth: "100%",
                              minHeight: "100%",
                            }
                          : { aspectRatio: "16 / 9", width: "100%" }
                      }
                    >
                      <iframe
                        src={embedSrc}
                        title={badgeTitle}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        style={{ border: 0 }}
                        className="h-full w-full"
                      />
                    </div>
                  </div>
                )
              ) : hasVideo ? (
                /* ---------- POSTER — click anywhere to play ---------- */
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  aria-label={`Play video: ${badgeTitle} — ${badgeSubtitle}`}
                  className="
                    group
                    absolute
                    inset-0
                    block
                    h-full
                    w-full
                    cursor-pointer
                    border-none
                    bg-transparent
                    p-0
                    text-left
                  "
                >
                  <img
                    src={videoPoster}
                    alt={`${badgeTitle} — ${badgeSubtitle}`}
                    onError={(event) => {
                      const el = event.currentTarget;
                      if (autoThumbFallback && el.dataset.thumbFallback !== "1") {
                        el.dataset.thumbFallback = "1";
                        el.src = autoThumbFallback;
                      }
                    }}
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      group-hover:scale-[1.03]
                    "
                  />

                  <span className="absolute inset-0 bg-[#08245c]/0 transition-colors duration-300 group-hover:bg-[#08245c]/10" />

                  {/* VIDEO STYLE BADGE / PLAY CONTROL */}
                  <span
                    className="
                      absolute
                      bottom-5
                      left-5
                      z-10
                      bg-white
                      rounded-[18px]
                      px-5
                      py-3
                      shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                      flex
                      items-center
                      gap-4
                      max-w-[310px]
                      transition-transform
                      duration-300
                      group-hover:scale-[1.03]
                    "
                  >
                    <span
                      className="
                        w-12
                        h-12
                        rounded-full
                        bg-[#ef171c]
                        text-white
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 ml-0.5"
                      >
                        <path d="M8 5v14l11-7L8 5Z" />
                      </svg>
                    </span>

                    <span className="block">
                      <span className="block text-[#08245c] font-bold text-[15px]">
                        {badgeTitle}
                      </span>

                      <span className="block text-[#5c708d] text-[13px]">
                        {badgeSubtitle}
                      </span>
                    </span>
                  </span>
                </button>
              ) : (
                <>
                  <img
                    src={image.replace(/\\/g, "/")}
                    alt="Hajj and Umrah Journey"
                className="
                  w-full
                  h-full
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-[1.03]
                "
              />

              {/* OPTIONAL VIDEO STYLE BADGE */}
              <div
                className="
                  absolute
                  bottom-5
                  left-5
                  bg-white
                  rounded-[18px]
                  px-5
                  py-3
                  shadow-[0_8px_25px_rgba(0,0,0,0.15)]
                  flex
                  items-center
                  gap-4
                  max-w-[310px]
                "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-[#ef171c]
                    text-white
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 ml-0.5"
                  >
                    <path d="M8 5v14l11-7L8 5Z" />
                  </svg>
                </div>

                <div>
                  <div className="text-[#08245c] font-bold text-[15px]">
                    {badgeTitle}
                  </div>

                  <div className="text-[#5c708d] text-[13px]">
                    {badgeSubtitle}
                  </div>
                </div>
              </div>
                </>
              )}
            </div>
          </div>

          {/* CENTER CONTENT */}
          <div>
            <div
              className="
                text-[#ef2024]
                text-[11px]
                sm:text-xs
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
                text-[36px]
                sm:text-[42px]
                lg:text-[48px]
                xl:text-[54px]
                font-bold
                leading-[1.02]
                mb-4
              "
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            />

            <p
              className="
                text-[#405b7e]
                text-[15px]
                md:text-[16px]
                leading-[1.6]
                max-w-[720px]
                mb-6
              "
            >
              {description}
            </p>

            {/* FEATURES */}
            <div className="space-y-4">
              {items.slice(0, 3).map(
                (item: any, i: number) => (
                  <div
                    key={i}
                    className="
                      flex
                      items-center
                      gap-4
                      group
                    "
                  >
                    <div
                      className="
                        w-[52px]
                        h-[52px]
                        rounded-full
                        bg-[#ef171c]
                        text-white
                        flex
                        items-center
                        justify-center
                        shrink-0
                        shadow-[0_7px_18px_rgba(239,23,28,0.18)]
                        transition-all
                        duration-300
                        group-hover:scale-105
                      "
                    >
                      {renderIcon(
                        item.icon ||
                          ["plane", "users", "shield"][i]
                      )}
                    </div>

                    <div>
                      <h4
                        className="
                          text-[#08245c]
                          font-bold
                          text-[17px]
                          md:text-[18px]
                          leading-tight
                        "
                      >
                        {item.title}
                      </h4>

                      <p
                        className="
                          text-[#526d8e]
                          text-[13px]
                          md:text-[14px]
                          leading-5
                          mt-1
                        "
                      >
                        {item.desc ||
                          item.description}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* RIGHT DECORATIVE TEXT */}
          <div
            className="
              hidden
              lg:flex
              items-center
              justify-center
              min-h-[330px]
            "
          >
            <div
              className="
                text-[#08245c]
                text-center
                rotate-[-6deg]
                font-serif
                italic
                text-[37px]
                xl:text-[44px]
                leading-[1.05]
              "
            >
              {decorativeText.split("\n").map((line: string, index: number) => (
                <span key={index}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}

              <div
                className="
                  w-[115px]
                  h-[4px]
                  bg-[#ef171c]
                  ml-auto
                  mt-3
                  rotate-[-8deg]
                "
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}