import React from 'react';
import { Shield, Car, Database, UserCheck, Settings, AlertTriangle, Cpu } from 'lucide-react';

export function Navbar({
  activeRole,
  setActiveRole,
  dbStatus,
  consent,
  onOpenConsentModal,
  disputePasses = 2,
}) {
  const isPostgres = dbStatus?.mode === 'POSTGRES_NEON';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0A0F1D]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="h-full w-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                SafeDrive <span className="text-emerald-400">IQ</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" /> Edge Privacy
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Privacy-First Usage-Based Insurance • Hackathon PS-008
            </p>
          </div>
        </div>

        {/* Center / Right status & controls */}
        <div className="flex items-center space-x-3">
          {/* Database / Reliability indicator */}
          <div
            title={dbStatus?.message || 'Database status'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${
              isPostgres
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
            }`}
          >
            <Database className="w-3.5 h-3.5 animate-pulse" />
            <span>{isPostgres ? 'Neon Cloud DB' : 'Local In-Memory (Zero-Lag Mode)'}</span>
          </div>

          {/* PrivacyShield Tier Button */}
          <button
            onClick={onOpenConsentModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">PrivacyShield:</span>
            <span className="font-semibold text-emerald-400">
              {consent?.fallbackFixed ? 'Fixed Plan' : consent?.tier || 'Tier C'}
            </span>
          </button>

          {/* Role Switcher for Hackathon Judges */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveRole('driver')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeRole === 'driver'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Driver</span>
            </button>
            <button
              onClick={() => setActiveRole('underwriter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeRole === 'underwriter'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Underwriter Review</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
