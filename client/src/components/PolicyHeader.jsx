import React from 'react';

export function PolicyHeader({ driverName = 'Alex Mercer', vehicle = '2022 Honda City VTEC • Licensed 6 Years • Metropolis Zone', tier = 'Tier C', isFixed = false, quote, disputePasses = 2 }) {
  const finalPrice = quote?.finalPremium !== undefined ? quote.finalPremium.toFixed(2) : '67.00';
  const basePrice = quote?.basePremium !== undefined ? quote.basePremium.toFixed(2) : '100.00';

  return (
    <div className="pt-2 pb-6 border-b border-line">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        {/* Policyholder & Vehicle Meta */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-ink tracking-tight">
              {driverName}
            </h1>
            <span className="text-[12px] font-medium px-2.5 py-0.5 rounded-[4px] bg-brand-light text-brand">
              {isFixed ? 'Fixed Policy' : `${tier} Active`}
            </span>
          </div>
          <p className="text-[13px] text-ink-muted mt-1">
            {vehicle}
          </p>
        </div>

        {/* 3 Summary Facts as Clean Horizontal Definition List with Hairlines */}
        <dl className="flex items-stretch divide-x divide-line border border-line rounded-[8px] bg-surface-raised py-2.5 px-1 shadow-soft self-start lg:self-auto overflow-x-auto">
          <div className="px-4 sm:px-5">
            <dt className="text-[11px] text-ink-subtle uppercase tracking-[0.06em] font-medium">
              Standard Base
            </dt>
            <dd className="text-[15px] sm:text-[16px] font-medium text-ink tabular-nums mt-0.5">
              ${basePrice}<span className="text-xs text-ink-subtle font-normal">/mo</span>
            </dd>
          </div>

          <div className="px-4 sm:px-5">
            <dt className="text-[11px] text-brand uppercase tracking-[0.06em] font-medium">
              Your Current Price
            </dt>
            <dd className="text-[15px] sm:text-[16px] font-semibold text-brand tabular-nums mt-0.5">
              ${finalPrice}<span className="text-xs text-brand/70 font-normal">/mo</span>
            </dd>
          </div>

          <div className="px-4 sm:px-5">
            <dt className="text-[11px] text-ink-subtle uppercase tracking-[0.06em] font-medium">
              Free Passes Left
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
