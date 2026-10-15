import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowDown, Info } from 'lucide-react';

export function HeroFairScore({
  score = 94,
  grade = 'Elite Safe Driver',
  quote,
  metrics,
  isSynced = true,
}) {
  const [displayScore, setDisplayScore] = useState(0);

  // Number count-up animation once on load
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayScore(score);
      return;
    }

    let start = 0;
    const end = Math.min(100, Math.max(0, Number(score) || 0));
    const duration = 600;
    const startTime = performance.now();

    function updateScore(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayScore(Math.round(eased * end));

      if (progress < 1) {
        requestAnimationFrame(updateScore);
      }
    }

    requestAnimationFrame(updateScore);
  }, [score]);

  const basePrice = quote?.basePremium || 100.0;
  const finalPrice = quote?.finalPremium || 67.0;
  const totalSaved = quote?.totalSaved !== undefined ? quote.totalSaved : Math.max(0, basePrice - finalPrice);
  const discountPct = quote?.discountPercentage || (basePrice > 0 ? Math.round((totalSaved / basePrice) * 100) : 0);

  // Slim-stroke arc math (radius 60, stroke 4, 240 deg arc)
  const radius = 54;
  const stroke = 4.5;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.72;
  const strokeDashoffset = arcLength - ((displayScore / 100) * arcLength);

  // Plain language verdict
  let verdict = "Excellent. You're driving safer than 91% of drivers.";
  if (score < 70) {
    verdict = "Elevated risk. High night mileage or frequent hard stops are raising your rate.";
  } else if (score < 85) {
    verdict = "Steady driving. Small reductions in night hours will lower your next renewal.";
  }

  return (
    <section
      aria-label="Monthly Insurance Assessment"
      className="rounded-[10px] bg-surface border border-line p-6 sm:p-8 shadow-soft"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Monthly FairScore & Arc Gauge */}
        <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Slim Arc Meter */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center" aria-hidden="true">
            <svg
              width="144"
              height="144"
              className="rotate-[140deg] transition-all duration-300"
            >
              {/* Background hairline track */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#E4DDD0"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Active brand arc */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#1F3A34"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 ease-out"
              />
            </svg>

            {/* Score inside arc */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-serif text-[68px] sm:text-[72px] leading-none font-normal text-brand tabular-nums tracking-tight">
                {displayScore}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle -mt-1">
                out of 100
              </span>
            </div>
          </div>

          {/* Verdict and context */}
          <div className="text-center sm:text-left flex-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
              Monthly FairScore™
            </span>
            <h2 className="text-lg sm:text-xl font-serif font-normal text-ink leading-snug">
              {verdict}
            </h2>
            <p className="text-[13px] text-ink-muted mt-2 leading-relaxed">
              Based on {metrics?.totalDistanceKm || 240} km driven this cycle, with{' '}
              {metrics?.nightDistanceKm ? `${metrics.nightDistanceKm} km at night` : 'zero night hours'}{' '}
              and {metrics?.harshBrakeEvents === 0 ? 'zero harsh braking events' : `${metrics?.harshBrakeEvents} harsh stops`}.
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-ink-subtle">
              <ShieldCheck className="w-4 h-4 text-brand stroke-[1.5]" />
              <span>Averaging protection: 1 emergency stop is automatically forgiven per 150 km.</span>
            </div>
          </div>
        </div>

        {/* Vertical divider on desktop */}
        <div className="hidden lg:block lg:col-span-1 border-r border-line h-32 self-center mx-auto" />

        {/* Right Column: Month's Premium & Savings */}
        <div className="lg:col-span-4 flex flex-col justify-center text-center sm:text-left">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Current Month's Rate
          </span>

          <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
            <span className="font-serif text-4xl sm:text-5xl font-normal text-ink tabular-nums tracking-tight">
              ${finalPrice.toFixed(2)}
            </span>
            <span className="text-sm text-ink-muted font-normal">/ month</span>
          </div>

          <div className="mt-2.5">
            {totalSaved > 0 ? (
              <p className="text-[13px] text-brand font-medium">
                ${totalSaved.toFixed(2)} less than standard rate
                <span className="text-ink-subtle font-normal text-xs ml-1">
                  ({discountPct}% savings)
                </span>
              </p>
            ) : (
              <p className="text-[13px] text-ink-muted">
                Standard base rate applies this cycle.
              </p>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-line text-[12px] text-ink-subtle flex items-center justify-center sm:justify-start gap-1">
            <span>Next billing adjustment in 14 days</span>
          </div>
        </div>
      </div>
    </section>
  );
}
