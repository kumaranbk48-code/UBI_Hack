import React from 'react';
import { ShieldCheck, Check, ArrowRight } from 'lucide-react';
import { Button } from './primitives';

export function FallbackPlanCard({ isFixedActive, onToggleFixed }) {
  return (
    <section
      aria-label="Fixed-price fairness plan"
      className="rounded-[10px] bg-surface border border-line p-6 sm:p-7 shadow-soft"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
              Fairness Protection
            </span>
            {isFixedActive && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-brand-light text-brand">
                Active Plan
              </span>
            )}
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-normal text-ink">
            Frequent road hazards or dense rush-hour routes?
          </h3>
          <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">
            If your daily commute includes unavoidable construction or emergency road conditions, telematics scoring may feel unfair. You can opt into our guaranteed <strong>Fixed-Price Plan ($85.00/mo flat)</strong> with zero sensor monitoring at any time.
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-center">
          <Button
            variant={isFixedActive ? 'secondary' : 'primary'}
            size="md"
            onClick={onToggleFixed}
          >
            {isFixedActive ? (
              <>
                <Check className="w-4 h-4 text-brand mr-1" />
                <span>Fixed Plan Active ($85/mo)</span>
              </>
            ) : (
              <>
                <span>Switch to Fixed $85 Rate</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
