import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, TrendingUp, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Slider } from './primitives';
import { computeTopTip } from '../data/scoringEngine';

export function TripSimulator({
  onSimulate,
  currentScore = 94,
  currentQuote,
  actualMetrics = { totalDistanceKm: 240, nightDistanceKm: 15, harshBrakeEvents: 0, speedingKm: 10 },
  actualQuote,
  consent = { tier: 'TIER_C' },
}) {
  const actualDistance = actualMetrics?.totalDistanceKm ?? 240;
  const actualNight = actualMetrics?.nightDistanceKm ?? 15;
  const actualBrakes = actualMetrics?.harshBrakeEvents ?? 0;
  const actualSpeeding = actualMetrics?.speedingKm ?? 10;

  const [distance, setDistance] = useState(actualDistance);
  const [nightKm, setNightKm] = useState(actualNight);
  const [harshBrakes, setHarshBrakes] = useState(actualBrakes);
  const [speedingKm, setSpeedingKm] = useState(actualSpeeding);
  const [activeScenario, setActiveScenario] = useState('custom');

  // Sync if actualMetrics changes from an uploaded CSV log
  useEffect(() => {
    setDistance(actualDistance);
    setNightKm(actualNight);
    setHarshBrakes(actualBrakes);
    setSpeedingKm(actualSpeeding);
    setActiveScenario('custom');
  }, [actualDistance, actualNight, actualBrakes, actualSpeeding]);

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

  // Check if current slider state differs from actual driving telemetry
  const isChanged =
    distance !== actualDistance ||
    nightKm !== actualNight ||
    harshBrakes !== actualBrakes ||
    speedingKm !== actualSpeeding;

  const handleResetToActual = () => {
    setActiveScenario('custom');
    setDistance(actualDistance);
    setNightKm(actualNight);
    setHarshBrakes(actualBrakes);
    setSpeedingKm(actualSpeeding);
    handleApply(actualDistance, actualNight, actualBrakes, actualSpeeding);
  };

  const actualPrice = actualQuote?.finalPremium ?? 67.0;
  const finalPremium = currentQuote?.finalPremium ?? 67.0;
  const priceDiff = Math.round((finalPremium - actualPrice) * 100) / 100;

  const totalSaved = currentQuote?.totalSaved !== undefined ? currentQuote.totalSaved : 33.0;
  const basePremium = currentQuote?.basePremium || 100.0;

  // Compute top opportunity tip by calling existing pricing calculation with 1 slider reduced at a time
  const topTip = computeTopTip(
    {
      totalDistanceKm: distance,
      nightDistanceKm: nightKm,
      harshBrakeEvents: harshBrakes,
      sharpTurnEvents: 0,
      speedingKm: speedingKm,
    },
    consent
  );

  return (
    <section
      aria-label="Price simulator"
      className="py-12 border-t border-line space-y-6"
    >
      {/* Header with Segmented Scenario Control */}
      <div className="pb-4 border-b border-line flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          {/* Eyebrow: plain words per Phase 1 item 6 */}
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Price simulator
          </span>
          <h2 className="text-xl font-serif font-normal text-ink">
            Explore how your driving affects your price
          </h2>
          {/* Plain language subtitle per Phase 1 item 6 */}
          <p className="text-[13px] text-ink-muted mt-1 max-w-xl">
            See how mileage and road habits change your monthly price.
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
            hint={{ left: '20 km', right: '1,200 km' }}
            caption="Standard baseline is under 500 km per month."
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
            hint={{ left: '0 km (full bonus)', right: '200 km' }}
            caption="Midnight driving (12:00 AM – 4:00 AM) carries higher collision risk."
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
            hint={{ left: '0 stops (gentle)', right: '10 stops' }}
            /* Single clearly styled caption per Phase 1 item 7 */
            caption="1 free emergency pass is automatically forgiven under your policy."
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
            hint={{ left: '0 km (safe)', right: '150 km' }}
            caption="Driving within posted speed limits unlocks maximum safety rewards."
          />

          {/* Reset to actual driving text button per Phase 2A task 1 */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              disabled={!isChanged}
              onClick={handleResetToActual}
              className="inline-flex items-center gap-1.5 text-[12px] text-ink-muted hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed transition-colors underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded-[2px]"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Reset to my actual driving</span>
            </button>
            {isChanged && (
              <span className="text-[11px] text-ink-subtle">
                Simulation active
              </span>
            )}
          </div>
        </div>

        {/* Live Sticky Projected Quote & Score (Kept as panel per Phase 1 item 5) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="rounded-[8px] bg-surface-raised border border-line p-5 shadow-soft space-y-4">
            {/* Sentence case 13px --ink-muted label per Phase 1 item 4 */}
            <span className="text-[13px] text-ink-muted block font-normal">
              Simulated rate impact
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
                <span className="text-[12px] text-ink-muted">Projected premium</span>
                <div className="font-serif text-3xl font-normal text-ink tabular-nums mt-0.5">
                  ${finalPremium.toFixed(2)}
                  <span className="text-xs text-ink-muted font-normal font-sans ml-1">/ mo</span>
                </div>
                {/* Comparison vs actual current price per Phase 2A task 1 */}
                <div className="text-[11px] tabular-nums mt-1 font-medium">
                  {priceDiff < 0 ? (
                    <span className="text-status-positive">
                      ${actualPrice.toFixed(2)} now → ${finalPremium.toFixed(2)} with this change (-${Math.abs(priceDiff).toFixed(2)})
                    </span>
                  ) : priceDiff > 0 ? (
                    <span className="text-status-warning">
                      ${actualPrice.toFixed(2)} now → ${finalPremium.toFixed(2)} with this change (+${priceDiff.toFixed(2)})
                    </span>
                  ) : (
                    <span className="text-ink-muted font-normal">
                      ${actualPrice.toFixed(2)} now (unchanged)
                    </span>
                  )}
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

            {/* Top Opportunity Tip per Phase 2A task 2 */}
            <div className="pt-3 border-t border-line text-[12px] leading-relaxed">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-accent stroke-[1.75]" />
                <span className="text-ink font-normal">
                  {topTip.text}
                </span>
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
