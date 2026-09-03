"use client";

import { useState, useEffect } from "react";
import { Calendar, TicketPercent, X } from "lucide-react";
import { submitPackageBookingEnquiryAction } from "@/actions/enquiryActions";
import { formatTravelMonth } from "@/lib/packageHelpers";

export default function PackageBookingModal({
  isOpen,
  onClose,
  pkg,
}: {
  isOpen: boolean;
  onClose: () => void;
  pkg: any;
}) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+1 ");
  const [email, setEmail] = useState("");
  const [adults, setAdults] = useState("1");
  const [childrenCount, setChildrenCount] = useState("0");
  const [infantsCount, setInfantsCount] = useState("0");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPackageType, setSelectedPackageType] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalRef, setModalRef] = useState("");

  let cd = pkg?.cardData || {};
  if (typeof cd === "string") {
    try {
      cd = JSON.parse(cd);
    } catch (e) {
      cd = {};
    }
  }

  let detailData = pkg?.detailPageData || {};
  if (typeof detailData === "string") {
    try {
      detailData = JSON.parse(detailData);
    } catch (e) {
      detailData = {};
    }
  }

  const packagePrices: { packageType: string; price: number }[] = (() => {
    if (!pkg) return [];
    const rawList =
      cd?.packagePrices ||
      detailData?.packagePrices ||
      pkg?.packagePrices ||
      (Array.isArray(pkg?.prices)
        ? pkg.prices.map((p: any) => ({
          packageType:
            p.occupancyType === 'quad'
              ? 'Quad Occupancy'
              : p.occupancyType === 'triple'
                ? 'Triple Occupancy'
                : p.occupancyType === 'double'
                  ? 'Double Occupancy'
                  : p.occupancyType === 'single'
                    ? 'Single Occupancy'
                    : p.notes || 'Package Type',
          price: Number(p.amount) || 0,
        }))
        : null);

    if (Array.isArray(rawList) && rawList.length > 0) {
      return rawList
        .map((item: any) => ({
          packageType: (typeof item === 'object' ? item.packageType || item.type || '' : '').trim(),
          price: Number(String(typeof item === 'object' ? item.price || item.amount || 0 : item).replace(/[^0-9.]/g, '')) || 0,
        }))
        .filter((item: any) => item.packageType && item.price > 0);
    }

    const legacyBase = Number(String(pkg?.startingPrice ?? pkg?.price ?? '2795').replace(/[^0-9.]/g, '')) || 2795;
    return [
      { packageType: 'Quad Occupancy', price: legacyBase },
      { packageType: 'Triple Occupancy', price: legacyBase + 400 },
      { packageType: 'Double Occupancy', price: legacyBase + 800 },
    ];
  })();

  // Find the minimum priced package type deterministically
  const minPriceItem = packagePrices.length > 0
    ? packagePrices.reduce((min, curr) => (curr.price < min.price ? curr : min), packagePrices[0])
    : null;

  // Default selected package type is the minimum priced package (or single price if only 1)
  useEffect(() => {
    if (packagePrices.length > 0 && !selectedPackageType) {
      setSelectedPackageType(minPriceItem ? minPriceItem.packageType : packagePrices[0].packageType);
    }
  }, [packagePrices, selectedPackageType, minPriceItem]);

  if (!isOpen) return null;

  const effectivePackageType = selectedPackageType || (minPriceItem ? minPriceItem.packageType : (packagePrices[0]?.packageType || ""));
  const selectedPriceItem = packagePrices.find((p) => p.packageType === effectivePackageType);
  const selectedPackagePrice = selectedPriceItem ? selectedPriceItem.price : null;
  const estimatedTotalFormatted = selectedPackagePrice !== null
    ? selectedPackagePrice.toLocaleString("en-CA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    : null;

  const currencyCode = cd.currencyCode || "£";
  const badgeTag = cd.badgeTag || "Package";

  const isHajj =
    pkg?.type === "hajj" ||
    /hajj/i.test(pkg?.title || "") ||
    /hajj/i.test(badgeTag);

  const todayDateStr = new Date().toISOString().split("T")[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: boolean } = {};

    if (!fullName.trim()) {
      newErrors.fullName = true;
    }

    if (!phone.trim()) {
      newErrors.phone = true;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = true;
    }

    if (packagePrices.length > 0 && !effectivePackageType) {
      newErrors.selectedPackageType = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setBookingStatus("Submitting Booking...");

    try {
      const res = await submitPackageBookingEnquiryAction({
        packageId: pkg?.id
          ? parseInt(pkg.id, 10) || undefined
          : undefined,

        packageName: pkg?.title || "Umrah Package",
        packageType: effectivePackageType || undefined,

        fullName,
        phone,
        email,

        adults: parseInt(adults, 10),
        children: parseInt(childrenCount, 10),
        infants: parseInt(infantsCount, 10),

        startDate: selectedDate,

        totalPrice: estimatedTotalFormatted ? `${currencyCode} ${estimatedTotalFormatted}` : String(pkg?.startingPrice ?? pkg?.price ?? "7,499"),
      });

      if (res.success) {
        const msg =
          res.message ||
          "Thank you! Your package booking request has been received. Our team will contact you shortly.";

        setModalMsg(msg);

        if (res.bookingNumber) {
          setModalRef(res.bookingNumber);
        }

        /*
         * Success:
         * Hide booking form and show confirmation card.
         */
        setModalOpen(true);

        setBookingStatus(null);

        setFullName("");
        setEmail("");
        setSelectedDate("");
      } else {
        setBookingStatus(
          res.error || "Submission failed."
        );
      }
    } catch {
      setBookingStatus(
        "Failed to submit booking."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex justify-center items-center p-4 sm:p-6 md:p-8 py-6 sm:py-8 md:py-10 bg-black/60 backdrop-blur-sm overflow-y-auto">

      {/* =========================================================
          BOOKING FORM

          Keep the existing booking form exactly the same.

          It is visible normally and hidden only after
          successful submission.
      ========================================================== */}

      {!modalOpen && (
        <div className="bg-white max-h-[80vh] sm:max-h-[84vh] overflow-hidden rounded-3xl w-full max-w-[440px] shadow-2xl relative flex flex-col my-auto shrink-0 animate-in fade-in zoom-in-95 duration-200">

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md cursor-pointer border-none"
            aria-label="Close booking modal"
          >
            <X className="w-4 h-4" />
          </button>


          {/* Modal Content with Custom Scrolling */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1">

            {/* Modal Heading */}
            <div className="text-center mb-5 px-4 sm:px-6 pt-3">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-primary mb-1.5 leading-tight">
                Book {pkg?.title || "Umrah Package"}
                {pkg?.month ? ` - ${formatTravelMonth(pkg.month) || pkg.month}` : ""}
              </h3>

              <p className="text-slate-500 text-xs">
                Please fill out the form below to initiate your
                booking inquiry.
              </p>
            </div>


            {/* Booking Form */}
            <form
              onSubmit={handleBookingSubmit}
              noValidate
              className="space-y-3"
            >

              {/* Submission Status */}
              {bookingStatus && (
                <p className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center">
                  {bookingStatus}
                </p>
              )}


              {/* =====================================================
                  FULL NAME
              ====================================================== */}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);

                    if (errors.fullName) {
                      setErrors((prev) => ({
                        ...prev,
                        fullName: false,
                      }));
                    }
                  }}
                  className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                    }`}
                />

                {errors.fullName && (
                  <span className="text-[10px] font-bold text-red-600 mt-1 block">
                    Please fill out this field.
                  </span>
                )}
              </div>


              {/* =====================================================
                  PHONE + EMAIL
              ====================================================== */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value;
                      const startsWithPlus = val.startsWith("+");
                      const digits = val.replace(/[^0-9]/g, "");
                      val = (startsWithPlus ? "+" : "") + digits;
                      if (val.length > 11) val = val.slice(0, 11);
                      setPhone(val);

                      if (errors.phone) {
                        setErrors((prev) => ({
                          ...prev,
                          phone: false,
                        }));
                      }
                    }}
                    className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  />

                  {errors.phone && (
                    <span className="text-[10px] font-bold text-red-600 mt-1 block">
                      Please fill out this field.
                    </span>
                  )}
                </div>


                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>

                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (errors.email) {
                        setErrors((prev) => ({
                          ...prev,
                          email: false,
                        }));
                      }
                    }}
                    className={`cursor-pointer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  />

                  {errors.email && (
                    <span className="text-[10px] font-bold text-red-600 mt-1 block">
                      Please fill out this field.
                    </span>
                  )}
                </div>

              </div>


              {/* =====================================================
                  ADULTS / CHILDREN / INFANTS
              ====================================================== */}

              <div className="grid grid-cols-3 gap-2">

                {/* Adults */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
                    Adults
                  </label>

                  <select
                    value={adults}
                    onChange={(e) =>
                      setAdults(e.target.value)
                    }
                    className={`cursor-pointer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6+">6+</option>
                  </select>
                </div>


                {/* Children */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
                    Children
                  </label>

                  <select
                    value={childrenCount}
                    onChange={(e) =>
                      setChildrenCount(e.target.value)
                    }
                    className={`cursor-pointer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>


                {/* Infants */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
                    Infants
                  </label>

                  <select
                    value={infantsCount}
                    onChange={(e) =>
                      setInfantsCount(e.target.value)
                    }
                    className={`cursor-pointer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                      }`}
                  >
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4+">4+</option>
                  </select>
                </div>

              </div>


              {/* =====================================================
                  START DATE (Only for Umrah packages)
              ====================================================== */}

              {!isHajj && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Start Date
                  </label>

                  <div className="relative">

                    {/* Visible date display */}
                    <div
                      className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.2rem_center] bg-no-repeat flex items-center justify-between ${errors.selectedDate ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                        }`}
                    >
                      <span
                        className={
                          selectedDate
                            ? "text-slate-900"
                            : "text-slate-400"
                        }
                      >
                        {selectedDate
                          ? (() => {
                            const [
                              year,
                              month,
                              day,
                            ] = selectedDate.split("-");

                            return new Date(
                              Number(year),
                              Number(month) - 1,
                              Number(day)
                            ).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "2-digit",
                                year: "numeric",
                              }
                            );
                          })()
                          : "e.g. March 25, 2025"}
                      </span>

                      <Calendar className="w-4 h-4 text-slate-400" />
                    </div>


                    {/* Native Date Input */}
                    <input
                      type="date"
                      min={todayDateStr}
                      value={selectedDate}
                      onClick={(e) => {
                        try {
                          (e.target as HTMLInputElement).showPicker?.();
                        } catch { }
                      }}
                      onChange={(e) => {
                        setSelectedDate(
                          e.target.value
                        );

                        if (errors.selectedDate) {
                          setErrors((prev) => ({
                            ...prev,
                            selectedDate: false,
                          }));
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                  </div>

                  {errors.selectedDate && (
                    <span className="text-[10px] font-bold text-red-600 mt-1 block">
                      Please select a valid start date.
                    </span>
                  )}
                </div>
              )}


              {/* =====================================================
                  PACKAGE TYPE (only if 2 or more package types)
              ====================================================== */}

              {packagePrices.length > 1 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Package Type
                  </label>

                  <div className="relative">
                    <select
                      value={effectivePackageType}
                      onChange={(e) => {
                        setSelectedPackageType(e.target.value);
                        if (errors.selectedPackageType) {
                          setErrors((prev) => ({
                            ...prev,
                            selectedPackageType: false,
                          }));
                        }
                      }}
                      className={`w-full border border-line p-3 pr-9 rounded-sm bg-white outline-none focus:border-gold transition-colors text-ink text-sm font-medium appearance-none cursor-pointer ${errors.selectedPackageType
                        ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600"
                        : "focus:border-emerald-800"
                        }`}
                    >
                      {packagePrices.map((item, idx) => (
                        <option key={idx} value={item.packageType} className="bg-white text-ink">
                          £ {item.price ? item.price.toLocaleString("en-CA") : ""} - {item.packageType}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>

                  {errors.selectedPackageType && (
                    <span className="text-[10px] font-bold text-red-600 mt-1 block">
                      Please select a package type.
                    </span>
                  )}
                </div>
              )}


              {/* =====================================================
                  ESTIMATED TOTAL
              ====================================================== */}

              <div className="pt-2 flex justify-between items-center">

                <span className="text-xs font-bold text-slate-700">
                  Estimated Total
                </span>

                <span className="text-xl font-black text-primary font-serif">
                  {estimatedTotalFormatted ? `${currencyCode} ${estimatedTotalFormatted}` : "—"}
                </span>

              </div>


              {/* =====================================================
                  SUBMIT BUTTON
              ====================================================== */}

              <button
                type="submit"
                className="w-full bg-gold text-white font-extrabold py-3.5 px-6 rounded-sm shadow-md hover:bg-gold-lt hover:text-white active:scale-[0.99] transition-all duration-300 tracking-wider uppercase text-sm flex items-center justify-center cursor-pointer"
              >
                <TicketPercent className="w-4 h-4 mr-2" />

                <span>
                  Book {badgeTag}
                </span>
              </button>


              {/* Package Disclaimer */}
              <p className="text-[10px] text-slate-600 text-center leading-normal pt-1">
                *Hajj & Umrah Packages are subject to seat
                availability. Visa processing is included.
                Comprehensive medical insurance and Ahram Kit
                provided upon arrival.
              </p>

            </form>

          </div>
        </div>
      )}


      {/* =========================================================
          SUCCESS CONFIRMATION

          The original booking card above disappears.

          This success card takes its place while keeping
          max-width 420px instead of becoming fullscreen.
      ========================================================== */}

      {modalOpen && (
        <div className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300 my-auto shrink-0">

          {/* Success Check Icon */}
          <div className="w-16 h-16 bg-emerald-100 text-primary rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>


          {/* Success Heading */}
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            Booking Received!
          </h3>


          {/* Success Message */}
          <p className="text-slate-600 mb-6">
            {modalMsg}
          </p>


          {/* Reference Number */}
          {modalRef && (
            <div className="bg-primary/10 p-4 rounded-xl mb-6 w-full">

              <span className="text-xs font-bold text-slate-600 block mb-1">
                Reference Number
              </span>

              <span className="text-lg font-mono font-black text-slate-900">
                {modalRef}
              </span>

            </div>
          )}


          {/* Done Button */}
          <button
            type="button"
            onClick={() => {
              /*
               * Reset success state first.
               * This ensures the booking form appears normally
               * the next time the modal is opened.
               */
              setModalOpen(false);
              setModalMsg("");
              setModalRef("");

              /*
               * Close PackageBookingModal.
               */
              onClose();
            }}
            className="bg-[#004B39] hover:bg-[#003c2e] text-white font-bold py-3 px-8 rounded-xl w-full transition-colors cursor-pointer"
          >
            Done
          </button>

        </div>
      )}

    </div>
  );
}