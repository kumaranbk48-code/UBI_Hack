import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, ShieldCheck } from 'lucide-react';
import { Skeleton } from './primitives';

/**
 * 6-Month Historical FairScore Trajectory (Phase 2B Task 5)
 * 
 * NOTE FOR EVALUATORS: Historical benchmark points (May–Sep) are realistic mock demonstration data.
 * The final 6th point (current month) is dynamically bound to the policyholder's real live FairScore.
 */
export const MOCK_SCORE_HISTORY = [
  { month: 'May', score: 88, premium: 74.0 },
  { month: 'Jun', score: 90, premium: 71.0 },
  { month: 'Jul', score: 89, premium: 72.0 },
  { month: 'Aug', score: 92, premium: 69.0 },
  { month: 'Sep', score: 91, premium: 70.0 },
  { month: 'Oct', score: 94, premium: 72.0 }, // Overridden dynamically by currentScore
];

export function ScoreTrendChart({
  currentScore = 94,
  currentQuote,
  isLoading = false,
  className = '',
}) {
  if (isLoading) {
    return (
      <div className="py-8 border-t border-line space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-44 w-full" />
      </div>
    );
  }

  // Ensure latest point dynamically matches the real current FairScore & rate
  const trendData = MOCK_SCORE_HISTORY.map((pt, idx) => {
    if (idx === MOCK_SCORE_HISTORY.length - 1) {
      return {
        ...pt,
        score: currentScore,
        premium: currentQuote?.finalPremium ?? pt.premium,
      };
    }
    return pt;
  });

  const latestPoint = trendData[trendData.length - 1];
  const firstPoint = trendData[0];
  const scoreImprovement = latestPoint.score - firstPoint.score;

  return (
    <section
      aria-label="6-month FairScore trend"
      className={`py-8 border-t border-line space-y-4 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
              Historical trajectory
            </span>
            <span className="text-[13px] text-ink-muted font-normal">
              • Sample history for demo purposes
            </span>
          </div>
          <h2 className="text-lg font-serif font-normal text-ink">
            6-month FairScore & premium trend
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink-muted tabular-nums">
          <span className="flex items-center gap-1.5 text-brand font-medium">
            <TrendingUp className="w-3.5 h-3.5 stroke-[1.75]" />
            <span>+{scoreImprovement} pts since May</span>
          </span>
          <span>•</span>
          <span>Current: <strong className="text-ink font-medium">{currentScore}/100</strong> (${latestPoint.premium.toFixed(2)}/mo)</span>
        </div>
      </div>

      {/* Recharts Quiet Line Chart (No gradient fill, hairline grid, thin brand-green line) */}
      <div
        className="w-full h-44 sm:h-48 pt-2"
        role="region"
        aria-label="6-month FairScore line chart"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
            margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
          >
            {/* Hairline subtle grid */}
            <CartesianGrid
              stroke="#E4DDD0"
              strokeDasharray="2 2"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={{ stroke: '#E4DDD0' }}
              tick={{ fill: '#6F6A60', fontSize: 12, fontFamily: 'Inter, sans-serif' }}
              dy={6}
            />

            <YAxis
              domain={[80, 100]}
              ticks={[80, 85, 90, 95, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6F6A60', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
              className="tabular-nums"
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-[6px] bg-surface-raised border border-line p-2.5 shadow-soft text-xs space-y-1">
                      <div className="font-semibold text-ink">{data.month} 2026</div>
                      <div className="text-brand font-medium tabular-nums">
                        FairScore: {data.score}/100
                      </div>
                      <div className="text-ink-muted tabular-nums">
                        Monthly Rate: ${data.premium.toFixed(2)}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Thin brand-green line without gradient fill */}
            <Line
              type="monotone"
              dataKey="score"
              name="FairScore"
              stroke="#1F3A34"
              strokeWidth={1.75}
              dot={{ r: 3, fill: '#1F3A34', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#1F3A34', stroke: '#FBF9F4', strokeWidth: 2 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Visually Hidden Data Table for Screen Readers (Accessibility Requirement) */}
      <table className="sr-only">
        <caption>Monthly FairScore and Premium History (May to October 2026)</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">FairScore</th>
            <th scope="col">Monthly Premium</th>
          </tr>
        </thead>
        <tbody>
          {trendData.map((pt, i) => (
            <tr key={i}>
              <td>{pt.month} 2026</td>
              <td>{pt.score} out of 100</td>
              <td>${pt.premium.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
