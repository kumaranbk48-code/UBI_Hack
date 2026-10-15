import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, ArrowDown, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { Alert } from './primitives';

export function PricingReceipt({ quote, isSynced = true }) {
  const [isFormulaOpen, setIsFormulaOpen] = useState(true);

  const basePrice = quote?.basePremium || 100.0;
  const finalPrice = quote?.finalPremium || 100.0;
  const totalSaved = quote?.totalSaved !== undefined ? quote.totalSaved : Math.max(0, basePrice - finalPrice);
  const discountPct = quote?.discountPercentage || (basePrice > 0 ? Math.round((totalSaved / basePrice) * 100) : 0);

  // Line items from quote
  const lines = quote?.receiptLines && quote.receiptLines.length > 0 ? quote.receiptLines : [
    { label: 'Standard Insurer Base Rate', amount: 100.0, type: 'base' },
    { label: 'Low Mileage Reward (240 km)', amount: -7.0, type: 'discount' },
    { label: 'Daytime Driving Bonus (Zero midnight hours)', amount: -10.0, type: 'discount' },
    { label: 'SafeHabit Smooth Braking Bonus (94 Score)', amount: -16.0, type: 'discount' },
  ];

  return (
    <section
      aria-label="How your price was calculated"
      className="rounded-[10px] bg-surface border border-line p-6 sm:p-7 shadow-soft"
    >
      {/* Section Header */}
      <div className="pb-4 mb-5 border-b border-line flex items-baseline justify-between">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Actuarial Statement
          </span>
          <h2 className="text-xl font-serif font-normal text-ink">
            How your price was calculated
          </h2>
        </div>
        <span className="text-[12px] text-ink-subtle tabular-nums font-mono">
          REF: #{new Date().getFullYear()}-UBI-0842
        </span>
      </div>

      {/* Sync Reminder / Default Notice */}
      {!isSynced && (
        <div className="mb-5">
          <Alert
            variant="warning"
            title="Unsynced Month Notice"
          >
            No vehicle trip log was uploaded for the current calendar cycle. Standard base rate applies with no habit discounts. Upload your CSV log below to calculate your savings.
          </Alert>
        </div>
      )}

      {/* Printed Invoice / Statement Style Receipt */}
      <div className="rounded-[6px] bg-surface-raised border border-line p-5 sm:p-6 mb-5">
        <div className="text-[11px] uppercase tracking-[0.08em] text-ink-subtle pb-3 border-b border-line font-medium flex justify-between">
          <span>Coverage Item</span>
          <span>Adjustment</span>
        </div>

        {/* Itemized Lines */}
        <div className="divide-y divide-line/60 py-1">
          {lines.map((line, idx) => {
            const isNegative = line.amount < 0;
            const isSurcharge = line.amount > 0 && line.type === 'surcharge';
            return (
              <div
                key={idx}
                className="py-2.5 flex items-center justify-between text-[13px] gap-4"
              >
                <div className="text-ink">
                  <span className="font-normal">{line.label}</span>
                </div>
                <div className="tabular-nums font-medium text-right shrink-0">
                  {isNegative ? (
                    <span className="text-status-positive">
                      -${Math.abs(line.amount).toFixed(2)}
                    </span>
                  ) : isSurcharge ? (
                    <span className="text-status-danger">
                      +${line.amount.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-ink font-semibold">
                      ${line.amount.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Subtotal / Total Calculation Rule */}
        <div className="mt-2 pt-3 border-t-2 border-line space-y-1.5">
          <div className="flex justify-between items-center text-[12px] text-ink-muted">
            <span>Market Benchmark Subtotal</span>
            <span className="tabular-nums">${basePrice.toFixed(2)}</span>
          </div>
          {totalSaved > 0 && (
            <div className="flex justify-between items-center text-[12px] text-brand font-medium">
              <span>Cumulative Safe Driving Credit</span>
              <span className="tabular-nums">-${totalSaved.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-line flex justify-between items-baseline">
            <div>
              <span className="text-[14px] font-semibold text-ink">
                Adjusted Monthly Premium
              </span>
              <span className="block text-[11px] text-ink-subtle">
                Billed monthly • Fully deterministic
              </span>
            </div>
            <div className="text-right">
              <span className="font-serif text-2xl font-normal text-brand tabular-nums">
                ${finalPrice.toFixed(2)}
              </span>
              <span className="text-xs text-ink-muted font-normal ml-1">/ month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Single Comparison (Standard Rate vs. Your Rate) */}
      <div className="rounded-[6px] border border-line bg-surface p-4 mb-5">
        <div className="flex items-center justify-between text-[12px] mb-2">
          <span className="text-ink-muted">Market rate comparison</span>
          <span className="text-brand font-medium tabular-nums">
            {discountPct}% lower than benchmark
          </span>
        </div>

        {/* Proportional dual meter */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-[12px]">
            <span className="w-28 text-ink-subtle shrink-0">Standard rate:</span>
            <div className="flex-1 bg-line h-2 rounded-full overflow-hidden">
              <div className="bg-ink-subtle h-full rounded-full" style={{ width: '100%' }} />
            </div>
            <span className="w-16 text-right tabular-nums text-ink-muted">${basePrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-3 text-[12px]">
            <span className="w-28 font-medium text-brand shrink-0">Your rate:</span>
            <div className="flex-1 bg-line h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (finalPrice / basePrice) * 100)}%` }}
              />
            </div>
            <span className="w-16 text-right tabular-nums font-semibold text-brand">${finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Collapsible "How this is calculated" explanation section (Open by default) */}
      <div className="border-t border-line pt-3">
        <button
          type="button"
          onClick={() => setIsFormulaOpen(!isFormulaOpen)}
          aria-expanded={isFormulaOpen}
          className="w-full flex items-center justify-between text-[13px] text-ink-muted hover:text-ink py-1 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded-[4px]"
        >
          <span className="flex items-center gap-2 font-medium">
            <HelpCircle className="w-4 h-4 text-ink-subtle stroke-[1.5]" />
            <span>How this is calculated</span>
          </span>
          {isFormulaOpen ? (
            <ChevronUp className="w-4 h-4 text-ink-subtle stroke-[1.5]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-ink-subtle stroke-[1.5]" />
          )}
        </button>

        {isFormulaOpen && (
          <div className="mt-3 text-[12px] text-ink-muted leading-relaxed space-y-2 rounded-[6px] bg-surface-raised border border-line p-4">
            <p className="font-mono text-[11px] text-ink bg-bg p-2 rounded border border-line tabular-nums">
              Final Premium = Base ($100.00) − LowMileageReward − DaytimeBonus − SafeHabitsReward − DisputeCredits + Surcharges
            </p>
            <ul className="space-y-1.5 list-disc list-inside text-ink-muted">
              <li>
                <strong className="text-ink font-medium">Mileage tier:</strong> Distance under 500 km/month incurs no high-exposure penalty and unlocks baseline reward.
              </li>
              <li>
                <strong className="text-ink font-medium">Time-of-day exposure:</strong> Midnight driving (12:00 AM – 4:00 AM) carries statistically higher collision probability. Zero midnight driving yields maximum credit.
              </li>
              <li>
                <strong className="text-ink font-medium">Deterministic actuarial formula:</strong> No opaque machine-learning black boxes. Every dollar saved corresponds directly to observable physics.
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
