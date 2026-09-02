"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadWidgetProps {
  value: string;
  onChange: (url: string) => void;
  subfolder?: string;
  compact?: boolean;
  hideManualUrl?: boolean;
  hideDeleteButton?: boolean;
}

export default function ImageUploadWidget({
  value,
  onChange,
  subfolder = "uploads",
  compact = false,
  hideManualUrl = false,
  hideDeleteButton = false,
}: ImageUploadWidgetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subfolder", subfolder);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during upload");
    } finally {
      setUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`flex ${compact ? "flex-row items-center gap-3" : "flex-col gap-3"} w-full`}>
      {/* File Input (Hidden) */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview & Actions */}
      {value ? (
        <div className={`relative items-center group ${compact ? "w-40 h-18 shrink-0" : "w-full max-w-[200px] aspect-video"} bg-slate-100 rounded-lg overflow-hidden border border-slate-200`}>
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-contain"
            unoptimized
          />
          {!hideDeleteButton && (
            <div className="absolute inset-0 bg-black/40 border-2 border-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onChange("")}
                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`flex items-center justify-center gap-2 ${compact ? "px-3 py-2 text-xs shrink-0" : "w-full p-4"} border-2 border-dashed border-primary rounded-lg bg-primary/5 hover:bg-slate-100 hover:border-primary transition-colors text-black`}
        >
          {uploading ? (
            <span>Uploading...</span>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span>{compact ? "Upload" : "Upload Image"}</span>
            </>
          )}
        </button>
      )}

      {/* Manual URL Input (Fallback) */}
      {!hideManualUrl && (
        <div className={`flex-1 ${compact ? "w-full" : ""}`}>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Or paste image URL..."
            className="w-full px-3 py-2 border border-primary/50 rounded-lg text-xs outline-none focus:border-primary/50 font-mono text-slate-600"
          />
          {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
