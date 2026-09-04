"use client";

import { useEffect, useState } from "react";
import { TicketPercent, Calendar } from "lucide-react";
import { submitPackageBookingEnquiryAction } from "@/actions/enquiryActions";
import { getPackagesByType } from "@/actions/packageActions";
import SubmissionSuccessModal from "@/components/SubmissionSuccessModal";

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatTravelMonth(value?: string | null): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const yyyymmMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (yyyymmMatch) {
    const year = parseInt(yyyymmMatch[1], 10);
    const monthIdx = parseInt(yyyymmMatch[2], 10) - 1;
    if (monthIdx >= 0 && monthIdx < 12) return `${MONTH_NAMES[monthIdx]} ${year}`;
  }
  const legacyMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})/);
  if (legacyMatch) {
    const foundIdx = MONTH_NAMES.findIndex(m => m.toLowerCase() === legacyMatch[1].toLowerCase());
    if (foundIdx !== -1) return `${MONTH_NAMES[foundIdx]} ${legacyMatch[2]}`;
  }
  return trimmed;
}

export default function BlogSidebarBookingForm({ blogTitle }: { blogTitle?: string }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [adults, setAdults] = useState("1");
  const [childrenCount, setChildrenCount] = useState("0");
  const [infantsCount, setInfantsCount] = useState("0");
  const [selectedPackageType, setSelectedPackageType] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");

  const [packageType, setPackageType] = useState<"hajj" | "umrah">("umrah");
  const [availablePackages, setAvailablePackages] = useState<any[]>([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [packagesLoading, setPackagesLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalRef, setModalRef] = useState("");

  const [errors, setErrors] = useState({
    fullName: false,
    phone: false,
    email: false,
    selectedPackage: false,
    selectedPackageType: false,
    selectedDate: false,
  });

  useEffect(() => {
    let cancelled = false;

    setPackagesLoading(true);
    setSelectedPackageId("");

    getPackagesByType(packageType)
      .then((rows) => {
        if (cancelled) return;

        // Only packages that are currently available can be selected.
        const available = (rows || []).filter(
          (pkg: any) => pkg.status === "available"
        );

        setAvailablePackages(available);
      })
      .catch(() => {
        if (!cancelled) setAvailablePackages([]);
      })
      .finally(() => {
        if (!cancelled) setPackagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [packageType]);

  const selectedPackage = availablePackages.find(
    (pkg: any) => String(pkg.id) === selectedPackageId
  );

  const packagePrices: { packageType: string; price: number }[] = (() => {
    if (!selectedPackage) return [];

    let cd = selectedPackage.cardData;
    if (typeof cd === "string") {
      try {
        cd = JSON.parse(cd);
      } catch {
        cd = {};
      }
    }

    let detailData = selectedPackage.detailPageData;
    if (typeof detailData === "string") {
      try {
        detailData = JSON.parse(detailData);
      } catch {
        detailData = {};
      }
    }

    const rawList =
      cd?.packagePrices ||
      detailData?.packagePrices ||
      selectedPackage.packagePrices ||
      (Array.isArray(selectedPackage.prices)
        ? selectedPackage.prices.map((p: any) => ({
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

    const legacyBase = Number(String(selectedPackage.startingPrice ?? selectedPackage.price ?? '2795').replace(/[^0-9.]/g, '')) || 2795;
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

  const effectivePackageType = selectedPackageType || (minPriceItem ? minPriceItem.packageType : (packagePrices[0]?.packageType || ""));

  const todayDateStr = new Date().toISOString().split("T")[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedPackage = availablePackages.find(
      (pkg: any) => String(pkg.id) === selectedPackageId
    );

    // Validate
    const newErrors = {
      fullName: !fullName.trim(),
      phone: !phone.trim(),
      email: !email.trim(),
      selectedPackage: !selectedPackageId,
      selectedPackageType: packagePrices.length > 0 && !effectivePackageType,
      selectedDate: !selectedDate.trim(),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((isErr) => isErr)) {
      setBookingStatus("Please fill out all required fields correctly.");
      return;
    }

    setBookingStatus("Submitting your inquiry...");

    const selectedPriceItem = packagePrices.find((p) => p.packageType === effectivePackageType);
    const formattedTotalPrice = selectedPriceItem ? `£ ${selectedPriceItem.price.toLocaleString("en-CA")}` : "";

    const basePackageName = selectedPackage?.title || `${packageType === "hajj" ? "Hajj" : "Umrah"} Package`;
    const travelMonthSuffix = packageType === "umrah" && selectedPackage?.month
      ? ` - ${formatTravelMonth(selectedPackage.month)}`
      : "";
    const packageName = `${basePackageName}${travelMonthSuffix}`;

    const res = await submitPackageBookingEnquiryAction({
      packageId: Number(selectedPackageId),
      packageName,
      packageType: effectivePackageType || undefined,
      fullName,
      phone,
      email,
      adults: parseInt(adults, 10),
      children: parseInt(childrenCount, 10),
      infants: parseInt(infantsCount, 10),
      startDate: selectedDate,
      totalPrice: formattedTotalPrice,
    });

    if (res.success) {
      setBookingStatus("");
      setFullName("");
      setPhone("");
      setEmail("");
      setAdults("1");
      setChildrenCount("0");
      setInfantsCount("0");
      setSelectedPackageId("");
      setSelectedPackageType("");
      setSelectedDate("");

      setModalMsg(res.message || "Your inquiry has been submitted.");
      setModalRef(res.bookingNumber || "");
      setModalOpen(true);
    } else {
      setBookingStatus(res.error || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
      <span className="text-xl text-primary font-extrabold mb-4">Plan Your Journey</span>

      <form onSubmit={handleBookingSubmit} noValidate className="space-y-4">
        {bookingStatus && (
          <p className="text-xs font-bold text-gray-800 bg-emerald-50 border border-gray-200 p-2.5 rounded-xl text-center">
            {bookingStatus}
          </p>
        )}

        {/* Full Name */}
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
              if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: false }));
            }}
            className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
              }`}
          />
          {errors.fullName && (
            <span className="text-[10px] font-bold text-red-600 mt-1 block">Please fill out this field.</span>
          )}
        </div>

        {/* Phone Number & Email Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
              }}
              className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                }`}
            />
            {errors.phone && (
              <span className="text-[10px] font-bold text-red-600 mt-1 block">Please fill out this field.</span>
            )}
          </div>
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
                if (errors.email) setErrors((prev) => ({ ...prev, email: false }));
              }}
              className={`w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                }`}
            />
            {errors.email && (
              <span className="text-[10px] font-bold text-red-600 mt-1 block">Please fill out this field.</span>
            )}
          </div>
        </div>

        {/* Hajj / Umrah Package Selection */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Journey Type
            </label>

            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setPackageType("hajj");
                  setSelectedPackageId("");
                  setSelectedPackageType("");
                  if (errors.selectedPackage) {
                    setErrors((prev) => ({ ...prev, selectedPackage: false }));
                  }
                }}
                className={`py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${packageType === "hajj"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-800"
                  }`}
              >
                Hajj
              </button>

              <button
                type="button"
                onClick={() => {
                  setPackageType("umrah");
                  setSelectedPackageId("");
                  setSelectedPackageType("");
                  if (errors.selectedPackage) {
                    setErrors((prev) => ({ ...prev, selectedPackage: false }));
                  }
                }}
                className={`py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${packageType === "umrah"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-transparent text-slate-500 hover:text-slate-800"
                  }`}
              >
                Umrah
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select {packageType === "hajj" ? "Hajj" : "Umrah"} Package
            </label>

            <select
              value={selectedPackageId}
              disabled={packagesLoading}
              suppressHydrationWarning
              onChange={(e) => {
                setSelectedPackageId(e.target.value);
                setSelectedPackageType("");
                if (errors.selectedPackage) {
                  setErrors((prev) => ({ ...prev, selectedPackage: false }));
                }
              }}
              className={`cursor-pointer w-full border border-line p-2 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat ${errors.fullName ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                }`}
            >
              <option value="">
                {packagesLoading
                  ? "Loading packages..."
                  : availablePackages.length === 0
                    ? `No available ${packageType === "hajj" ? "Hajj" : "Umrah"} packages`
                    : `Select a ${packageType === "hajj" ? "Hajj" : "Umrah"} package`}
              </option>

              {availablePackages.map((pkg: any) => {
                const travelMonth = packageType === 'umrah' && pkg.month ? formatTravelMonth(pkg.month) : null;
                const label = travelMonth
                  ? `${pkg.title} - ${travelMonth}`
                  : pkg.title;
                return (
                  <option key={pkg.id} value={String(pkg.id)}>
                    {label}
                  </option>
                );
              })}
            </select>

            {errors.selectedPackage && (
              <span className="text-[10px] font-bold text-red-600 mt-1 block">
                Please select a package.
              </span>
            )}
          </div>
        </div>

        {/* Adults, Children, Infants Dropdowns */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
              Adults
            </label>
            <select
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
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
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
              Children
            </label>
            <select
              value={childrenCount}
              onChange={(e) => setChildrenCount(e.target.value)}
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
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 text-start">
              Infants
            </label>
            <select
              value={infantsCount}
              onChange={(e) => setInfantsCount(e.target.value)}
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

        {/* Start Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Select Start Date
          </label>
          <div className="relative">
            <div
              className={`cursor-pointer w-full border border-line p-3 pr-3 rounded-sm bg-slate-50 outline-none focus:border-gold transition-colors text-[#111111] text-sm font-medium appearance-none bg-[length:1.25rem] bg-[right_0.5rem_center] bg-no-repeat flex items-center justify-between ${errors.selectedDate ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
                }`}
            >
              <span className={selectedDate ? "text-slate-900" : "text-slate-400"}>
                {selectedDate
                  ? (() => {
                    const [year, month, day] = selectedDate.split('-');
                    return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
                  })()
                  : "e.g. March 25, 2025"}
              </span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
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
                setSelectedDate(e.target.value);
                if (errors.selectedDate) setErrors((prev) => ({ ...prev, selectedDate: false }));
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {errors.selectedDate && (
            <span className="text-[10px] font-bold text-red-600 mt-1 block">Please select a valid start date.</span>
          )}
        </div>

        {/* Package Type Dropdown (only if 2 or more package types) */}
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
                  if (errors.selectedPackageType) setErrors((prev) => ({ ...prev, selectedPackageType: false }));
                }}
                className={`cursor-pointer w-full border border-line p-3 pr-9 rounded-sm bg-white outline-none focus:border-gold transition-colors text-ink text-sm font-medium appearance-none ${
                  errors.selectedPackageType ? "border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600" : "focus:border-emerald-800"
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
              <span className="text-[10px] font-bold text-red-600 mt-1 block">Please select a package type.</span>
            )}
          </div>
        )}

        {/* Submit CTA Button */}
        <button
          type="submit"
          className="w-full bg-gold text-white font-extrabold py-3.5 px-6 rounded-sm shadow-md hover:text-white hover:bg-gold-lt active:scale-[0.99] transition-all duration-300 tracking-wider uppercase text-sm flex items-center justify-center cursor-pointer"
        >
          <TicketPercent className="w-4 h-4 mr-2" />
          <span>Submit Inquiry</span>
        </button>

        <p className="text-[10px] text-slate-600 text-center leading-normal pt-1">
          *Subject to availability. Visa processing is included in our packages.
        </p>
      </form>

      <SubmissionSuccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMsg}
        referenceNumber={modalRef}
      />
    </div>
  );
}