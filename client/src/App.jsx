import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PolicyHeader } from './components/PolicyHeader';
import { HeroFairScore } from './components/HeroFairScore';
import { PricingReceipt } from './components/PricingReceipt';
import { FileUploader } from './components/FileUploader';
import { TripSimulator } from './components/TripSimulator';
import { TripList } from './components/TripList';
import { FallbackPlanCard } from './components/FallbackPlanCard';
import { UnderwriterView } from './components/UnderwriterView';
import { ConsentModal } from './components/ConsentModal';
import { DisputeModal } from './components/DisputeModal';
import { Skeleton } from './components/primitives';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('policy'); // 'policy' | 'trips' | 'underwriter'
  const [dbStatus, setDbStatus] = useState(null);
  const [consent, setConsent] = useState({ tier: 'TIER_C', autoDeleteDays: 30, fallbackFixed: false });
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTrip, setDisputeTrip] = useState(null);
  const [disputePasses, setDisputePasses] = useState(2);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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
    scoreGrade: 'Elite Safe Driver',
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
      { label: 'Standard Insurer Base Rate', amount: 100.0, type: 'base' },
      { label: 'Low Mileage Reward (240 km)', amount: -7.0, type: 'discount' },
      { label: 'Daytime Driving Bonus (Zero midnight hours)', amount: -10.0, type: 'discount' },
      { label: 'SafeHabit Habit Reward (94 FairScore)', amount: -16.0, type: 'discount' },
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
      } finally {
        setIsInitialLoading(false);
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
      const summaryRes = await fetch('/api/trips/summary');
      const summaryData = await summaryRes.json();
      if (summaryData?.quote) setQuote(summaryData.quote);

      return data;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans selection:bg-brand-light selection:text-brand">
      {/* 1. Top Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        consent={consent}
        onOpenConsentModal={() => setIsConsentModalOpen(true)}
        disputePasses={disputePasses}
      />

      {/* Main Content Container (12-column grid, max width 1200px) */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12">
        {isInitialLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-56 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        ) : activeTab === 'policy' ? (
          <>
            {/* 2. Policy Header: Clean horizontal definition list */}
            <PolicyHeader
              driverName="Alex Mercer"
              vehicle="2022 Honda City VTEC • Licensed 6 Years • Metropolis Zone"
              tier={consent.tier === 'TIER_A' ? 'Tier A' : consent.tier === 'TIER_B' ? 'Tier B' : 'Tier C'}
              isFixed={consent.fallbackFixed}
              quote={quote}
              disputePasses={disputePasses}
            />

            {/* 3. Hero: Monthly FairScore & Month's Premium side-by-side in one wide panel */}
            <HeroFairScore
              score={scoreData.safetyScore}
              grade={scoreData.scoreGrade}
              quote={quote}
              metrics={metrics}
              isSynced={quote.status !== 'DEFAULT_APPLIED (Unsynced Month)'}
            />

            {/* 4. "How your price was calculated" (ExplainMyPremium printed receipt style) */}
            <PricingReceipt
              quote={quote}
              isSynced={quote.status !== 'DEFAULT_APPLIED (Unsynced Month)'}
            />

            {/* 5. Trip Upload: Single calm dropzone with collapsible demo scenarios drawer */}
            <FileUploader
              onProcessFile={handleProcessFile}
              isProcessing={isProcessing}
              lastResult={lastResult}
            />

            {/* 6. Risk Simulator: Secondary tool with live sticky cause-and-effect */}
            <TripSimulator
              onSimulate={handleSimulate}
              currentScore={scoreData.safetyScore}
              currentQuote={quote}
            />

            {/* 7. Fallback Fixed-Price Guarantee */}
            <FallbackPlanCard
              isFixedActive={consent.fallbackFixed}
              onToggleFixed={() =>
                handleSaveConsent({ ...consent, fallbackFixed: !consent.fallbackFixed })
              }
            />
          </>
        ) : activeTab === 'trips' ? (
          <>
            {/* Trips & Disputes View */}
            <PolicyHeader
              driverName="Alex Mercer"
              vehicle="2022 Honda City VTEC • Licensed 6 Years • Metropolis Zone"
              tier={consent.tier === 'TIER_A' ? 'Tier A' : consent.tier === 'TIER_B' ? 'Tier B' : 'Tier C'}
              isFixed={consent.fallbackFixed}
              quote={quote}
              disputePasses={disputePasses}
            />

            <TripList
              onOpenDispute={(trip) => {
                setDisputeTrip(trip);
                setIsDisputeModalOpen(true);
              }}
            />

            <FileUploader
              onProcessFile={handleProcessFile}
              isProcessing={isProcessing}
              lastResult={lastResult}
            />
          </>
        ) : (
          /* 8. Underwriter Review view: Professional data workspace */
          <UnderwriterView
            onDisputeReviewed={async () => {
              const summaryRes = await fetch('/api/trips/summary');
              const summaryData = await summaryRes.json();
              if (summaryData?.quote) setQuote(summaryData.quote);
            }}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-line py-8 mt-16 bg-surface text-xs text-ink-muted">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-ink font-medium">
            <div className="w-5 h-5 rounded-[4px] bg-brand text-surface-raised flex items-center justify-center font-serif text-xs font-semibold">
              S
            </div>
            <span className="font-serif text-sm">SafeDrive IQ</span>
            <span className="text-ink-subtle">• Actuarial Usage-Based Insurance</span>
          </div>

          <div className="text-ink-subtle text-center sm:text-right">
            Deterministic rating math • On-device telemetry processing • Cryptographic tamper integrity
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
