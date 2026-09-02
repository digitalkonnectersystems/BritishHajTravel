"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("js-reveal");

    const revealAllVisible = () => {
      const revealEls = document.querySelectorAll(".reveal");
      revealEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Immediately reveal any element in or near the viewport
        if (rect.top < window.innerHeight + 200) {
          el.classList.add("in");
        }
      });
    };

    revealAllVisible();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "100px 0px 100px 0px" }
    );

    const revealEls = document.querySelectorAll(".reveal");
    revealEls.forEach((el) => io.observe(el));

    // Instant safety fallback: Force reveal all elements within 150ms so no section is ever hidden
    const safetyTimer = setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    }, 150);

    return () => {
      clearTimeout(safetyTimer);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
