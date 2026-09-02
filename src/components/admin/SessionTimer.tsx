'use client';

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, AlertTriangle, LogOut, X, ShieldAlert } from 'lucide-react';
import { adminLogout } from '@/actions/authActions';

interface SessionTimerProps {
  loginTime?: number;
}

const EIGHT_HOURS_SEC = 8 * 60 * 60; // 28,800 seconds (Max 8 Hours)
const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000; // 28,800,000 milliseconds
const FIVE_MINUTES_SEC = 5 * 60; // 300 seconds (5 Minutes Warning)

export default function SessionTimer({ loginTime }: SessionTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    let effectiveLoginTime = loginTime;

    if (typeof window !== 'undefined') {
      const now = Date.now();
      const stored = localStorage.getItem('admin_login_time');

      if (stored) {
        const parsed = parseInt(stored, 10);
        // Validate stored timestamp: must be valid and within 8 hours
        if (parsed && !isNaN(parsed) && now - parsed >= 0 && now - parsed < EIGHT_HOURS_MS) {
          effectiveLoginTime = parsed;
        } else {
          // Reset expired or corrupted timestamp
          effectiveLoginTime = now;
          localStorage.setItem('admin_login_time', String(now));
        }
      } else {
        effectiveLoginTime = effectiveLoginTime || now;
        localStorage.setItem('admin_login_time', String(effectiveLoginTime));
      }
    }

    if (!effectiveLoginTime || isNaN(effectiveLoginTime)) {
      effectiveLoginTime = Date.now();
    }

    const endTime = effectiveLoginTime + EIGHT_HOURS_MS;

    const updateTimer = () => {
      const now = Date.now();
      let diffSec = Math.floor((endTime - now) / 1000);

      // HARD CLAMP: Remaining time can NEVER exceed 8 Hours (28,800 seconds)
      if (diffSec > EIGHT_HOURS_SEC) {
        diffSec = EIGHT_HOURS_SEC;
      }

      if (diffSec <= 0) {
        diffSec = 0;
        setRemainingSeconds(0);
        if (!isLoggingOutRef.current) {
          isLoggingOutRef.current = true;
          handleAutoLogout();
        }
        return;
      }

      setRemainingSeconds(diffSec);

      // Trigger 5-minute warning popup (<= 300 seconds left)
      if (diffSec <= FIVE_MINUTES_SEC && !dismissedWarning) {
        setShowWarningModal(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [loginTime, dismissedWarning]);

  const handleAutoLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_login_time');
    }
    try {
      await adminLogout();
    } catch {
      if (typeof window !== 'undefined') {
        window.location.href = '/letstravel';
      }
    }
  };

  if (remainingSeconds === null) return null;

  // Format HH:MM:SS (Guaranteed <= 08:00:00)
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const isWarningState = remainingSeconds <= FIVE_MINUTES_SEC;

  return (
    <>
      {/* ── Top Bar Center Session Timer Display Badge ── */}
      <div
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-xs border cursor-help ${isWarningState
          ? 'bg-red-50 text-red-600 border-red-300 animate-pulse'
          : 'bg-slate-100 text-slate-700 border-slate-200/80 hover:bg-slate-200/60'
          }`}
        title={`Max 8-Hour Session. Expires in ${formattedTime}`}
      >
        <Clock className={`w-3.5 h-3.5 ${isWarningState ? 'text-red-600' : 'text-emerald-700'}`} />
        <span>
          <span className="text-slate-600 font-medium hidden sm:inline">Session: </span>
          <span className="font-sans font-bold tracking-wider text-primary">{formattedTime}</span>
        </span>
      </div>

      {/* ── 5-Minute Warning Modal Popup ── */}
      {showWarningModal && typeof document !== 'undefined'
        ? createPortal(
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-red-200 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              {/* Warning Icon Badge */}
              <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-md">
                <ShieldAlert className="w-8 h-8 animate-bounce" />
              </div>

              {/* Modal Heading */}
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 m-0">Admin Session Expiring Soon!</h3>
                <p className="text-xs text-slate-500 m-0 leading-relaxed">
                  Your 8-hour administrator session will expire in less than 5 minutes. Save your work to avoid losing unsaved changes.
                </p>
              </div>

              {/* Live Remaining Time Bar */}
              <div className="w-full bg-red-50 p-4 rounded-2xl border border-red-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-red-700 uppercase tracking-wider text-[10px]">Time Remaining</span>
                  <span className="font-mono text-base text-red-600">{formattedTime}</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, (remainingSeconds / FIVE_MINUTES_SEC) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowWarningModal(false);
                    setDismissedWarning(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  I Understand
                </button>

                <button
                  type="button"
                  onClick={handleAutoLogout}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-extrabold hover:bg-red-700 transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out Now
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}
    </>
  );
}
