import React, { useState } from 'react';

const LockIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const KeyIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const EyeIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const ArrowLeftIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export const DEFAULT_HOST_PASSCODE = 'quizmaster2026';

export function getStoredMasterPasscode() {
  if (typeof window === 'undefined') return DEFAULT_HOST_PASSCODE;
  return localStorage.getItem('quizpulse_host_master_passcode') || DEFAULT_HOST_PASSCODE;
}

export function setStoredMasterPasscode(newCode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('quizpulse_host_master_passcode', newCode.trim());
}

export function isHostAuthenticated() {
  if (typeof window === 'undefined') return false;
  return (
    localStorage.getItem('quizpulse_host_authenticated') === 'true' ||
    sessionStorage.getItem('quizpulse_host_authenticated') === 'true'
  );
}

export function clearHostAuthentication() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('quizpulse_host_authenticated');
  sessionStorage.removeItem('quizpulse_host_authenticated');
}

export default function HostLockScreen({ onAuthenticated, onBackToPlayer }) {
  const [passcode, setPasscode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const currentMaster = getStoredMasterPasscode();

    if (passcode.trim() === currentMaster) {
      if (rememberMe) {
        localStorage.setItem('quizpulse_host_authenticated', 'true');
      } else {
        sessionStorage.setItem('quizpulse_host_authenticated', 'true');
      }
      onAuthenticated();
    } else {
      setIsShaking(true);
      setErrorMessage('Incorrect passcode. Please check your credentials.');
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between items-center p-6 sm:p-10 font-sans relative overflow-hidden">
      {/* Subtle ambient glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-md flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToPlayer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
        >
          <ArrowLeftIcon />
          <span>Player Join</span>
        </button>

        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
          Host Security Gate
        </span>
      </header>

      {/* Central Lock Box */}
      <main className="w-full max-w-md my-auto">
        <div className={`w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl transition-all ${
          isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
        }`}>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-xl shadow-purple-600/25">
            <LockIcon className="w-8 h-8" />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Host Console
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Confidential quizmaster controls, question authoring, and scoring keys are protected.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <KeyIcon className="w-4 h-4 text-purple-400" />
                <span>Enter Master Passcode:</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Master Passcode..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-2xl px-4 py-3.5 pr-12 text-base font-bold text-white placeholder-slate-600 outline-none transition-all"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                  title={showPassword ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs text-left leading-relaxed animate-in fade-in duration-200">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-between text-xs px-1 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500/20 accent-purple-600 cursor-pointer"
                />
                <span>Remember this device</span>
              </label>

              <span className="text-[11px] text-slate-500 font-mono">
                Default: quizmaster2026
              </span>
            </div>

            <button
              type="submit"
              disabled={!passcode.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-purple-600/30 active:scale-98 transition-all cursor-pointer mt-2"
            >
              Unlock Host Console
            </button>
          </form>
        </div>
      </main>

      <footer className="w-full max-w-md text-center py-2 text-xs text-slate-600">
        QuizPulse Quizmaster Security
      </footer>
    </div>
  );
}
