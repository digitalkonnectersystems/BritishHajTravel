"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { Eye, EyeOff, ImageIcon, MoveRight } from "lucide-react";
import { uploadFile } from "@/lib/uploadClient";

export type HomepageSideBanners = {
  hotelEyebrow: string;
  hotelTitle: string;
  hotelHighlight: string;
  hotelDescription: string;
  hotelImage: string;
  hotelVisible: boolean;
  hotelTags: string[];
  hotelButtonLabel: string;
  hotelButtonLink: string;
  flightsEyebrow: string;
  flightsTitle: string;
  flightsDescription: string;
  flightsImage: string;
  flightsVisible: boolean;
  flightsRouteFrom: string;
  flightsRouteTo: string;
  flightsButtonLabel: string;
  flightsButtonLink: string;
};

export const DEFAULT_HOMEPAGE_SIDE_BANNERS: HomepageSideBanners = {
  hotelEyebrow: "HOTEL BOOKING",
  hotelTitle: "Hotels in Makkah &",
  hotelHighlight: "Madinah",
  hotelDescription: "Rooms close to the Haram, at prices booked direct.",
  hotelImage: "/images_BHT/hotels/makkah-clock-tower-sunset.jpg",
  hotelVisible: true,
  hotelTags: ["Haram view", "3\u2605 - 5\u2605", "Family rooms"],
  hotelButtonLabel: "Book a Hotel",
  hotelButtonLink: "/hotels",
  flightsEyebrow: "FLIGHTS",
  flightsTitle: "Cheap Flights to Jeddah & Madinah",
  flightsDescription: "Direct and connecting fares from London, Manchester & Birmingham.",
  flightsImage: "/images_BHT/flights/british-airways-sunset.jpg",
  flightsVisible: true,
  flightsRouteFrom: "LHR",
  flightsRouteTo: "JED",
  flightsButtonLabel: "Search Flights",
  flightsButtonLink: "/flights",
};

export function readHomepageSideBanners(data: Record<string, unknown> | undefined): HomepageSideBanners {
  const defaults = DEFAULT_HOMEPAGE_SIDE_BANNERS;
  const result = { ...defaults, hotelTags: [...defaults.hotelTags] };
  if (!data) return result;

  (Object.keys(defaults) as (keyof HomepageSideBanners)[]).forEach((key) => {
    if (key === "hotelTags") return;
    const current = data[key];
    if (key === "hotelVisible" || key === "flightsVisible") {
      if (typeof current === "boolean") Object.assign(result, { [key]: current });
      return;
    }
    if (typeof current === "string") {
      (result as unknown as Record<string, string | string[]>)[key] = current;
    }
  });

  if (Array.isArray(data.hotelTags) && data.hotelTags.every((tag) => typeof tag === "string")) {
    result.hotelTags = data.hotelTags.slice(0, 3);
  }
  return result;
}

