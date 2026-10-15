import React from 'react';
import { AlertCircle, Check, ArrowRight } from 'lucide-react';

export function FallbackPlanCard({ isFixedActive, onToggleFixed }) {
  return (
    <div className="rounded-2xl glass-panel p-5 border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Unavoidable Potholes or Chaotic Traffic?
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Fairness Fallback
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              If your daily route requires frequent emergency stops or has severe road damage, telematics tracking might not be fair.
              Switch to our <strong>Fixed-Price Guarantee ($85/mo flat)</strong> with zero sensor monitoring.
            </p>
          </div>
        </div>

        <button
          onClick={onToggleFixed}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto ${
            isFixedActive
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
          }`}
        >
          {isFixedActive ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Fixed Plan Active ($85/mo)</span>
            </>
          ) : (
            <>
              <span>Switch to Fixed $85 Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
