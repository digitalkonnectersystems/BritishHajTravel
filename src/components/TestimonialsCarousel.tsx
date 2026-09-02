"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Review {
  id: number;
  name: string;
  time: string;
  avatar: string;
  text: string;
  rating?: number;
}

const defaultReviews: Review[] = [
  {
    id: 1,
    name: "tamim rahimi",
    time: "3 months ago",
    avatar: "/img/tamim.png",
    text: "I’m a man of few words. It was an amazing experience with the Umrah package in March 2026. Everything went as expected, with no surprises. There will be a huge list if I name everyone, so a big thanks to everyone. JazakAllah khair!",
  },
  {
    id: 2,
    name: "Hiba M",
    time: "3 months ago",
    avatar: "/img/h.png",
    text: "My daughter and I just came back from a twelve day Umrah trip organized by King Travel. The trip was well planned and structured. We were very fortunate to have Imam Ismail Fetic as our guide who provided a wealth of knowledge and insights. The accomodation and the food were really nice. I highly recommend booking with King Travel.",
  },
  {
    id: 3,
    name: "Nimrah Suhaib",
    time: "3 months ago",
    avatar: "/img/nimrah.png",
    text: "We’re so glad we booked our Umrah trip from King Travel. Mr. Jamil Latif provided exceptional service, from the initial booking, he reassured us that everything would go smoothly, and he delivered exactly that. His professionalism, clear communication made the entire process stress‑free. The agency also offered excellent arrangements and reliable support throughout. Highly recommended!",
  },
  {
    id: 4,
    name: "Dina",
    time: "3 months ago",
    avatar: "/img/dina.png",
    text: "Assalamu alaikum ❤️ I would like to sincerely thank King Travel for organizing such a beautiful and well-planned Umrah journey. From the very beginning, everything was handled with care, professionalism, and a true sense of responsibility toward the guests of Allah. A special appreciation for the comfortable transportation and the excellent hotels in Makkah and Madinah, both just a few minutes’ walk from the Haram. Thank you as well for the lovely dinner before our departure and for the thoughtful gift of Zamzam water at the airport. A heartfelt thank you to our imam, Ismail whose knowledge, dedication, and sincere guidance added a deeper spiritual dimension to this journey.",
  },
  {
    id: 5,
    name: "Tiha",
    time: "3 months ago",
    avatar: "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=150&auto=format&fit=crop&q=80",
    text: "I am grateful Elhamdullilahi for this wonderful opportunity to preform Umrah on March 2026 with King Travel, also with huge support from our Imam Ismail Fetic which this journey wouldn't be possible without his guidance.",
  },
  {
    id: 6,
    name: "Safet Muminovic",
    time: "3 months ago",
    avatar: "/img/s.png",
    text: "Alhamdulillah for this beautiful opportunity to perform Umrah. I am very grateful to King Travel for making this journey smooth and comfortable. A special thank you to our imam, Ismail Fetic, who guided us every step of the way, not only logistically, but spiritually as well. His reminders, care, and presence made this experience unforgettable. May Allah reward you all abundantly.",
  },
  {
    id: 7,
    name: "Mirsad Celic",
    time: "3 months ago",
    avatar: "/img/m.png",
    text: "Special thanks to our Imam Ismail Fetic for his kind care, guidance, leadership and explanations throughout this wonderful journey!",
  },
];

