import React, { useState } from 'react';
import { Receipt, DollarSign, ArrowDown, HelpCircle, ChevronDown, ChevronUp, Sparkles, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function PricingReceipt({ quote, isSynced = true }) {
  const [showFormula, setShowFormula] = useState(false);

  const basePrice = quote?.basePremium || 100.0;
  const finalPrice = quote?.finalPremium || 100.0;
  const totalSaved = quote?.totalSaved || Math.max(0, basePrice - finalPrice);
  const discountPct = quote?.discountPercentage || Math.round((totalSaved / basePrice) * 100);

  // Chart data comparing standard market price vs SafeDrive price
  const chartData = [
    { name: 'Standard Market Rate', amount: basePrice, color: '#64748B' },
    { name: 'Your SafeDrive Rate', amount: finalPrice, color: '#10B981' },
  ];

  return (
    <div className="rounded-2xl glass-panel p-6 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Zero Black-Box Pricing
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>ExplainMyPremium™ Receipt</span>
            </h3>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Sync Reminder / Default Notice */}
        {!isSynced && (
          <div className="my-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-semibold">Sync Reminder:</span> No trip log uploaded for this month. The standard $100 price applies with zero discount. Upload your CSV above to unlock discounts!
            </div>
          </div>
        )}

        {/* Big Total Price Banner */}
        <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Your Monthly Premium</div>
            <div className="text-3xl font-extrabold text-white flex items-baseline gap-1 mt-0.5">
              <span className="text-emerald-400">${finalPrice.toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-normal">/ month</span>
            </div>
          </div>

          {totalSaved > 0 ? (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <ArrowDown className="w-3.5 h-3.5" /> Save {discountPct}%
              </span>
              <div className="text-[11px] text-emerald-400/80 font-medium mt-1">
                ${totalSaved.toFixed(2)} total savings
              </div>
            </div>
          ) : (
            <div className="text-right text-xs text-slate-400">
              Base Price Active
            </div>
          )}
        </div>

        {/* Itemized Line Items Table */}
        <div className="space-y-2 my-4">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Itemized Actuarial Breakdown:
          </div>

          {quote?.receiptLines && quote.receiptLines.length > 0 ? (
            quote.receiptLines.map((line, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60"
              >
                <span className="text-slate-300 font-medium">{line.label}</span>
                <span
                  className={`font-mono font-bold ${
                    line.amount < 0
                      ? 'text-emerald-400'
                      : line.amount > 0 && line.type === 'surcharge'
                      ? 'text-rose-400'
                      : 'text-slate-200'
                  }`}
                >
                  {line.amount < 0 ? `-$${Math.abs(line.amount).toFixed(2)}` : line.amount > 0 && line.type === 'surcharge' ? `+$${line.amount.toFixed(2)}` : `$${line.amount.toFixed(2)}`}
                </span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400 py-2">Standard base line items apply.</div>
          )}
        </div>

        {/* Mini Recharts Comparison */}
        <div className="h-24 w-full mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20, top: 0, bottom: 0 }}>
              <XAxis type="number" domain={[0, 120]} hide />
              <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={120} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                formatter={(val) => [`$${val.toFixed(2)}`, 'Premium']}
              />
              <Bar dataKey="amount" radius={[0, 6, 6, 0]} barSize={12}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Formula Transparency Accordion */}
      <div className="pt-3 border-t border-slate-800/80 mt-2">
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-emerald-400 transition"
        >
          <span className="flex items-center gap-1 font-medium">
            <HelpCircle className="w-3.5 h-3.5" /> How this formula was calculated
          </span>
          {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showFormula && (
          <div className="mt-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono space-y-1">
            <div>Final = Base ($100) - MileageReward - NightBonus - SafeHabitsReward - DisputeCredits</div>
            <div className="text-emerald-400">
              • 100% deterministic actuarial math. Zero hidden or trained black-box neural networks.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