function TextField({ label, value, onChange, multiline = false }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-primary"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

function SideBannerPreview({ theme, value }: { theme: "hotel" | "flights"; value: HomepageSideBanners }) {
  const isFlight = theme === "flights";
  const eyebrow = isFlight ? value.flightsEyebrow : value.hotelEyebrow;
  const title = isFlight ? value.flightsTitle : value.hotelTitle;
  const description = isFlight ? value.flightsDescription : value.hotelDescription;
  const image = isFlight ? value.flightsImage : value.hotelImage;
  const isVisible = isFlight ? value.flightsVisible : value.hotelVisible;
  const buttonLabel = isFlight ? value.flightsButtonLabel : value.hotelButtonLabel;
  const tags = value.hotelTags.filter(Boolean);

  return (
    <div className="mx-auto flex h-[650px] w-full max-w-[320px] flex-col overflow-hidden bg-white">
      <div className={`relative flex h-full min-h-[360px] flex-col overflow-hidden px-6 pb-14 pt-6 text-white ${isFlight ? "bg-gradient-to-b from-[#A40918] via-[#890514] to-[#69020F]" : "bg-gradient-to-b from-[#101D83] via-[#0C1972] to-[#091460]"}`}>
        {!isVisible ? <div className="absolute right-3 top-3 z-20 rounded-full bg-slate-950/75 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Hidden on frontend</div> : null}
        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.42em] text-white/85">{eyebrow}</div>
          <h3 className="font-serif text-[34px] leading-[0.95]">
            {title}
            {!isFlight && value.hotelHighlight ? <span className="block text-red">{value.hotelHighlight}</span> : null}
          </h3>
          <p className="mt-4 max-w-[19rem] text-[15px] leading-6 text-white/90">{description}</p>
          {image ? (
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-2">
              <div className="relative h-[180px] overflow-hidden rounded-xl bg-white/5">
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          ) : (
            <div className="mt-5 flex h-[180px] items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/5 text-center text-sm text-white/45">
              No image selected
            </div>
          )}
          {isFlight ? (
            <div className="mt-auto pt-7">
              <div className="mb-6 flex items-center justify-between font-serif text-[32px] tracking-tight text-white">
                <span>{value.flightsRouteFrom}</span>
                <span className="mx-3 flex-1 border-t border-dashed border-white/40" />
                <span>{value.flightsRouteTo}</span>
              </div>
              <div className="inline-flex min-h-[58px] w-full items-center justify-center rounded-full bg-white px-6 text-center text-[15px] font-extrabold uppercase tracking-[0.12em] text-red">
                {buttonLabel} <MoveRight className="ml-2 h-5 w-5" />
              </div>
            </div>
          ) : (
            <>
              {tags.length > 0 ? (
                <div className="mt-auto flex flex-wrap gap-3 pt-7">
                  {tags.map((tag, index) => (
                    <span key={`${index}-${tag}`} className="inline-flex items-center rounded-full border border-white/55 px-4 py-2 text-sm font-semibold text-white/95">{tag}</span>
                  ))}
                </div>
              ) : null}
              <div className="mt-5 inline-flex min-h-[58px] w-full items-center justify-center rounded-full bg-white px-6 text-center text-[15px] font-extrabold uppercase tracking-[0.12em] text-primary">
                {buttonLabel} <MoveRight className="ml-2 h-5 w-5" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomepageSideBannerFields({ value, onChange }: {
  value: HomepageSideBanners;
  onChange: Dispatch<SetStateAction<HomepageSideBanners>>;
}) {
  const [uploading, setUploading] = useState<"hotel" | "flights" | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [imagePreview, setImagePreview] = useState<"hotel" | "flights" | null>(null);

  const update = <K extends keyof HomepageSideBanners>(key: K, next: HomepageSideBanners[K]) => {
    onChange((previous) => ({ ...previous, [key]: next }));
  };

  const uploadImage = async (kind: "hotel" | "flights", file?: File) => {
    if (!file) return;
    setUploadError("");
    setUploading(kind);
    try {
      const url = await uploadFile(file, "banners");
      if (url) {
        update(kind === "hotel" ? "hotelImage" : "flightsImage", url);
      } else {
        setUploadError("The image could not be uploaded. Please try again.");
      }
    } catch {
      setUploadError("The image could not be uploaded. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  return (
    <section className="border-t border-slate-100 pt-5">
      <h3 className="m-0 text-xs font-extrabold uppercase tracking-wider text-slate-800">Homepage Left &amp; Right Side Banners</h3>
      <p className="mb-5 mt-1 text-[11px] text-slate-500">Edit both side panels here. These settings are saved with the homepage hero section. The published layout and styling stay unchanged.</p>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="m-0 text-xs font-extrabold uppercase tracking-wider text-[#101D83]">Left Banner: Hotel Booking</h4>
          <button
            type="button"
            onClick={() => update("hotelVisible", !value.hotelVisible)}
            aria-pressed={value.hotelVisible}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${value.hotelVisible ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {value.hotelVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {value.hotelVisible ? "Shown on frontend" : "Hidden on frontend"}
          </button>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Eyebrow" value={value.hotelEyebrow} onChange={(next) => update("hotelEyebrow", next)} />
            <TextField label="Title (white text)" value={value.hotelTitle} onChange={(next) => update("hotelTitle", next)} />
            <TextField label="Title highlight (red text)" value={value.hotelHighlight} onChange={(next) => update("hotelHighlight", next)} />
            <TextField label="Button text" value={value.hotelButtonLabel} onChange={(next) => update("hotelButtonLabel", next)} />
          </div>
          <TextField label="Description" value={value.hotelDescription} onChange={(next) => update("hotelDescription", next)} multiline />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <TextField
                key={index}
                label={`Feature tag ${index + 1}`}
                value={value.hotelTags[index] || ""}
                onChange={(next) => onChange((previous) => {
                  const tags = [...previous.hotelTags];
                  while (tags.length < 3) tags.push("");
                  tags[index] = next;
                  return { ...previous, hotelTags: tags };
                })}
              />
            ))}
          </div>
          <TextField label="Button link" value={value.hotelButtonLink} onChange={(next) => update("hotelButtonLink", next)} />
          <TextField label="Image URL" value={value.hotelImage} onChange={(next) => update("hotelImage", next)} />
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100">
              {uploading === "hotel" ? "Uploading..." : "Upload Hotel Banner Image"}
              <input className="hidden" type="file" accept="image/*" disabled={uploading !== null} onChange={async (event) => { await uploadImage("hotel", event.target.files?.[0]); event.target.value = ""; }} />
            </label>
            {value.hotelImage ? (
              <button type="button" onClick={() => setImagePreview(imagePreview === "hotel" ? null : "hotel")} aria-expanded={imagePreview === "hotel"} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">
                <ImageIcon className="h-4 w-4" />{imagePreview === "hotel" ? "Hide Image Preview" : "Image Preview"}
              </button>
            ) : null}
          </div>
          {imagePreview === "hotel" && value.hotelImage ? <img src={value.hotelImage} alt="Hotel banner image preview" className="max-h-48 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain" /> : null}
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h4 className="m-0 text-xs font-extrabold uppercase tracking-wider text-[#A40918]">Right Banner: Flights</h4>
          <button
            type="button"
            onClick={() => update("flightsVisible", !value.flightsVisible)}
            aria-pressed={value.flightsVisible}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${value.flightsVisible ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100" : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {value.flightsVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {value.flightsVisible ? "Shown on frontend" : "Hidden on frontend"}
          </button>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Eyebrow" value={value.flightsEyebrow} onChange={(next) => update("flightsEyebrow", next)} />
            <TextField label="Title" value={value.flightsTitle} onChange={(next) => update("flightsTitle", next)} />
          </div>
          <TextField label="Description" value={value.flightsDescription} onChange={(next) => update("flightsDescription", next)} multiline />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField label="Route: From code" value={value.flightsRouteFrom} onChange={(next) => update("flightsRouteFrom", next)} />
            <TextField label="Route: To code" value={value.flightsRouteTo} onChange={(next) => update("flightsRouteTo", next)} />
            <TextField label="Button text" value={value.flightsButtonLabel} onChange={(next) => update("flightsButtonLabel", next)} />
            <TextField label="Button link" value={value.flightsButtonLink} onChange={(next) => update("flightsButtonLink", next)} />
          </div>
          <TextField label="Image URL" value={value.flightsImage} onChange={(next) => update("flightsImage", next)} />
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100">
              {uploading === "flights" ? "Uploading..." : "Upload Flights Banner Image"}
              <input className="hidden" type="file" accept="image/*" disabled={uploading !== null} onChange={async (event) => { await uploadImage("flights", event.target.files?.[0]); event.target.value = ""; }} />
            </label>
            {value.flightsImage ? (
              <button type="button" onClick={() => setImagePreview(imagePreview === "flights" ? null : "flights")} aria-expanded={imagePreview === "flights"} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50">
                <ImageIcon className="h-4 w-4" />{imagePreview === "flights" ? "Hide Image Preview" : "Image Preview"}
              </button>
            ) : null}
          </div>
          {imagePreview === "flights" && value.flightsImage ? <img src={value.flightsImage} alt="Flights banner image preview" className="max-h-48 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain" /> : null}
        </div>
      </div>
      {uploadError ? <p role="alert" className="mt-2 text-xs font-semibold text-red-600">{uploadError}</p> : null}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-800">Live Side Banner Preview</h4>
        <p className="mb-4 text-[11px] text-slate-500">Updates as you type. Click Update above to save changes to the live homepage.</p>
        <div className="grid grid-cols-1 justify-items-center gap-5 lg:grid-cols-2">
          <SideBannerPreview theme="hotel" value={value} />
          <SideBannerPreview theme="flights" value={value} />
        </div>
      </div>
    </section>
  );
}
