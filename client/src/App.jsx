import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ConsentModal } from './components/ConsentModal';
import { FileUploader } from './components/FileUploader';
import { SafetyGauge } from './components/SafetyGauge';
import { PricingReceipt } from './components/PricingReceipt';
import { TripSimulator } from './components/TripSimulator';
import { TripList } from './components/TripList';
import { DisputeModal } from './components/DisputeModal';
import { UnderwriterView } from './components/UnderwriterView';
import { FallbackPlanCard } from './components/FallbackPlanCard';
import { WhatIfSlider } from './components/WhatIfSlider';
import { ShieldCheck, Info, Car, Award, Sparkles } from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState('driver'); // 'driver' or 'underwriter'
  const [dbStatus, setDbStatus] = useState(null);
  const [consent, setConsent] = useState({ tier: 'TIER_C', autoDeleteDays: 30, fallbackFixed: false });
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTrip, setDisputeTrip] = useState(null);
  const [disputePasses, setDisputePasses] = useState(2);

  // Live insurance & telemetry state
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [metrics, setMetrics] = useState({
    totalDistanceKm: 240,
    nightDistanceKm: 15,
    harshBrakeEvents: 0,
    sharpTurnEvents: 0,
    speedingKm: 10,
  });
  const [scoreData, setScoreData] = useState({
    safetyScore: 94,
    scoreGrade: 'Elite Safe Driver ⭐⭐⭐⭐⭐',
  });
  const [quote, setQuote] = useState({
    basePremium: 100.0,
    mileageDiscount: 7.0,
    nightFactor: 10.0,
    smoothBrakeReward: 16.0,
    disputeCredit: 0.0,
    finalPremium: 67.0,
    totalSaved: 33.0,
    discountPercentage: 33,
    status: 'SYNCED',
    receiptLines: [
      { label: 'Standard Insurer Base Premium', amount: 100.0, type: 'base' },
      { label: 'Low Mileage Reward (240 km)', amount: -7.0, type: 'discount' },
      { label: 'Safe Daytime Driving Bonus', amount: -10.0, type: 'discount' },
      { label: 'SafeScore Habit Reward (94/100)', amount: -16.0, type: 'discount' },
    ],
  });

  // Warm-up database & load initial status on app open
  useEffect(() => {
    async function initApp() {
      try {
        const healthRes = await fetch('/api/health');
        const health = await healthRes.json();
        setDbStatus(health.database);
        if (health.database?.userDisputePasses !== undefined) {
          setDisputePasses(health.database.userDisputePasses);
        }

        const consentRes = await fetch('/api/privacy/consent');
        const consentData = await consentRes.json();
        if (consentData?.consent) setConsent(consentData.consent);

        const summaryRes = await fetch('/api/trips/summary');
        const summaryData = await summaryRes.json();
        if (summaryData?.quote) setQuote(summaryData.quote);
      } catch (err) {
        console.warn('Initial load using offline in-memory fallback:', err.message);
      }
    }
    initApp();
  }, []);

  // Handle uploaded or preset CSV file
  const handleProcessFile = async ({ csvText, filename, presetId }) => {
    try {
      setIsProcessing(true);
      const res = await fetch('/api/trips/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, filename }),
      });
      const data = await res.json();
      setLastResult(data);

      if (data.metrics) setMetrics(data.metrics);
      if (data.scoreData) setScoreData(data.scoreData);
      if (data.quote) setQuote(data.quote);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle real-time interactive sliders
  const handleSimulate = async (sliderMetrics) => {
    try {
      setMetrics(sliderMetrics);
      const res = await fetch('/api/pricing/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sliderMetrics,
          tierOverride: consent.tier,
          fallbackFixed: consent.fallbackFixed,
        }),
      });
      const data = await res.json();
      if (data.scoreData) setScoreData(data.scoreData);
      if (data.quote) setQuote(data.quote);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle consent preferences update
  const handleSaveConsent = async (newConsent) => {
    try {
      const res = await fetch('/api/privacy/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConsent),
      });
      const data = await res.json();
      if (data.consent) {
        setConsent(data.consent);
        // Recalculate quote with new tier
        handleSimulate(metrics);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle dispute submission
  const handleSubmitDispute = async (disputeData) => {
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disputeData),
      });
      const data = await res.json();
      if (data.passesRemaining !== undefined) {
        setDisputePasses(data.passesRemaining);
      }
      // Refresh current quote
      const summaryRes = await fetch('/api/trips/summary');
      const summaryData = await summaryRes.json();
      if (summaryData?.quote) setQuote(summaryData.quote);

      return data;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        dbStatus={dbStatus}
        consent={consent}
        onOpenConsentModal={() => setIsConsentModalOpen(true)}
        disputePasses={disputePasses}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {activeRole === 'driver' ? (
          <>
            {/* Hero Driver Profile Banner */}
            <div className="rounded-2xl glass-panel p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-[1px] flex items-center justify-center shrink-0">
                  <div className="h-full w-full bg-slate-950 rounded-2xl flex items-center justify-center">
                    <Car className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-extrabold text-white">Alex Mercer</h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Tier C Policy Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    2022 Honda City VTEC • Licensed 6 Years • Metropolis Zone
                  </p>
                </div>
              </div>

              {/* Quick Summary Badges */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Base Premium</span>
                  <span className="font-extrabold text-white">$100.00/mo</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Your Price</span>
                  <span className="font-extrabold text-emerald-400">${quote.finalPremium?.toFixed(2)}</span>
                </div>
                <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Free Passes Left</span>
                  <span className="font-extrabold text-cyan-400">{disputePasses} of 2</span>
                </div>
              </div>
            </div>

            {/* 1. Pen Drive CSV Uploader (The Simulated Logger Flow) */}
            <FileUploader
              onProcessFile={handleProcessFile}
              isProcessing={isProcessing}
              lastResult={lastResult}
            />

            {/* 2. Interactive Trip Simulator */}
            <TripSimulator onSimulate={handleSimulate} />

            {/* 3. Safety Score Gauge & ExplainMyPremium Receipt */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SafetyGauge
                score={scoreData.safetyScore}
                grade={scoreData.scoreGrade}
                metrics={metrics}
                qualityInfo={lastResult?.qualityResult}
              />
              <PricingReceipt quote={quote} isSynced={quote.status !== 'DEFAULT_APPLIED (Unsynced Month)'} />
            </div>

            {/* 4. What-If Savings Predictor */}
            <WhatIfSlider currentMetrics={metrics} />

            {/* 5. Recent Trips & Dispute Launcher */}
            <TripList
              onOpenDispute={(trip) => {
                setDisputeTrip(trip);
                setIsDisputeModalOpen(true);
              }}
            />

            {/* 6. Fallback Fixed-Price Plan Option */}
            <FallbackPlanCard
              isFixedActive={consent.fallbackFixed}
              onToggleFixed={() => handleSaveConsent({ ...consent, fallbackFixed: !consent.fallbackFixed })}
            />
          </>
        ) : (
          /* Underwriter View for Hackathon Judges */
          <UnderwriterView
            onDisputeReviewed={async () => {
              const summaryRes = await fetch('/api/trips/summary');
              const summaryData = await summaryRes.json();
              if (summaryData?.quote) setQuote(summaryData.quote);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mt-12 bg-slate-950/60 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SafeDrive IQ • Built for Hackathon PS-008 (Usage-Based Insurance)</span>
          </div>
          <div>
            100% Offline Edge Telematics • Zero Trained Black-Box Models • Cryptographic Tamper Verification
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ConsentModal
        isOpen={isConsentModalOpen}
        onClose={() => setIsConsentModalOpen(false)}
        currentConsent={consent}
        onSaveConsent={handleSaveConsent}
      />

      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        trip={disputeTrip}
        passesRemaining={disputePasses}
        onSubmitDispute={handleSubmitDispute}
      />
    </div>
  );
}
