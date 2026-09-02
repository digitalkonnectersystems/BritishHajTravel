'use client';

import React from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  referenceNumber?: string;
}

export default function SubmissionSuccessModal({
  isOpen,
  onClose,
  title = 'Request Received Successfully!',
  message = 'Thank you! Your message has been received. Our team will contact you shortly.',
  referenceNumber,
}: SubmissionSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-7 text-center relative flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors border-none cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Green Checkmark Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-primary border-4 border-emerald-100 flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
          <CheckCircle2 className="w-10 h-10 text-primary" />
        </div>

        {/* Modal Text Content */}
        <div className="flex flex-col gap-2 mt-1">
          <h3 className="text-xl font-extrabold text-slate-900 m-0 tracking-tight">
            {title}
          </h3>
          <p className="text-xs font-medium text-slate-600 leading-relaxed m-0 px-2">
            {message}
          </p>
        </div>

        {/* Reference Badge if Available */}
        {referenceNumber && (
          <div className="bg-emerald-50/80 border border-emerald-200/80 px-4 py-2 rounded-2xl w-full flex items-center justify-between text-xs font-bold text-primary">
            <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider">Reference #:</span>
            <span className="font-mono text-sm tracking-wide bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 shadow-2xs">
              {referenceNumber}
            </span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-2 py-3.5 bg-primary hover:bg-[#00382B] text-white rounded-2xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-md hover:shadow-lg cursor-pointer border-none"
        >
          Got it, Thanks!
        </button>
      </div>
    </div>
  );
}
