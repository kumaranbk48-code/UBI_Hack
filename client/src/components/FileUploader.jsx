import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, ChevronDown, ChevronUp, HelpCircle, Loader2, Play } from 'lucide-react';
import { SAMPLE_PRESETS } from '../data/samplePresets';
import { Button, Alert, StatusDot } from './primitives';
import { PROTOTYPE_PRIVACY_NOTE } from '../data/privacyCopy';

export function FileUploader({ onProcessFile, isProcessing, lastResult, lastVerifiedDate }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFormatHelp, setShowFormatHelp] = useState(false);
  const [showDemoScenarios, setShowDemoScenarios] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
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
      const res = await fetch('/api/trips/samples');
      const data = await res.json();
      if (data?.samples && data.samples[preset.filename]) {
        onProcessFile({ csvText: data.samples[preset.filename], filename: preset.filename, presetId: preset.id });
      } else {
        onProcessFile({ filename: preset.filename, presetId: preset.id });
      }
    } catch (e) {
      onProcessFile({ filename: preset.filename, presetId: preset.id });
    }
  };

  const tamperStatus = lastResult?.tamperResult?.status;

  return (
    <section
      aria-label="Upload car trip log"
      className="py-12 border-t border-line space-y-6"
    >
      {/* Top Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          {/* Eyebrow: plain words per Phase 1 item 6 */}
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Trip upload
          </span>
          <h2 className="text-xl font-serif font-normal text-ink">
            Upload driving records
          </h2>
          <p className="text-[13px] text-ink-muted mt-1 max-w-2xl leading-relaxed">
            {PROTOTYPE_PRIVACY_NOTE}
          </p>
        </div>

        {/* Evaluator Demo Scenarios Toggle */}
        <button
          type="button"
          onClick={() => setShowDemoScenarios(!showDemoScenarios)}
          aria-expanded={showDemoScenarios}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium text-ink-muted hover:text-ink bg-surface-raised border border-line hover:border-line-dark transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand"
        >
          <span>Demo scenarios (for evaluators)</span>
          {showDemoScenarios ? (
            <ChevronUp className="w-3.5 h-3.5 text-ink-subtle" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-ink-subtle" />
          )}
        </button>
      </div>

      {/* Collapsible Demo Scenarios Drawer for Evaluators */}
      {showDemoScenarios && (
        <div className="rounded-[8px] bg-surface-raised border border-line p-4 sm:p-5 space-y-5 animate-fadeIn">
          {/* 3-Step Guided Walkthrough Path (Phase 2B Task 8) */}
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand block mb-0.5">
                Guided Evaluator Walkthrough
              </span>
              <h3 className="font-serif text-base font-normal text-ink">
                3-step evaluation path
              </h3>
              <p className="text-[12px] text-ink-muted mt-0.5">
                Step through the core scenarios to evaluate clean actuarial pricing, non-accusatory gap handling, and cryptographic tamper detection.
              </p>
            </div>

            <div className="divide-y divide-line/70 border border-line rounded-[6px] bg-bg overflow-hidden">
              {/* Step 1: Normal file */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface/60 transition-colors">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand text-surface-raised flex items-center justify-center text-[11px] font-semibold shrink-0">
                      1
                    </span>
                    <span className="text-[13px] font-medium text-ink">Normal file</span>
                    <StatusDot status="positive" label="Clean Drive" />
                  </div>
                  <p className="text-[12px] text-ink-muted pl-7 line-clamp-1">
                    Verified commute with gentle braking and zero night hours. Earns maximum FairScore discounts.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  disabled={isProcessing}
                  onClick={() => {
                    const preset = SAMPLE_PRESETS.find((p) => p.id === 'smooth_commuter');
                    if (preset) handleLoadPreset(preset);
                  }}
                  className="self-end sm:self-center min-h-[36px] text-xs px-3 whitespace-nowrap"
                >
                  Try this
                </Button>
              </div>

              {/* Step 2: File with odometer gap */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface/60 transition-colors">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand text-surface-raised flex items-center justify-center text-[11px] font-semibold shrink-0">
                      2
                    </span>
                    <span className="text-[13px] font-medium text-ink">File with odometer gap</span>
                    <StatusDot status="warning" label="Review Flag" />
                  </div>
                  <p className="text-[12px] text-ink-muted pl-7 line-clamp-1">
                    A large stretch with no data driven with unplugged dongle; flags non-accusatory review rather than penalizing.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isProcessing}
                  onClick={() => {
                    const preset = SAMPLE_PRESETS.find((p) => p.id === 'odometer_gap');
                    if (preset) handleLoadPreset(preset);
                  }}
                  className="self-end sm:self-center min-h-[36px] text-xs px-3 whitespace-nowrap"
                >
                  Try this
                </Button>
              </div>

              {/* Step 3: Tampered file */}
              <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface/60 transition-colors">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand text-surface-raised flex items-center justify-center text-[11px] font-semibold shrink-0">
                      3
                    </span>
                    <span className="text-[13px] font-medium text-ink">Tampered file</span>
                    <StatusDot status="danger" label="Signature Mismatch" />
                  </div>
                  <p className="text-[12px] text-ink-muted pl-7 line-clamp-1">
                    Manual speed edits in Excel detected via cryptographic HMAC-SHA256 signature mismatch.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isProcessing}
                  onClick={() => {
                    const preset = SAMPLE_PRESETS.find((p) => p.id === 'tampered_signature');
                    if (preset) handleLoadPreset(preset);
                  }}
                  className="self-end sm:self-center min-h-[36px] text-xs px-3 whitespace-nowrap"
                >
                  Try this
                </Button>
              </div>
            </div>
          </div>

          {/* All sample telemetry logs */}
          <div className="pt-3 border-t border-line space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium text-ink-muted">
                All sample telemetry logs
              </span>
              <span className="text-[11px] text-ink-subtle">
                Click any scenario to simulate processing
              </span>
            </div>

            <div className="divide-y divide-line/70">
              {SAMPLE_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-bg/60 px-2 rounded-[4px] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-ink">{preset.name}</span>
                      <span className="text-[11px] text-ink-subtle tabular-nums font-mono">
                        ({preset.filename})
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-muted mt-0.5 line-clamp-1">
                      {preset.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <StatusDot
                      status={
                        preset.id === 'smooth_commuter'
                          ? 'positive'
                          : preset.id === 'aggressive_night'
                          ? 'warning'
                          : preset.id === 'tampered_signature'
                          ? 'danger'
                          : 'info'
                      }
                      label={preset.badge}
                    />

                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={isProcessing}
                      onClick={() => handleLoadPreset(preset)}
                      className="min-h-[32px] text-xs px-2.5"
                    >
                      Load
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Calm Single Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-[8px] border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-brand bg-brand-light/30'
            : 'border-line-dark/70 bg-surface-raised hover:border-ink-subtle'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-ink-muted">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand" />
            ) : (
              <UploadCloud className="w-5 h-5 stroke-[1.5]" />
            )}
          </div>

          <div>
            <h3 className="font-serif text-lg font-normal text-ink">
              {isProcessing ? 'Verifying telemetry signatures...' : 'Drop your trip file here'}
            </h3>
            <p className="text-[13px] text-ink-muted mt-1">
              or browse from your local drive to process this month's driving record
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="relative pt-1">
            <Button
              variant="primary"
              size="md"
              disabled={isProcessing}
              onClick={() => document.getElementById('csvFileInput')?.click()}
            >
              Choose file
            </Button>
            <input
              id="csvFileInput"
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="sr-only"
            />
          </div>

          {selectedFile && (
            <div className="pt-2 flex items-center gap-1.5 text-xs text-ink-muted">
              <FileText className="w-3.5 h-3.5 text-ink-subtle" />
              <span>Selected: <strong className="text-ink font-mono">{selectedFile}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Format Help Disclosure */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowFormatHelp(!showFormatHelp)}
          className="text-[12px] text-ink-muted hover:text-ink inline-flex items-center gap-1.5 focus-visible:outline-none"
        >
          <HelpCircle className="w-3.5 h-3.5 text-ink-subtle stroke-[1.5]" />
          <span>Supported CSV format requirements</span>
          {showFormatHelp ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showFormatHelp && (
          <div className="mt-2.5 p-3 rounded-[6px] bg-bg border border-line text-[12px] text-ink-muted space-y-1 font-mono tabular-nums leading-relaxed">
            <div>Expected columns: timestamp, speed_kmh, accel_g_longitudinal, accel_g_lateral, odometer_km, signature</div>
            <div className="text-ink-subtle font-sans text-[11px] pt-1">
              * Files generated by registered SafeDrive OBD loggers include a SHA-256 HMAC for mathematical integrity verification.
            </div>
          </div>
        )}
      </div>

      {/* Calm, Respectful Inline Alerts for Verification Results */}
      {lastResult && (
        <div className="pt-2">
          {tamperStatus === 'SIGNATURE_MISMATCH' ? (
            <Alert
              variant="danger"
              title="File could not be verified"
            >
              <div>
                The cryptographic signature in this file could not be reconciled with the vehicle hardware record. This typically occurs when a CSV is modified in spreadsheet editors.
              </div>
              <div className="text-xs text-ink-muted mt-2">
                <strong>Next step:</strong> Re-export the file from your device or contact support.
              </div>
              {lastVerifiedDate && (
                <div className="text-[11px] text-ink-subtle mt-1.5 tabular-nums">
                  Last verified: {lastVerifiedDate}
                </div>
              )}
            </Alert>
          ) : tamperStatus === 'ODOMETER_GAP' ? (
            <Alert
              variant="warning"
              title="Unmonitored distance noticed"
            >
              <div>
                We noticed {lastResult.tamperResult?.odometerCheck?.gapKm !== undefined ? `${Math.round(lastResult.tamperResult.odometerCheck.gapKm)} km` : 'a stretch'} with no data. This is usually an unplugged device. Confirm or add a note.
              </div>
              <div className="text-xs text-ink-subtle mt-1.5">
                Odometer discontinuity: {lastResult.tamperResult?.odometerCheck?.message}. You may submit an explanation via the Trips tab.
              </div>
            </Alert>
          ) : (
            <Alert
              variant="positive"
              title="Driving records verified"
            >
              <div>
                HMAC signatures confirmed. {lastResult.qualityResult?.summary || 'All trip entries successfully integrated.'}
              </div>
              {lastResult.qualityResult?.confidenceBadge && (
                <div className="text-xs text-ink-subtle mt-1">
                  Data quality rating: {lastResult.qualityResult.confidenceBadge} confidence • Processed locally
                </div>
              )}
            </Alert>
          )}
        </div>
      )}
    </section>
  );
}
