import React, { useState } from 'react';
import { Sliders, Play, RotateCcw, Zap, Clock, Gauge, Car } from 'lucide-react';

export function TripSimulator({ onSimulate, isSimulating }) {
  const [distance, setDistance] = useState(240);
  const [nightKm, setNightKm] = useState(15);
  const [harshBrakes, setHarshBrakes] = useState(0);
  const [speedingKm, setSpeedingKm] = useState(10);

  const handleApply = (d = distance, n = nightKm, b = harshBrakes, s = speedingKm) => {
    onSimulate({
      totalDistanceKm: Number(d),
      nightDistanceKm: Number(n),
      harshBrakeEvents: Number(b),
      sharpTurnEvents: 0,
      speedingKm: Number(s),
    });
  };

  const setPreset = (presetName) => {
    if (presetName === 'smooth') {
      setDistance(200);
      setNightKm(5);
      setHarshBrakes(0);
      setSpeedingKm(0);
      handleApply(200, 5, 0, 0);
    } else if (presetName === 'rush_hour') {
      setDistance(350);
      setNightKm(20);
      setHarshBrakes(2);
      setSpeedingKm(15);
      handleApply(350, 20, 2, 15);
    } else if (presetName === 'aggressive_night') {
      setDistance(150);
      setNightKm(80);
      setHarshBrakes(5);
      setSpeedingKm(60);
      handleApply(150, 80, 5, 60);
    }
  };

  return (
    <div className="rounded-2xl glass-panel p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Interactive Trip & Risk Simulator
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Judge Sandbox
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Drag sliders or click quick test scenarios to watch the SafeScore and Premium recalculate at 60 FPS.
            </p>
          </div>
        </div>

        {/* Quick Simulator Preset Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => setPreset('smooth')}
            className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
          >
            🟢 Smooth
          </button>
          <button
            onClick={() => setPreset('rush_hour')}
            className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
          >
            🟡 Traffic
          </button>
          <button
            onClick={() => setPreset('aggressive_night')}
            className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
          >
            🔴 Late Night
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {/* Slider 1: Distance */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Car className="w-3.5 h-3.5 text-blue-400" /> Distance Driven
            </span>
            <span className="text-cyan-400 font-mono font-bold">{distance} km</span>
          </div>
          <input
            type="range"
            min="20"
            max="1200"
            step="10"
            value={distance}
            onChange={(e) => {
              const val = Number(e.target.value);
              setDistance(val);
              handleApply(val, nightKm, harshBrakes, speedingKm);
            }}
            className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>20 km</span>
            <span>Low mileage &lt;500km</span>
            <span>1200 km</span>
          </div>
        </div>

        {/* Slider 2: Night Driving */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Night Driving (12-4 AM)
            </span>
            <span className="text-indigo-400 font-mono font-bold">{nightKm} km</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="5"
            value={nightKm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setNightKm(val);
              handleApply(distance, val, harshBrakes, speedingKm);
            }}
            className="w-full accent-indigo-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0 km (Safe)</span>
            <span>High Risk &gt;50km</span>
          </div>
        </div>

        {/* Slider 3: Hard Brakes */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Hard Brakes (&gt;0.4g)
            </span>
            <span className="text-amber-400 font-mono font-bold">{harshBrakes} stops</span>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={harshBrakes}
            onChange={(e) => {
              const val = Number(e.target.value);
              setHarshBrakes(val);
              handleApply(distance, nightKm, val, speedingKm);
            }}
            className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0 stops</span>
            <span>1 free pass buffer</span>
            <span>12 stops</span>
          </div>
        </div>

        {/* Slider 4: Speeding */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300 font-semibold flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-rose-400" /> Over-Limit Speeding
            </span>
            <span className="text-rose-400 font-mono font-bold">{speedingKm} km</span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={speedingKm}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSpeedingKm(val);
              handleApply(distance, nightKm, harshBrakes, val);
            }}
            className="w-full accent-rose-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>0 km</span>
            <span>&gt;75 km/h limit</span>
            <span>150 km</span>
          </div>
        </div>
      </div>
    </div>
  );
}
