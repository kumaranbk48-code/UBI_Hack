import React from 'react';
import { Skeleton } from './primitives';

export function PolicyHeader({
  driverName = 'Alex Mercer',
  vehicle = '2022 Honda City VTEC • Licensed 6 Years • Metropolis Zone',
  tier = 'Tier C',
  isFixed = false,
  quote,
  disputePasses = 2,
  isLoading = false,
}) {
  const finalPrice = quote?.finalPremium !== undefined ? quote.finalPremium.toFixed(2) : null;
  const basePrice = quote?.basePremium !== undefined ? quote.basePremium.toFixed(2) : null;

  return (
    <div className="pt-2 pb-6 border-b border-line">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        {/* Policyholder & Vehicle Meta */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-ink tracking-tight">
              {driverName}
            </h1>
            {/* Plain text, not a chip per Phase 1 item 5 */}
            <span className="text-[13px] text-ink-muted font-normal">
              • {isFixed ? 'Fixed Policy' : `${tier} Active`}
            </span>
          </div>
          <p className="text-[13px] text-ink-muted mt-1">
            {vehicle}
          </p>
        </div>

        {/* 3 Summary Facts as Open Horizontal List with Vertical Hairline Dividers (no boxed card) */}
        <dl className="flex items-stretch divide-x divide-line py-1 self-start lg:self-auto overflow-x-auto">
          <div className="px-4 sm:px-6 first:pl-0">
            {/* Sentence case, 13px, --ink-muted per Phase 1 item 4 */}
            <dt className="text-[13px] text-ink-muted font-normal">
              Standard base
            </dt>
            <dd className="text-[15px] sm:text-[16px] font-medium text-ink tabular-nums mt-0.5 min-w-[70px]">
              {!isLoading && basePrice ? (
                <>${basePrice}<span className="text-xs text-ink-subtle font-normal">/mo</span></>
              ) : (
                <Skeleton className="h-5 w-16 mt-0.5" />
              )}
            </dd>
          </div>

          <div className="px-4 sm:px-6">
            {/* Sentence case, 13px, --ink-muted per Phase 1 item 4 */}
            <dt className="text-[13px] text-ink-muted font-normal">
              Your current price
            </dt>
            <dd className="text-[15px] sm:text-[16px] font-semibold text-brand tabular-nums mt-0.5 min-w-[70px]">
              {!isLoading && finalPrice ? (
                <>${finalPrice}<span className="text-xs text-brand/70 font-normal">/mo</span></>
              ) : (
                <Skeleton className="h-5 w-16 mt-0.5" />
              )}
            </dd>
          </div>

          <div className="px-4 sm:px-6 last:pr-0">
            {/* Sentence case, 13px, --ink-muted per Phase 1 item 4 */}
            <dt className="text-[13px] text-ink-muted font-normal">
              Free passes left
            </dt>
            <dd className="text-[15px] sm:text-[16px] font-medium text-ink tabular-nums mt-0.5">
              {disputePasses} <span className="text-xs text-ink-subtle font-normal">of 2</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