export default function TestimonialsCarousel({
  reviews: initialReviews = defaultReviews,
  autoplaySpeed = 3000,
  apiKey,
  placeId
}: {
  reviews?: Review[],
  autoplaySpeed?: number,
  apiKey?: string,
  placeId?: string
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(!!(apiKey && placeId));

  useEffect(() => {
    if (apiKey && placeId) {
      const fetchReviews = async () => {
        try {
          const res = await fetch(`/api/reviews?apiKey=${apiKey}&placeId=${placeId}`);
          const data = await res.json();
          if (data.reviews && data.reviews.length > 0) {
            const mappedReviews = data.reviews.map((r: any, index: number) => ({
              id: index + 1,
              name: r.author_name,
              time: r.relative_time_description,
              avatar: r.profile_photo_url || "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=150&auto=format&fit=crop&q=80",
              text: r.text,
              rating: r.rating
            }));
            setReviews(mappedReviews);
          }
        } catch (error) {
          console.error("Error fetching google reviews:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchReviews();
    } else {
      setReviews(initialReviews);
    }
  }, [apiKey, placeId, initialReviews]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [visibleItems, setVisibleItems] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [enableTransition, setEnableTransition] = useState(true);

  // Triple array for continuous infinite sliding
  const extendedReviews = [...reviews, ...reviews, ...reviews];
  const totalOriginal = reviews.length;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 600) {
        setVisibleItems(1);
      } else if (window.innerWidth <= 1200) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto carousel effect with 3.5s interval & hover pause
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, autoplaySpeed);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Seamless infinite reset when passing boundaries
  useEffect(() => {
    if (currentIndex >= totalOriginal * 2) {
      const timer = setTimeout(() => {
        setEnableTransition(false);
        setCurrentIndex((prev) => prev - totalOriginal);
      }, 500);
      return () => clearTimeout(timer);
    } else if (currentIndex < 0) {
      setEnableTransition(false);
      setCurrentIndex(totalOriginal - 1);
    } else {
      if (!enableTransition) {
        const timer = setTimeout(() => {
          setEnableTransition(true);
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, totalOriginal, enableTransition]);

  const toggleReview = (id: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleNext = () => {
    setEnableTransition(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setEnableTransition(true);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalOriginal - 1));
  };

  const trackRef = useState<HTMLDivElement | null>(null)[1];
  const [trackEl, setTrackEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (trackEl) {
      trackEl.style.transform = `translateX(calc(-${currentIndex} * ((100% + 16px) / ${visibleItems})))`;
    }
  }, [currentIndex, visibleItems, trackEl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full mx-auto max-w-[884px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button
        className="absolute top-1/2 -translate-y-1/2 -left-4 max-sm:-left-2 w-9 h-9 rounded-full border border-slate-200 bg-white cursor-pointer flex items-center justify-center z-10 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={handlePrev}
        aria-label="Previous slide"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#132723]">
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
        </svg>
      </button>

      <div className="overflow-hidden w-full rounded-3xl">
        <div
          ref={setTrackEl}
          className={`flex gap-4 ${enableTransition ? "transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]" : ""}`}
        >
          {extendedReviews.map((review, idx) => {
            const isExpanded = !!expandedCards[review.id];
            return (
              <div className="flex-[0_0_100%] sm:flex-[0_0_calc((100%-16px)/2)] lg:flex-[0_0_calc((100%-32px)/3)] box-border shrink-0" key={`${review.id}-${idx}`}>
                <div className={`bg-white rounded-3xl p-6 w-full shadow-lg border border-slate-100 flex flex-col justify-between h-full ${isExpanded ? "expanded" : ""}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <Image
                        className="rounded-full object-cover"
                        src={review.avatar}
                        alt={review.name}
                        width={42}
                        height={42}
                      />
                      <div>
                        <div className="text-[15px] font-bold text-slate-900 mb-[1px] font-sans">{review.name}</div>
                        <div className="text-[12px] text-slate-400 font-medium">{review.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center w-6 h-6">
                      <svg
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1 text-amber-400 [&_svg]:fill-amber-400 [&_svg]:w-4 [&_svg]:h-4">
                      <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                      <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                      <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                      <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                      <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                    </div>
                    <div className="flex items-center text-blue-500 [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:fill-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                  </div>

                  <div className={`text-xs leading-relaxed text-slate-600 font-normal mb-3 font-sans transition-[max-height] duration-500 ease-in-out overflow-hidden ${isExpanded ? "line-clamp-none max-h-[300px]" : "line-clamp-3 max-h-[60px]"}`}>{review.text}</div>

                  <span className="text-xs text-slate-400 font-semibold no-underline cursor-pointer inline-block hover:text-primary transition-colors" onClick={() => toggleReview(review.id)}>
                    {isExpanded ? "Read less" : "Read more"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="absolute top-1/2 -translate-y-1/2 -right-4 max-sm:-right-2 w-9 h-9 rounded-full border border-slate-200 bg-white cursor-pointer flex items-center justify-center z-10 shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        onClick={handleNext}
        aria-label="Next slide"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#132723]">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
        </svg>
      </button>
    </div>
  );
}
