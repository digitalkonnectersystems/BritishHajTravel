"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function DeluxeHajj2027Page() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [guests, setGuests] = useState("1");

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const getEstimatedTotal = () => {
    const guestNum = parseInt(guests) || 1;
    return (17995 * guestNum).toLocaleString();
  };

  return (
    <main className="bg-sage min-h-screen">
      {/* ================= SUB-HEADER HERO ================= */}
      <div className="sub-header bg-[#0b4a3a] text-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="hero-info">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">Deluxe Hajj Package 2027</h1>
            <div className="flex gap-2 mb-4 text-sm font-medium">
              <b>Duration:</b>
              <span>17 Days / 16 Nights</span>
            </div>
            <div className="route-meta flex gap-6 text-sm">
              <span>
                <i className="fa-solid fa-plane-departure text-[#d4af37] mr-2"></i> Departure: <b>Canada</b>
              </span>
              <span>
                <i className="fa-solid fa-plane-arrival text-[#d4af37] mr-2"></i> Destination: <b>Saudia</b>
              </span>
            </div>
          </div>

          <div className="pricing-box border border-dashed border-white/40 rounded-2xl py-4 px-8 text-center bg-white/5">
            <span className="text-[11px] font-extrabold tracking-[2px] text-[#d4af37] uppercase block mb-1">
              EXCLUSIVE PACKAGE
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="font-serif text-4xl font-bold leading-none">CAD 17,995</span>
            </div>
            <span className="text-xs block mt-2 text-slate-200">per person, quad occupancy</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT & SIDEBAR ================= */}
      <section className="py-14 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Hotels Grid */}
            <div className="hotels-section">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Premium Accommodations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Makkah Hotel Card */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:-translate-y-1 transition duration-200">
                  <div className="relative h-48 bg-cover bg-center bg-[url('/img/fairmount.jpg')]">
                    <span className="absolute top-4 left-4 bg-[#0b4a3a] text-white text-xs font-semibold px-4 py-1.5 rounded-full border-2 border-white">
                      Makkah
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="font-bold text-lg text-slate-900 mb-1">5 Star Hotel Fairmont</h4>
                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                      <i className="fa-solid fa-location-dot text-emerald-800"></i> Walking distance to Al-Haram
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      <span className="bg-emerald-50 text-emerald-800 text-xs font-medium px-3 py-1 rounded-md flex items-center gap-1">
                        <i className="fa-solid fa-utensils"></i> Breakfast &amp; Dinner Inc.
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-md flex items-center gap-1">
                        <i className="fa-solid fa-moon"></i> 6 Nights Stay
                      </span>
                    </div>
                  </div>
                </div>

                {/* Madinah Hotel Card */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:-translate-y-1 transition duration-200">
                  <div className="relative h-48 bg-cover bg-center bg-[url('/img/dar-al-eman.jpg')]">
                    <span className="absolute top-4 left-4 bg-[#d4af37] text-slate-900 text-xs font-bold px-4 py-1.5 rounded-full border-2 border-white">
                      Madinah
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="font-bold text-lg text-slate-900 mb-1">5 Star Hotel Dar Al Eman Intercontinental</h4>
                    <p className="text-sm text-slate-500 mb-4 flex items-center gap-1.5">
                      <i className="fa-solid fa-location-dot text-emerald-800"></i> Near Masjid Al-Nabawi courtyard
                    </p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      <span className="bg-emerald-50 text-emerald-800 text-xs font-medium px-3 py-1 rounded-md flex items-center gap-1">
                        <i className="fa-solid fa-utensils"></i> Breakfast &amp; Dinner Inc.
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-md flex items-center gap-1">
                        <i className="fa-solid fa-moon"></i> 6 Nights Stay
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary Timeline */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Package Overview</h3>
              <div className="relative pl-8 border-l-2 border-dashed border-slate-300 ml-4 space-y-8">
                {/* Stay at Madinah */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[#d4af37]"></div>
                  <h4 className="font-bold text-lg text-slate-900 mb-2">
                    DURING STAY AT MADINAH <span className="text-xs text-slate-500 font-normal">- 5 Star Hotel Dar Al Eman Intercontinental (Breakfast &amp; Dinner).</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><strong className="text-slate-800 font-semibold">27 Dhul Qadah:</strong> Check in at Madinah hotel and spend time in Prophet's Mosque</li>
                    <li><strong className="text-slate-800 font-semibold">28 Dhul Qadah:</strong> Spend time in Haram</li>
                    <li><strong className="text-slate-800 font-semibold">29 Dhul Qadah:</strong> Leave for Ziarat in Madinah at 08:00 AM</li>
                    <li><strong className="text-slate-800 font-semibold">01 Dhul Hajjah:</strong> Perform Friday prayer and leave for Makkah by air-conditioned coach</li>
                  </ul>
                </div>

                {/* Stay at Makkah */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[#d4af37]"></div>
                  <h4 className="font-bold text-lg text-slate-900 mb-2">
                    DURING STAY AT MAKKAH <span className="text-xs text-slate-500 font-normal">- 5 Star Hotel Fairmont (Breakfast &amp; Dinner).</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><strong className="text-slate-800 font-semibold">01 Dhul Hajjah:</strong> Check in at Makkah hotel and then leave to perform Umrah.</li>
                    <li><strong className="text-slate-800 font-semibold">02 Dhul Hajjah:</strong> Spend time in Haram.</li>
                    <li><strong className="text-slate-800 font-semibold">03 Dhul Hajjah:</strong> Leave for Ziarat in Madinah at 08:00 am.</li>
                    <li><strong className="text-slate-800 font-semibold">04 Dhul Hajjah:</strong> Checkout from Makkah and leave for Aziziya Hotel - Makkah</li>
                  </ul>
                </div>

                {/* Stay at Aziziya */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[#d4af37]"></div>
                  <h4 className="font-bold text-lg text-slate-900 mb-2">
                    DURING STAY AT AZIZIYA <span className="text-xs text-slate-500 font-normal">- Hotel - (Full Board)</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><strong className="text-slate-800 font-semibold">04 Dhul Hajjah to 07 Dhul Hajjah</strong></li>
                  </ul>
                </div>

                {/* Stay at Mina */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[#d4af37]"></div>
                  <h4 className="font-bold text-lg text-slate-900 mb-2">
                    DURING STAY AT MINA <span className="text-xs text-slate-500 font-normal">- Maktab-A-Category (Full Board)</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><strong className="text-slate-800 font-semibold">07 – 12 Dhul Hajjah:</strong> at Mina/Arafaat/Muzalfa</li>
                  </ul>
                </div>

                {/* Stay at Aziziya After */}
                <div className="relative">
                  <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-white border-4 border-[#d4af37]"></div>
                  <h4 className="font-bold text-lg text-slate-900 mb-2">
                    DURING STAY AT AZIZIYA <span className="text-xs text-slate-500 font-normal">- Hotel - (Full Board)</span>
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li><strong className="text-slate-800 font-semibold">12 to 14 Dhul Hajjah</strong></li>
                    <li><strong className="text-slate-800 font-semibold">14 Dhul Hajjah:</strong> Check out from Aziziya and leave for Jeddah airport for departure to Toronto.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Highlights & Eligibility */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Highlights &amp; Eligibility</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="text-emerald-800 font-bold text-lg mb-4 flex items-center gap-2">
                    ⭐ Package Highlights
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="font-semibold text-slate-900">✦ Group Will Be Led By a Qualified Imam</li>
                    <li>✦ Free Complete Ahram Kit Provided To Pilgrims</li>
                    <li>✦ Before Departure we offer Seminar with Dinner &amp; Hajj under the Imam Guidance</li>
                    <li>✦ Flexible Dates are Available</li>
                    <li className="text-red-600 font-semibold">✕ Qurbani Not Included</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="text-emerald-800 font-bold text-lg mb-4 flex items-center gap-2">
                    📋 Eligibility Requirements
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>✦ Canadian &amp; U.S. citizens with Pakistani Passports.</li>
                    <li>✦ Pakistani Passport holders with Canadian PR or American Green Cards.</li>
                    <li>✦ All Foreign Passport holders with Pakistan Passports.</li>
                    <li>✦ Side trips to Pakistan or any other destination available with an additional cost.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Important Booking Note */}
            <div className="bg-amber-50/60 border-l-4 border-[#d4af37] p-6 rounded-xl space-y-2">
              <b className="flex items-center gap-2 text-slate-900 font-bold">
                <i className="fa-solid fa-file-shield text-[#d4af37]"></i> Important Booking
              </b>
              <p className="text-sm text-slate-700 leading-relaxed">
                To secure your Hajj visa slot, please make sure your Canadian passport is valid for at least 6 months beyond travel dates, and you have completed all mandatory immunizations required by the Saudi Ministry of Hajj.
              </p>
            </div>

            {/* FAQs */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-3">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div
                    className="font-bold text-slate-900 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFaq(1)}
                  >
                    <span>Can I upgrade to double or triple occupancy?</span>
                    <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform ${openFaq === 1 ? "rotate-180" : ""}`}></i>
                  </div>
                  {openFaq === 1 && (
                    <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                      Yes, our packages are fully customizable. Double and triple rooms are available at modified rates. Please specify during reservation contact.
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                  <div
                    className="font-bold text-slate-900 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleFaq(2)}
                  >
                    <span>Are flights included in the CAD 17,995 price?</span>
                    <i className={`fa-solid fa-chevron-down text-slate-400 transition-transform ${openFaq === 2 ? "rotate-180" : ""}`}></i>
                  </div>
                  {openFaq === 2 && (
                    <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                      No, the base rate includes ground logistics, 5-star lodging, visa assistance, and internal transit. Our team can find custom flights departing from any major Canadian airport for you.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="text-xl font-extrabold text-emerald-900">King Travel</div>
                  <span className="text-xs text-slate-400">942 verified reviews</span>
                </div>
                <div className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-200">
                  4.4/5 <i className="fa-solid fa-star text-amber-500"></i>
                </div>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="startDate" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-800 bg-slate-50"
                  />
                </div>

                <div>
                  <label htmlFor="guests" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Number of Guests
                  </label>
                  <select
                    id="guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-800 bg-slate-50"
                  >
                    <option value="1">1 Guest (Quad Occupancy)</option>
                    <option value="2">2 Guests (Standard)</option>
                    <option value="3">3 Guests (Triple Occupancy)</option>
                    <option value="4">4 Guests (Quad Occupancy)</option>
                  </select>
                </div>

                <hr className="border-slate-100" />

                <div className="flex justify-between items-center py-1">
                  <span className="text-sm text-slate-500 font-medium">Estimated Total</span>
                  <span className="text-2xl font-bold text-emerald-900">CAD {getEstimatedTotal()}</span>
                </div>

                <Link
                  href="/contact"
                  className="w-full bg-[#d4af37] hover:bg-gold-lt text-white font-bold py-4 px-6 rounded-xl shadow-md flex items-center justify-center gap-2 transition duration-200 text-center block"
                >
                  <span>Book Hajj 2027 Now</span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </Link>

                <p className="text-center text-[11px] text-slate-400 leading-relaxed">
                  *Hajj Packages are subject to Seat availability. Visa processing is included. Comprehensive medical insurance and Ihram Kit will be provided to all pilgrims upon arrival.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
