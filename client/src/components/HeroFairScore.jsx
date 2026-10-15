import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowDown, Info } from 'lucide-react';
import { Skeleton } from './primitives';

export function HeroFairScore({
  score = 94,
  grade = 'Elite Safe Driver',
  quote,
  metrics,
  isSynced = true,
  isLoading = false,
}) {
  const [displayScore, setDisplayScore] = useState(score || 0);

  // Number count-up animation once on load
  useEffect(() => {
    if (isLoading || !quote) return;
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
  }, [score, isLoading, quote]);

  if (isLoading || !quote) {
    return (
      <div className="rounded-[10px] bg-surface border border-line p-6 sm:p-8 space-y-4">
        <Skeleton className="h-5 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="flex items-center gap-6">
            <Skeleton className="w-32 h-32 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-4 w-44" />
            </div>
          </div>
          <div className="space-y-3 justify-center flex flex-col">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-4 w-52" />
          </div>
        </div>
      </div>
    );
  }

  const basePrice = quote.basePremium || 100.0;
  const finalPrice = quote.finalPremium || 72.0;
  const totalSaved = quote.totalSaved !== undefined ? quote.totalSaved : Math.max(0, basePrice - finalPrice);
  const discountPct = quote.discountPercentage || (basePrice > 0 ? Math.round((totalSaved / basePrice) * 100) : 0);

  // Larger slim-stroke arc (radius 72, stroke 3.5, 240 deg arc)
  const radius = 72;
  const stroke = 3.5;
  const circumference = 2 * Math.PI * radius;
  // 240 degrees out of 360 = 2/3 of circle
  const arcLength = circumference * (2 / 3);
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
          {/* Slim Arc Meter with clear space and accessible meter role */}
          <div
            className="relative w-44 h-44 shrink-0 flex items-center justify-center"
            role="meter"
            aria-label={`FairScore: ${displayScore} out of 100`}
            aria-valuenow={displayScore}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <svg
              width="176"
              height="176"
              className="rotate-[150deg] transition-all duration-300"
              aria-hidden="true"
            >
              {/* Background hairline track */}
              <circle
                cx="88"
                cy="88"
                r={radius}
                stroke="#E4DDD0"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${arcLength} ${circumference}`}
                strokeLinecap="round"
              />
              {/* Active thin brand-green stroke */}
              <circle
                cx="88"
                cy="88"
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

            {/* Score inside arc with comfortable clearance and no overlap */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="font-serif text-[56px] sm:text-[60px] leading-none font-normal text-brand tabular-nums tracking-tight">
                {displayScore}
              </span>
              <span className="text-[12px] font-medium text-ink-muted mt-1.5 tabular-nums">
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
          {/* Sentence case 13px label per Phase 1 item 4 */}
          <span className="text-[13px] text-ink-muted block mb-1 font-normal">
            Current month's rate
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
