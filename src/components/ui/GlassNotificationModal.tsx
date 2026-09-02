"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export interface GlassNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type?: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  confirmText?: string;
}

export default function GlassNotificationModal({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
  confirmText = "Got it",
}: GlassNotificationProps) {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case "success":
        return {
          bgGradient: "from-[#071F19]/90 via-[#0A3328]/95 to-primary/90",
          border: "border-emerald-500/40",
          glow: "shadow-[0_0_50px_rgba(16,185,129,0.3)]",
          iconBg: "bg-emerald-500/20 text-emerald-400 border-emerald-400/40",
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />,
          badgeText: "SUCCESS",
          buttonBg: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
          titleColor: "text-emerald-300",
        };
      case "warning":
        return {
          bgGradient: "from-[#1F1707]/90 via-[#33260A]/95 to-[#4B3900]/90",
          border: "border-amber-500/40",
          glow: "shadow-[0_0_50px_rgba(245,158,11,0.3)]",
          iconBg: "bg-amber-500/20 text-amber-400 border-amber-400/40",
          icon: <AlertTriangle className="w-8 h-8 text-amber-400 animate-bounce" />,
          badgeText: "WARNING",
          buttonBg: "bg-gold hover:bg-amber-400 text-slate-950",
          titleColor: "text-amber-300",
        };
      case "error":
        return {
          bgGradient: "from-[#1F0707]/90 via-[#330A0A]/95 to-[#4B0000]/90",
          border: "border-red-500/40",
          glow: "shadow-[0_0_50px_rgba(239,68,68,0.3)]",
          iconBg: "bg-red-500/20 text-red-400 border-red-400/40",
          icon: <XCircle className="w-8 h-8 text-red-400 animate-pulse" />,
          badgeText: "ATTENTION REQUIRED",
          buttonBg: "bg-red-500 hover:bg-red-400 text-white",
          titleColor: "text-red-300",
        };
      default:
        return {
          bgGradient: "from-[#07131F]/90 via-[#0A2033]/95 to-[#002D4B]/90",
          border: "border-sky-500/40",
          glow: "shadow-[0_0_50px_rgba(14,165,233,0.3)]",
          iconBg: "bg-sky-500/20 text-sky-400 border-sky-400/40",
          icon: <Info className="w-8 h-8 text-sky-400 animate-pulse" />,
          badgeText: "INFORMATION",
          buttonBg: "bg-sky-500 hover:bg-sky-400 text-slate-950",
          titleColor: "text-sky-300",
        };
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* 3D Centric Glass Card */}
      <div
        className={`relative w-full max-w-md bg-gradient-to-b ${theme.bgGradient} ${theme.border} ${theme.glow} border rounded-3xl p-7 shadow-2xl backdrop-blur-2xl text-white transform transition-all scale-100 flex flex-col items-center text-center overflow-hidden`}
      >
        {/* Decorative background glow orb */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer border-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 3D Floating Animated Icon Badge */}
        <div
          className={`w-16 h-16 rounded-2xl ${theme.iconBg} border flex items-center justify-center mb-5 shadow-lg backdrop-blur-md transform hover:scale-105 transition-transform`}
        >
          {theme.icon}
        </div>

        {/* Badge Label */}
        <span className="text-[10px] font-extrabold tracking-widest uppercase opacity-75 mb-1 text-white/80">
          {theme.badgeText}
        </span>

        {/* Title */}
        <h3 className={`text-xl font-bold font-serif ${theme.titleColor} mb-2`}>
          {title}
        </h3>

        {/* Message */}
        <p className="text-xs text-white/80 leading-relaxed mb-6 font-light max-w-sm">
          {message}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className={`w-full py-3 px-6 rounded-2xl text-xs font-black uppercase tracking-wider ${theme.buttonBg} transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md cursor-pointer border-none`}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}
