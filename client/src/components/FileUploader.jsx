import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, XCircle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samplePresets';

export function FileUploader({ onProcessFile, isProcessing, lastResult }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelected(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      onProcessFile({ csvText, filename: file.name });
    };
    reader.readAsText(file);
  };

  const handleLoadPreset = async (preset) => {
    setSelectedFile(preset.filename);
    try {
      // Fetch sample CSV from server endpoint or fallback to simulated payload
      const res = await fetch('/api/trips/samples');
      const data = await res.json();
      if (data?.samples && data.samples[preset.filename]) {
        onProcessFile({ csvText: data.samples[preset.filename], filename: preset.filename, presetId: preset.id });
      } else {
        // Fallback request
        onProcessFile({ filename: preset.filename, presetId: preset.id });
      }
    } catch (e) {
      onProcessFile({ filename: preset.filename, presetId: preset.id });
    }
  };

  return (
    <div className="w-full rounded-2xl glass-panel p-6 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Pen-Drive Sync Station
            </span>
            <span className="text-xs text-slate-400">• Simulated Logger Flow</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Upload Car Trip Log (CSV)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dongle saves trip records to CSV. Plug into your laptop and drop the file below.
          </p>
        </div>

        {selectedFile && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-300 font-mono">{selectedFile}</span>
          </div>
        )}
      </div>

      {/* 1-Click Judge Demo Presets */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Judge 1-Click Test Scenarios:</span>
          </label>
          <span className="text-[11px] text-slate-500">Instant offline test logs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleLoadPreset(preset)}
              disabled={isProcessing}
              className={`p-3 rounded-xl border text-left transition-all relative group overflow-hidden ${
                preset.id === 'smooth_commuter'
                  ? 'border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500 hover:bg-emerald-900/30'
                  : preset.id === 'aggressive_night'
                  ? 'border-rose-500/30 bg-rose-950/20 hover:border-rose-500 hover:bg-rose-900/30'
                  : preset.id === 'tampered_signature'
                  ? 'border-amber-500/30 bg-amber-950/20 hover:border-amber-500 hover:bg-amber-900/30'
                  : 'border-blue-500/30 bg-blue-950/20 hover:border-blue-500 hover:bg-blue-900/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                  {preset.badge}
                </span>
              </div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                {preset.name}
              </div>
              <div className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                {preset.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragOver
            ? 'border-emerald-400 bg-emerald-500/10'
            : 'border-slate-700/80 bg-slate-950/40 hover:border-slate-600'
        }`}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <div className="p-3 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 shadow-lg">
            {isProcessing ? (
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-200">
              {isProcessing ? 'Verifying & Scoring Logs...' : 'Drop your car CSV trip file here'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              or click to browse from USB drive
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Supported columns: timestamp, speed_kmh, accel_g_longitudinal, accel_g_lateral, odometer_km, signature
          </span>
        </div>
      </div>

      {/* Validation Result Banner (if available) */}
      {lastResult && (
        <div className="mt-4 p-3.5 rounded-xl border transition-all text-xs">
          {lastResult.tamperResult?.status === 'SIGNATURE_MISMATCH' ? (
            <div className="flex items-start gap-2.5 text-rose-300 bg-rose-950/40 border-rose-500/40 p-3 rounded-lg border">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-200">HMAC Cryptographic Tamper Alert</div>
                <div>{lastResult.tamperResult.message}</div>
                <div className="text-[11px] text-rose-400 mt-1">
                  File rejected from insurer record. Drivers cannot edit CSV numbers in Excel/Notepad.
                </div>
              </div>
            </div>
          ) : lastResult.tamperResult?.status === 'ODOMETER_GAP' ? (
            <div className="flex items-start gap-2.5 text-blue-300 bg-blue-950/40 border-blue-500/40 p-3 rounded-lg border">
              <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-blue-200">Unmonitored Kilometres Gap Detected</div>
                <div>{lastResult.tamperResult.odometerCheck?.message}</div>
                <div className="text-[11px] text-blue-400 mt-1">
                  Marked as "Needs Review" rather than an accusation.
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-emerald-300 bg-emerald-950/30 border-emerald-500/30 p-2.5 rounded-lg border">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold">
                  HMAC Signatures Verified • {lastResult.qualityResult?.summary}
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                {lastResult.qualityResult?.confidenceBadge} Confidence
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
