import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { Slider } from './primitives';

export function WhatIfSlider({ currentMetrics }) {
  const [reductionPercent, setReductionPercent] = useState(30);

  const estimatedSavings = Math.round((reductionPercent / 100) * 16 * 100) / 100;
  const scoreBoost = Math.round((reductionPercent / 100) * 8);

  return (
    <section className="rounded-[10px] bg-surface border border-line p-6 shadow-soft space-y-4">
      <div className="flex items-baseline justify-between pb-3 border-b border-line">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Habit Projection
          </span>
          <h3 className="font-serif text-lg font-normal text-ink">
            Routine optimization projection
          </h3>
        </div>
        <span className="text-xs font-semibold text-brand tabular-nums">
          +${estimatedSavings.toFixed(2)}/mo projected savings
        </span>
      </div>

      <Slider
        label="Reduce late night driving"
        sublabel="(12:00 AM – 4:00 AM)"
        value={reductionPercent}
        min={10}
        max={80}
        step={5}
        unit="%"
        onChange={(val) => setReductionPercent(val)}
        hint={{ left: '10% reduction', mid: '50%', right: '80% reduction' }}
      />

      <div className="p-3.5 rounded-[6px] bg-surface-raised border border-line text-xs text-ink-muted flex items-center justify-between">
        <span>Projected FairScore improvement:</span>
        <span className="font-medium text-brand tabular-nums">+{scoreBoost} points</span>
      </div>
    </section>
  );
}
