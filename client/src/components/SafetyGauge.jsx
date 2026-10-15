import React from 'react';
import { Award, ShieldCheck, AlertCircle, Clock, Zap, CheckCircle } from 'lucide-react';

export function SafetyGauge({ score = 92, grade = 'Elite Safe Driver', metrics, qualityInfo }) {
  // SVG circular gauge math
  const radius = 80;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Arc covers 260 degrees
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.72);

  let scoreColor = '#10B981'; // Green
  let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (score < 70) {
    scoreColor = '#EF4444'; // Red
    badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  } else if (score < 85) {
    scoreColor = '#F59E0B'; // Amber
    badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  }

  return (
    <div className="rounded-2xl glass-panel p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Actuarial Telematics Rating
            </span>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <span>Monthly FairScore™</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                {grade}
              </span>
            </h3>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Circular Gauge Center */}
        <div className="flex flex-col items-center justify-center my-4 relative">
          <svg height={radius * 2} width={radius * 2} className="rotate-[140deg] transition-all duration-700">
            {/* Background circle track */}
            <circle
              stroke="#1F293D"
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference * 0.72} ${circumference}`}
              style={{ strokeDashoffset: 0 }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
            />
            {/* Value circle arc */}
            <circle
              stroke={scoreColor}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference * 0.72} ${circumference}`}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
            <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">/ 100 PTS</span>
          </div>
        </div>

        {/* Fairness Safeguard Note */}
        <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Monthly Averaging Protection: </span>
            Score is computed over your entire monthly distance. 1 or 2 emergency stops do not change your price.
          </div>
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" /> Smooth Braking
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {metrics?.harshBrakeEvents === 0 ? '100% Gentle' : `${metrics?.harshBrakeEvents || 0} events`}
          </div>
          <div className="text-[10px] text-slate-500">1 free stop forgiven / 150 km</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-medium flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Night Exposure
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {metrics?.nightDistanceKm ? `${metrics.nightDistanceKm} km` : '0 km (Safe)'}
          </div>
          <div className="text-[10px] text-slate-500">12:00 AM – 4:00 AM window</div>
        </div>
      </div>
    </div>
  );
}
