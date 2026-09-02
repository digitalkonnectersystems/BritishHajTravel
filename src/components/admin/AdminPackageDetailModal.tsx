"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, HelpCircle, Star, Check, AlertCircle, FileText, Globe, Tag, DollarSign, Clock } from "lucide-react";

interface AdminPackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: any;
  onSave: (updatedPkg: any) => void;
}

export default function AdminPackageDetailModal({
  isOpen,
  onClose,
  pkg,
  onSave,
}: AdminPackageDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "highlights" | "notices" | "faqs">("overview");

  // Local form states
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [exclusiveBadge, setExclusiveBadge] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [durationText, setDurationText] = useState("");
  const [overview, setOverview] = useState("");
  const [highlights, setHighlights] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [importantNotice, setImportantNotice] = useState("");
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>([]);

  useEffect(() => {
    if (pkg) {
      setDeparture(pkg.departure || "CANADA");
      setDestination(pkg.destination || "SAUDIA");
      setExclusiveBadge(pkg.exclusiveBadge || "EXCLUSIVE PACKAGE");
      setCurrencyCode(pkg.currencyCode || "CAD");
      setDurationText(pkg.durationText || `${pkg.duration || "14 DAYS"} / 13 NIGHTS`);
      setOverview(
        pkg.overview ||
        `DURING STAY AT MADINAH - Hotel close to Haram (Breakfast & Dinner)
01 Dhul-Hajjah Check in at Madinah hotel and spend time in Prophet's Mosque
02 Dhul-Hajjah Spend time in Haram
03 Dhul-Hajjah Leave for Ziarat in Madinah at 08:00 am
04 Dhul-Hajjah Check out from Madinah and Leave for Makkah Aziziya by air-conditioned coach

DURING STAY AT AZIZIYA - Hotel (Full Board)
04 - 07 Dhul-Hajjah Stay at Aziziya Accommodation.

DURING STAY AT MINA - Near Jamarat Maktab-A-Category (Full Board)
07 - 12 Dhul-Hajjah Rituals at Mina / Arafat / Muzalfa.

DURING STAY AT AZIZIYA - Hotel - Maktab-A-Category (Full Board)
12 to 14 Dhul-Hajjah Stay and preparation for departure.
14 Dhul-Hajjah Check out from Aziziya and leave for Jeddah airport for departure to Toronto.`
      );
      setHighlights(
        pkg.highlights ||
        `Group Will Be Led By A Qualified Imam
Free Complete Ahram Kit Provided To Pilgrims
Before Departure we offer Seminar with Dinner & Hajj under the Imam Guidance
Flexible Dates are Available
Qurbani Not Included`
      );
      setEligibility(
        pkg.eligibility ||
        `Canadian & U.S. citizens with Pakistan Passports.
Pakistani Passport holders with Canadian PR or American Green Cards.
All Foreign Passport holders with Pakistan Passports.
Side trips to Pakistan or any other destination available with an additional cost.`
      );
      setImportantNotice(
        pkg.importantNotice ||
        "To secure your Hajj visa slot, please make sure your Canadian passport is valid for at least 6 months beyond travel dates, and you have completed all mandatory immunizations required by the Saudi Ministry of Hajj."
      );
      setFaqs(
        pkg.faqs && pkg.faqs.length > 0
          ? pkg.faqs
          : [
            {
              question: "Can I upgrade to double or triple occupancy?",
              answer:
                "Yes! Upgrades to Double or Triple occupancy are available upon request during booking.",
            },
            {
              question: "Are flights included in the CAD 12,995 price?",
              answer:
                "Yes, round-trip flights from Canada to Saudi Arabia are fully included in the package pricing.",
            },
          ]
      );
    }
  }, [pkg, isOpen]);

  if (!isOpen || !pkg) return null;

  const handleSave = () => {
    const updated = {
      ...pkg,
      departure,
      destination,
      exclusiveBadge,
      currencyCode,
      durationText,
      overview,
      highlights,
      eligibility,
      importantNotice,
      faqs,
    };
    onSave(updated);
    onClose();
  };

  const addFaqItem = () => {
    setFaqs([...faqs, { question: "New FAQ Question?", answer: "Enter answer here..." }]);
  };

  const updateFaq = (idx: number, field: "question" | "answer", val: string) => {
    const updated = [...faqs];
    updated[idx] = { ...updated[idx], [field]: val };
    setFaqs(updated);
  };

  const removeFaq = (idx: number) => {
    const updated = [...faqs];
    updated.splice(idx, 1);
    setFaqs(updated);
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-sm flex justify-center items-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-primary text-white p-5 flex justify-between items-center">
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-gold">
              ADMIN CMS PACKAGE DETAIL PAGE EDITOR (POPUP)
            </div>
            <h2 className="text-xl font-bold font-serif text-white mt-0.5">
              Detail Page for: <span className="underline text-gold">{pkg.title || "Untitled Package"}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors cursor-pointer"
            title="Close Popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 pt-3 flex gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer ${activeTab === "overview"
              ? "bg-white text-primary border-t-2 border-primary shadow-sm font-extrabold"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <FileText className="w-4 h-4" /> Header, Overview & Routes
          </button>

          <button
            onClick={() => setActiveTab("highlights")}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer ${activeTab === "highlights"
              ? "bg-white text-primary border-t-2 border-primary shadow-sm font-extrabold"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <Star className="w-4 h-4 text-amber-500" /> Highlights & Eligibility
          </button>

          <button
            onClick={() => setActiveTab("notices")}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer ${activeTab === "notices"
              ? "bg-white text-primary border-t-2 border-primary shadow-sm font-extrabold"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <AlertCircle className="w-4 h-4 text-amber-600" /> Booking Notice
          </button>

          <button
            onClick={() => setActiveTab("faqs")}
            className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-1.5 cursor-pointer ${activeTab === "faqs"
              ? "bg-white text-primary border-t-2 border-primary shadow-sm font-extrabold"
              : "text-slate-600 hover:text-slate-900"
              }`}
          >
            <HelpCircle className="w-4 h-4 text-blue-600" /> FAQs ({faqs.length})
          </button>
        </div>

        {/* Modal Tab Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50 space-y-6">
          {/* TAB 1: HEADER, OVERVIEW & ROUTES */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Live Header Banner Preview Box */}
              <div className="bg-primary text-white p-5 rounded-2xl relative overflow-hidden shadow-lg border border-emerald-950">
                <div className="text-[9px] font-extrabold uppercase text-gold tracking-widest mb-1.5 flex items-center gap-1">
                  <span>✨ LIVE BANNER PREVIEW (TITLE AUTO-FETCHED FROM CARD)</span>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold font-serif text-white uppercase tracking-tight">
                      {pkg.title || "ECONOMY HAJJ PACKAGE 2027"}
                    </h3>
                    <p className="text-xs font-bold text-emerald-200 mt-1 uppercase tracking-wider">
                      DURATION: {durationText || `${pkg.duration || "14 DAYS"} / 13 NIGHTS`}
                    </p>
                    <div className="flex flex-wrap gap-3 text-[11px] font-bold text-emerald-100 mt-3">
                      <span>🛫 DEPARTURE: <strong className="text-white">{departure || "CANADA"}</strong></span>
                      <span>🛫 DESTINATION: <strong className="text-white">{destination || "SAUDIA"}</strong></span>
                    </div>
                  </div>

                  <div className="bg-[#00382B] border-2 border-dashed border-[#DB9E30] rounded-xl p-3 text-center min-w-[170px] shrink-0">
                    <span className="text-[9px] font-extrabold uppercase text-gold block">
                      {exclusiveBadge || "EXCLUSIVE PACKAGE"}
                    </span>
                    <div className="text-xl font-black text-white font-serif mt-0.5">
                      {currencyCode || "CAD"} {pkg.price || "12,995"}
                    </div>
                    <span className="text-[8px] font-semibold text-emerald-200 uppercase block mt-0.5">
                      {pkg.priceSubtext || "PER PERSON, QUAD OCCUPANCY"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    <Globe className="w-3 h-3 inline text-primary mr-1" /> DEPARTURE
                  </label>
                  <input
                    type="text"
                    value={departure}
                    onChange={(e) => setDeparture(e.target.value)}
                    placeholder="e.g. CANADA"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    <Globe className="w-3 h-3 inline text-primary mr-1" /> DESTINATION
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. SAUDIA"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-amber-700 mb-1">
                    <Tag className="w-3 h-3 inline text-amber-600 mr-1" /> EXCLUSIVE BADGE
                  </label>
                  <input
                    type="text"
                    value={exclusiveBadge}
                    onChange={(e) => setExclusiveBadge(e.target.value)}
                    placeholder="e.g. EXCLUSIVE PACKAGE"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    <DollarSign className="w-3 h-3 inline text-primary mr-1" /> CURRENCY CODE
                  </label>
                  <input
                    type="text"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value)}
                    placeholder="e.g. CAD"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  <Clock className="w-3 h-3 inline text-amber-600 mr-1" /> FULL DURATION SUBTITLE (HEADER)
                </label>
                <input
                  type="text"
                  value={durationText}
                  onChange={(e) => setDurationText(e.target.value)}
                  placeholder="e.g. 14 DAYS / 13 NIGHTS"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-800"
                />
              </div>

              {/* Multiline Overview Itinerary */}
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-primary mb-1">
                  📖 PACKAGE OVERVIEW (ITINERARY TIMELINE STEPS)
                </label>
                <p className="text-[10px] text-slate-500 mb-2">
                  Format headings with bold text or double line breaks to automatically separate itinerary blocks on the detail page.
                </p>
                <textarea
                  rows={8}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-800 leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: HIGHLIGHTS & ELIGIBILITY */}
          {activeTab === "highlights" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Highlights */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col">
                <label className="block text-xs font-bold text-amber-800 mb-1 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> PACKAGE HIGHLIGHTS (1 ITEM PER LINE)
                </label>
                <p className="text-[10px] text-slate-500 mb-2">
                  Each line becomes a star bullet point (✦). Add &quot;Not Included&quot; in a line to style it with a red ✕ icon.
                </p>
                <textarea
                  rows={9}
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 leading-relaxed flex-1 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Eligibility */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col">
                <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                  <Check className="w-4 h-4 text-primary" /> ELIGIBILITY REQUIREMENTS (1 ITEM PER LINE)
                </label>
                <p className="text-[10px] text-slate-500 mb-2">
                  Each line will be formatted into an eligibility requirement card item.
                </p>
                <textarea
                  rows={9}
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-800 leading-relaxed flex-1 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 3: BOOKING NOTICES */}
          {activeTab === "notices" && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-600" /> IMPORTANT BOOKING NOTICE ALERT BOX TEXT
              </label>
              <p className="text-[10px] text-slate-500">
                This notice is prominently displayed inside a golden highlight card under the Highlights section.
              </p>
              <textarea
                rows={4}
                value={importantNotice}
                onChange={(e) => setImportantNotice(e.target.value)}
                placeholder="To secure your visa slot..."
                className="w-full bg-amber-50/50 border border-amber-200 rounded-lg p-3 text-xs font-medium text-amber-900 leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* TAB 4: FREQUENTLY ASKED QUESTIONS */}
          {activeTab === "faqs" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 text-xs">Manage Package FAQs</h4>
                  <p className="text-[10px] text-slate-500">Add question & answer pairs for pilgrims.</p>
                </div>
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                </button>
              </div>

              <div className="space-y-3">
                {faqs.map((faq, fIdx) => (
                  <div key={fIdx} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 relative group">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[10px] font-extrabold text-blue-600 uppercase">
                        FAQ #{fIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFaq(fIdx)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">QUESTION</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFaq(fIdx, "question", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">ANSWER</label>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) => updateFaq(fIdx, "answer", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-4 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary hover:bg-[#00382B] text-white font-extrabold px-6 py-2.5 rounded-xl text-xs shadow-lg transition-all cursor-pointer"
          >
            Save & Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
