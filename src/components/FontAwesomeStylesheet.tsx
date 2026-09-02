"use client";

import { useEffect, useRef, useState } from "react";

const FONT_AWESOME_CSS =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css";

export default function FontAwesomeStylesheet() {
  const linkRef = useRef<HTMLLinkElement>(null);
  const [media, setMedia] = useState("print");

  useEffect(() => {
    if (linkRef.current?.sheet) {
      setMedia("all");
    }
  }, []);

  return (
    <>
      <link
        ref={linkRef}
        rel="stylesheet"
        href={FONT_AWESOME_CSS}
        media={media}
        onLoad={() => setMedia("all")}
      />
      <noscript>
        <link rel="stylesheet" href={FONT_AWESOME_CSS} />
      </noscript>
      <style>{`
        @font-face {
          font-family: "Font Awesome 6 Free";
          font-style: normal;
          font-weight: 900;
          font-display: swap;
          src: url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/webfonts/fa-solid-900.woff2") format("woff2");
        }
      `}</style>
    </>
  );
}
