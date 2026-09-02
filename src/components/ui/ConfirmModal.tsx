'use client';

import React from 'react';
import { AlertCircle, Trash2, CheckCircle2, ShieldAlert, X } from 'lucide-react';

export interface ConfirmModalConfig {
  title: string;
  message: string;
  icon?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'success' | 'primary';
  onConfirm: () => void | Promise<void>;
}

interface ConfirmModalProps {
  config: ConfirmModalConfig | null;
  onClose: () => void;
}

export default function ConfirmModal({ config, onClose }: ConfirmModalProps) {
  if (!config) return null;

  const {
    title,
    message,
    icon,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    onConfirm,
  } = config;

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const getTheme = () => {
    switch (variant) {
      case 'danger':
        return {
          bgGradient: 'from-[#1F0707]/95 via-[#330A0A]/95 to-[#4B0000]/95',
          border: 'border-red-500/40',
          glow: 'shadow-[0_0_60px_rgba(239,68,68,0.35)]',
          iconBg: 'bg-red-500/20 border-red-400/40 text-red-400',
          defaultIcon: <Trash2 className="w-8 h-8 text-red-400 animate-pulse" />,
          buttonBg: 'bg-red-600 hover:bg-red-500 text-white',
          titleColor: 'text-red-300',
        };
      case 'warning':
        return {
          bgGradient: 'from-[#1F1707]/95 via-[#33260A]/95 to-[#4B3900]/95',
          border: 'border-amber-500/40',
          glow: 'shadow-[0_0_60px_rgba(245,158,11,0.35)]',
          iconBg: 'bg-amber-500/20 border-amber-400/40 text-amber-400',
          defaultIcon: <AlertCircle className="w-8 h-8 text-amber-400 animate-bounce" />,
          buttonBg: 'bg-gold hover:bg-amber-400 text-slate-950 font-black',
          titleColor: 'text-amber-300',
        };
      case 'success':
        return {
          bgGradient: 'from-[#071F19]/95 via-[#0A3328]/95 to-primary/95',
          border: 'border-emerald-500/40',
          glow: 'shadow-[0_0_60px_rgba(16,185,129,0.35)]',
          iconBg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400',
          defaultIcon: <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />,
          buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black',
          titleColor: 'text-emerald-300',
        };
      case 'primary':
      default:
        return {
          bgGradient: 'from-[#071814]/95 via-[#0E2C24]/95 to-primary/95',
          border: 'border-emerald-500/40',
          glow: 'shadow-[0_0_60px_rgba(0,75,57,0.45)]',
          iconBg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
          defaultIcon: <ShieldAlert className="w-8 h-8 text-emerald-300 animate-pulse" />,
          buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black',
          titleColor: 'text-emerald-200',
        };
    }
  };

  const theme = getTheme();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md bg-gradient-to-b ${theme.bgGradient} ${theme.border} ${theme.glow} border rounded-3xl p-7 shadow-2xl backdrop-blur-2xl text-white transform transition-all scale-100 flex flex-col items-center text-center overflow-hidden`}
      >
        {/* Background ambient light */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer border-none"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 3D Floating Icon Badge */}
        <div
          className={`w-16 h-16 rounded-2xl ${theme.iconBg} border flex items-center justify-center mb-4 shadow-lg backdrop-blur-md transform hover:scale-105 transition-transform text-2xl`}
        >
          {icon || theme.defaultIcon}
        </div>

        {/* Title */}
        <h3 className={`text-xl font-bold font-serif ${theme.titleColor} mb-2`}>
          {title}
        </h3>

        {/* Message */}
        <p className="text-xs text-white/80 leading-relaxed mb-6 font-light max-w-sm">
          {message}
        </p>

        {/* Action Buttons Row */}
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider ${theme.buttonBg} transition-all shadow-md transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer border-none disabled:opacity-75 disabled:scale-100 disabled:cursor-wait flex items-center justify-center gap-2`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
