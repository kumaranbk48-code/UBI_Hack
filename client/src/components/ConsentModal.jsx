import React, { useState } from 'react';
import { X, ShieldCheck, Check, Lock, EyeOff, Info, AlertCircle } from 'lucide-react';

export function ConsentModal({ isOpen, onClose, currentConsent, onSaveConsent }) {
  if (!isOpen) return null;

  const [selectedTier, setSelectedTier] = useState(currentConsent?.tier || 'TIER_C');
  const [autoDeleteDays, setAutoDeleteDays] = useState(currentConsent?.autoDeleteDays || 30);
  const [fallbackFixed, setFallbackFixed] = useState(currentConsent?.fallbackFixed || false);
  const [saving, setSaving] = useState(false);

  const tiers = [
    {
      id: 'TIER_A',
      name: 'Tier A: Minimal Mileage Only',
      discount: 'Up to 10% OFF',
      color: 'border-blue-500/40 bg-blue-500/5',
      badge: 'Max Privacy',
      dataShared: ['Total Kilometers (Odometer verification)'],
      dataProtected: ['No braking analysis', 'No speed tracking', 'No day/night tracking', 'Zero GPS locations'],
    },
    {
      id: 'TIER_B',
      name: 'Tier B: Mileage + Day/Night',
      discount: 'Up to 20% OFF',
      color: 'border-cyan-500/40 bg-cyan-500/5',
      badge: 'Balanced',
      dataShared: ['Total Kilometers', 'Daytime vs. Night exposure (12-4 AM)'],
      dataProtected: ['No braking analysis', 'No speed tracking', 'Zero GPS locations'],
    },
    {
      id: 'TIER_C',
      name: 'Tier C: Full Driving Habits',
      discount: 'Up to 40% OFF',
      color: 'border-emerald-500/40 bg-emerald-500/5',
      badge: 'Max Savings',
      dataShared: ['Total Kilometers', 'Day vs. Night hours', 'Smooth Braking rate (0.4g threshold)', 'Speed limit adherence'],
      dataProtected: ['Raw GPS locations masked', 'Phone tracking NOT used', 'Processed 100% on-device'],
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    await onSaveConsent({
      tier: selectedTier,
      autoDeleteDays: Number(autoDeleteDays),
      fallbackFixed,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                PrivacyShield™ Consent Controls
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Data Minimization
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                You decide what data is shared. Raw trip files are processed locally on your device.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tier Cards */}
        <div className="mt-5 space-y-3">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Choose Your Consented Data Tier
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.map((t) => {
              const isSelected = selectedTier === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTier(t.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all relative ${
                    isSelected
                      ? `${t.color} ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10`
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {t.badge}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400">{t.discount}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2">{t.name}</h3>

                  <div className="space-y-1.5 text-[11px] mb-3">
                    <div className="text-slate-400 font-medium">Shared with insurer:</div>
                    {t.dataShared.map((d, i) => (
                      <div key={i} className="flex items-start gap-1 text-slate-300">
                        <Check className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-1 text-[11px] pt-2 border-t border-slate-800/80">
                    <div className="text-slate-500 font-medium flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Protected & Not Shared:
                    </div>
                    {t.dataProtected.slice(0, 2).map((p, i) => (
                      <div key={i} className="text-slate-400 flex items-center gap-1">
                        <span className="text-slate-600">•</span> {p}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Privacy Settings */}
        <div className="mt-5 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
          {/* Retention Period */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> Auto-Delete Retention Window
              </div>
              <div className="text-[11px] text-slate-400">
                Automatically purge trip summaries from the insurer ledger after:
              </div>
            </div>
            <div className="flex items-center gap-2">
              {[15, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setAutoDeleteDays(days)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition ${
                    autoDeleteDays === days
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>

          {/* Fallback Fixed-Price Option */}
          <div className="pt-3 border-t border-slate-800/80 flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Fallback Fixed-Price Plan ($85/mo flat)
              </div>
              <div className="text-[11px] text-slate-400">
                Live in an area with unavoidable potholes or extreme traffic? Opt into a flat $85 rate without any telematics tracking.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={fallbackFixed}
                onChange={(e) => setFallbackFixed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Apply Privacy Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
