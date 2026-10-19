'use client';

import { useState } from 'react';
import Image from 'next/image';
import { adminLogin } from '@/actions/authActions';

export default function LetsTravelPageClient({ initialIdentity, initialLoginAuth }: { initialIdentity?: any; initialLoginAuth?: any }) {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [flowType, setFlowType] = useState<'login' | 'forgot_password'>('login');
  const [passwordInput, setPasswordInput] = useState('');

  const identity = initialIdentity || null;
  const loginAuth = initialLoginAuth || null;

  const logoSrc = identity?.logo || '/img/logo.png';
  const logoAlt = identity?.logoAlt || 'British Hajj Travel Logo';
  const bgImage = loginAuth?.backgroundImage;
  const footerText = loginAuth?.footerText || '© 2026 British Hajj Travel LTD. All Rights Reserved.';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    const formData = new FormData(e.currentTarget);
    const res = await adminLogin(formData);
    if (res && !res.success) {
      setError(res.error || 'Login Failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-light flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Image overlay if configured */}
      {bgImage ? (
        <div
          ref={(el) => {
            if (el && bgImage) {
              el.style.backgroundImage = `url(${bgImage})`;
            }
          }}
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
        />
      ) : (
        <>
          {/* <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#DB9E30_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] opacity-40 pointer-events-none" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-red rounded-full blur-[140px] opacity-15 pointer-events-none" /> */}
        </>
      )}

      {/* Card Wrapper */}
      <div className="w-full max-w-md bg-white backdrop-blur-md rounded-xl shadow-[0_24px_20px_rgba(0,0,0,0.2)] p-6 sm:p-8 relative z-10">

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={210}
              height={50}
              priority
              unoptimized={true}
              className="w-[210px] h-auto"
            />
          </div>

          <div className="inline-flex items-center gap-1.5 bg-primary border border-[#DB9E30]/30 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-3">
            <span className="star w-2.5 h-2.5 !bg-white"></span>
            Management Portal
          </div>
          <h1 className="text-2xl font-serif font-normal text-primary tracking-wide">
            {flowType === 'login' && 'Admin Portal Sign In'}
            {flowType === 'forgot_password' && 'Reset Password'}
            </h1>
          <p className="text-xs text-ink-soft mt-1 font-light">
            {flowType === 'login' && 'Authorized access to British Hajj Travel UK Operations'}
            {flowType === 'forgot_password' && 'Enter your registered email address to continue'}
            </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="text-red-500 font-semibold text-xs bg-red-500/5 px-3.5 py-2 rounded-md border border-red-500/50 mb-5 flex items-center gap-2 shadow-inner">
            <span className="">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-green-950/70 text-green-400 font-semibold text-xs p-3.5 rounded-xl border border-green-500/50 mb-5 flex items-center gap-2 shadow-inner">
            <span className="text-sm">✓</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Forms based on Flow Type */}
        {flowType === 'login' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2 ${error ? 'text-red-500' : 'text-ink'}`}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                required
                className={`w-full px-4 py-3 text-sm bg-white border border-1 border-[#d1d1d1] !text-ink rounded-md outline-none transition !placeholder:text-slate-200 autofill:bg-white autofill:[shadow:0_0_0_1000px_white_inset] autofill:[-webkit-text-fill-color:#1e293b] ${error
                    ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border border-[#E4DAC0]/20 focus:ring-[#DB9E30] focus:border-[#DB9E30]'
                  }`}
              // placeholder="Email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={`block text-[11px] font-bold uppercase tracking-wider ${error ? 'text-red-500' : 'text-ink'}`}>
                  Password
                </label>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className={`w-full px-4 py-3 text-sm bg-white border border-1 border-[#d1d1d1] !text-ink rounded-md outline-none transition !placeholder:text-slate-200 ${error
                    ? 'border-2 border-red-500 focus:ring-red-500 focus:border-red-500'
                    : 'border border-[#E4DAC0]/20 focus:ring-[#DB9E30] focus:border-[#DB9E30]'
                    }`}
                // placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-ink-soft hover:text-ink transition p-1 text-sm focus:outline-none"
                  aria-label={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? (
                    <i className="fa-solid fa-eye"></i>
                  ) : (
                    <i className="fa-solid fa-eye-slash"></i>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setFlowType('forgot_password'); setError(null); setSuccessMsg(null); }}
                className="text-[10px] font-bold text-red hover:underline transition-colors uppercase tracking-wider"
              >
                Forgot Password?
              </button>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-light text-white font-bold text-sm py-3.5 rounded-md shadow-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal →'}
              </button>
            </div>
          </form>
        )}

        {flowType === 'forgot_password' && (
          <div className="space-y-4 text-sm text-slate-700">
            <p>To reset your password, contact your site administrator. For security, an email address alone cannot authorize a password change.</p>
            <button type="button" onClick={() => { setFlowType('login'); setError(null); }}
              className="w-full rounded-md border border-slate-300 py-3 font-semibold hover:bg-slate-50">
              Back to Login
            </button>
          </div>
        )}
      </div>

      {/* Footer Text */}
      <div className="mt-6 relative z-10 text-center text-xs text-white font-medium">
        {footerText}
      </div>
    </div>
  );
}
