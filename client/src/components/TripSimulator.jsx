import React, { useState } from 'react';
import { Sliders, RotateCcw, TrendingUp, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Slider } from './primitives';

export function TripSimulator({ onSimulate, currentScore = 94, currentQuote }) {
  const [distance, setDistance] = useState(240);
  const [nightKm, setNightKm] = useState(15);
  const [harshBrakes, setHarshBrakes] = useState(0);
  const [speedingKm, setSpeedingKm] = useState(10);
  const [activeScenario, setActiveScenario] = useState('custom');

  const handleApply = (d, n, b, s) => {
    onSimulate({
      totalDistanceKm: Number(d),
      nightDistanceKm: Number(n),
      harshBrakeEvents: Number(b),
      sharpTurnEvents: 0,
      speedingKm: Number(s),
    });
  };

  const handleScenarioChange = (scenarioId) => {
    setActiveScenario(scenarioId);
    let d = distance, n = nightKm, b = harshBrakes, s = speedingKm;

    if (scenarioId === 'smooth') {
      d = 200; n = 5; b = 0; s = 0;
    } else if (scenarioId === 'rush_hour') {
      d = 350; n = 20; b = 2; s = 15;
    } else if (scenarioId === 'night_driving') {
      d = 180; n = 75; b = 4; s = 45;
    }
    setDistance(d);
    setNightKm(n);
    setHarshBrakes(b);
    setSpeedingKm(s);
    handleApply(d, n, b, s);
  };

  const finalPremium = currentQuote?.finalPremium || 67.0;
  const totalSaved = currentQuote?.totalSaved !== undefined ? currentQuote.totalSaved : 33.0;
  const basePremium = currentQuote?.basePremium || 100.0;

  return (
    <section
      aria-label="Risk simulator"
      className="rounded-[10px] bg-surface border border-line p-6 sm:p-7 shadow-soft space-y-6"
    >
      {/* Header with Segmented Scenario Control */}
      <div className="pb-4 border-b border-line flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Actuarial Projection
          </span>
          <h2 className="text-xl font-serif font-normal text-ink">
            Explore how your driving affects your price
          </h2>
          <p className="text-[13px] text-ink-muted mt-1 max-w-xl">
            Simulate mileage and road habits to see real-time recalculations based on deterministic physics.
          </p>
        </div>

        {/* Clean Segmented Control for Quick Scenarios */}
        <div className="flex items-center bg-bg rounded-[6px] p-0.5 border border-line text-xs self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => handleScenarioChange('smooth')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition-colors ${
              activeScenario === 'smooth'
                ? 'bg-surface-raised text-brand shadow-soft font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Smooth Commute
          </button>
          <button
            type="button"
            onClick={() => handleScenarioChange('rush_hour')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition-colors ${
              activeScenario === 'rush_hour'
                ? 'bg-surface-raised text-brand shadow-soft font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Urban Traffic
          </button>
          <button
            type="button"
            onClick={() => handleScenarioChange('night_driving')}
            className={`px-3 py-1.5 rounded-[4px] font-medium transition-colors ${
              activeScenario === 'night_driving'
                ? 'bg-surface-raised text-brand shadow-soft font-semibold'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Late Night
          </button>
        </div>
      </div>

      {/* Main Grid: Sliders on Left, Live Sticky Outcome Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Column */}
        <div className="lg:col-span-7 space-y-6">
          <Slider
            label="Distance Driven"
            sublabel="(monthly volume)"
            value={distance}
            min={20}
            max={1200}
            step={10}
            unit=" km"
            onChange={(val) => {
              setActiveScenario('custom');
              setDistance(val);
              handleApply(val, nightKm, harshBrakes, speedingKm);
            }}
            hint={{ left: '20 km', mid: 'Low mileage benchmark < 500 km', right: '1,200 km' }}
          />

          <Slider
            label="Night Driving"
            sublabel="(12:00 AM – 4:00 AM window)"
            value={nightKm}
            min={0}
            max={200}
            step={5}
            unit=" km"
            onChange={(val) => {
              setActiveScenario('custom');
              setNightKm(val);
              handleApply(distance, val, harshBrakes, speedingKm);
            }}
            hint={{ left: '0 km (Full Bonus)', mid: 'Elevated hazard window', right: '200 km' }}
          />

          <Slider
            label="Harsh Braking Events"
            sublabel="(> 0.4g sudden stops)"
            value={harshBrakes}
            min={0}
            max={10}
            step={1}
            unit={harshBrakes === 1 ? ' stop' : ' stops'}
            onChange={(val) => {
              setActiveScenario('custom');
              setHarshBrakes(val);
              handleApply(distance, nightKm, val, speedingKm);
            }}
            hint={{ left: '0 stops (100% Gentle)', mid: '1 free emergency pass included', right: '10 stops' }}
          />

          <Slider
            label="Over-Limit Speeding"
            sublabel="(exceeding posted limit by > 15 km/h)"
            value={speedingKm}
            min={0}
            max={150}
            step={5}
            unit=" km"
            onChange={(val) => {
              setActiveScenario('custom');
              setSpeedingKm(val);
              handleApply(distance, nightKm, harshBrakes, val);
            }}
            hint={{ left: '0 km (Safe)', right: '150 km' }}
          />
        </div>

        {/* Live Sticky Projected Quote & Score (Visible without scrolling) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-[8px] bg-surface-raised border border-line p-5 shadow-soft space-y-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block">
              Simulated Rate Impact
            </span>

            <div className="flex items-baseline justify-between border-b border-line pb-4">
              <div>
                <span className="text-[12px] text-ink-muted">Projected FairScore</span>
                <div className="font-serif text-3xl font-normal text-brand tabular-nums mt-0.5">
                  {currentScore}
                  <span className="text-xs text-ink-subtle font-normal font-sans ml-1">/ 100</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[12px] text-ink-muted">Projected Premium</span>
                <div className="font-serif text-3xl font-normal text-ink tabular-nums mt-0.5">
                  ${finalPremium.toFixed(2)}
                  <span className="text-xs text-ink-muted font-normal font-sans ml-1">/ mo</span>
                </div>
              </div>
            </div>

            {/* Restrained Savings Highlight */}
            <div className="text-[13px] space-y-2">
              <div className="flex justify-between text-ink-muted">
                <span>Standard baseline rate:</span>
                <span className="tabular-nums">${basePremium.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-brand">
                <span>Projected monthly savings:</span>
                <span className="tabular-nums">-${totalSaved.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-line text-[11px] text-ink-subtle leading-relaxed">
              * Rates update deterministically with each slider adjustment. Real policy changes take effect on your 1st of the month statement.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
