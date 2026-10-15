import React, { useState } from 'react';
import { TrendingUp, Sparkles, DollarSign } from 'lucide-react';

export function WhatIfSlider({ currentMetrics }) {
  const [reductionPercent, setReductionPercent] = useState(30);

  // Simple client-side what-if projection
  const currentNightKm = currentMetrics?.nightDistanceKm || 30;
  const estimatedSavings = Math.round((reductionPercent / 100) * 16 * 100) / 100;
  const scoreBoost = Math.round((reductionPercent / 100) * 8);

  return (
    <div className="rounded-2xl glass-panel p-5 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              "What-If" Savings Predictor
            </h4>
            <p className="text-[11px] text-slate-400">
              See how small changes in your routine directly reduce your bill.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Actuarial Projection
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-medium">
            Reduce Night Driving (12-4 AM) by:
          </span>
          <span className="text-emerald-400 font-bold font-mono text-sm">{reductionPercent}%</span>
        </div>

        <input
          type="range"
          min="10"
          max="80"
          step="5"
          value={reductionPercent}
          onChange={(e) => setReductionPercent(Number(e.target.value))}
          className="w-full accent-emerald-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>10% Reduction</span>
          <span>50%</span>
          <span>80% Reduction</span>
        </div>

        {/* Projected Outcome Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="text-xs">
              <span className="text-slate-300 font-medium">SafeScore Improvement: </span>
              <span className="text-emerald-400 font-bold font-mono">+{scoreBoost} PTS</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Additional Savings: </span>
            <span className="text-sm font-extrabold text-emerald-400 font-mono">
              +${estimatedSavings.toFixed(2)}/mo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
