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
import { ScoreTrendChart } from './components/ScoreTrendChart';
import { DevicePrivacySection } from './components/DevicePrivacySection';
import { Skeleton, Alert, Button } from './components/primitives';
import { ShieldCheck } from 'lucide-react';
import { PROTOTYPE_PRIVACY_SHORT } from './data/privacyCopy';

export default function App() {
  const [activeTab, setActiveTab] = useState('policy'); // 'policy' | 'trips' | 'underwriter'
  const [dbStatus, setDbStatus] = useState(null);
  const [consent, setConsent] = useState({ tier: 'TIER_C', autoDeleteDays: 30, fallbackFixed: false });
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeTrip, setDisputeTrip] = useState(null);
  const [disputePasses, setDisputePasses] = useState(2);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);
  const [lastVerifiedDate, setLastVerifiedDate] = useState('Sample baseline (no upload yet)');

  // Live insurance & telemetry state (null until real API data arrives)
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  // Actual driver baseline (for comparisons and reset)
  const [actualMetrics, setActualMetrics] = useState(null);
  const [actualQuote, setActualQuote] = useState(null);

  // Simulated metrics and quote
  const [metrics, setMetrics] = useState(null);
  const [scoreData, setScoreData] = useState(null);
  const [quote, setQuote] = useState(null);

  // Warm-up database & load initial status on app open
  const initApp = async () => {
    try {
      setIsInitialLoading(true);
      setInitialError(null);

      const healthRes = await fetch('/api/health');
      if (!healthRes.ok) throw new Error('Health check failed');
      const health = await healthRes.json();
      setDbStatus(health.database);
      if (health.database?.userDisputePasses !== undefined) {
        setDisputePasses(health.database.userDisputePasses);
      }

      const consentRes = await fetch('/api/privacy/consent');
      if (consentRes.ok) {
        const consentData = await consentRes.json();
        if (consentData?.consent) setConsent(consentData.consent);
      }

      const summaryRes = await fetch('/api/trips/summary');
      if (!summaryRes.ok) throw new Error('Failed to load trip summary');
      const summaryData = await summaryRes.json();
      if (summaryData?.quote) {
        setQuote(summaryData.quote);
        setActualQuote(summaryData.quote);
      }
      if (summaryData?.summary) {
        setMetrics(summaryData.summary);
        setActualMetrics(summaryData.summary);
      }
      if (summaryData?.scoreData) {
        setScoreData(summaryData.scoreData);
      } else if (summaryData?.summary?.safetyScore) {
        setScoreData({
          safetyScore: summaryData.summary.safetyScore,
          scoreGrade: summaryData.summary.safetyScore >= 90 ? 'Elite Safe Driver' : 'Careful Driver',
        });
      }
      if (summaryData?.summary?.createdAt) {
        const d = new Date(summaryData.summary.createdAt);
        setLastVerifiedDate(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      } else {
        setLastVerifiedDate('Sample baseline (no upload yet)');
      }
    } catch (err) {
      console.warn('Initial load error:', err.message);
      setInitialError('Unable to connect to the pricing and telemetry service. Please ensure the local server is running.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
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

      const isRejected = data.tamperResult?.status === 'SIGNATURE_MISMATCH' || data.tamperResult?.isValid === false;

      // Trust Rule (Phase 3 Task 1): Tampered file must NEVER update hero, receipt, trend chart or policy summary.
      // Retain last verified state.
      if (!isRejected) {
        if (data.metrics) {
          setMetrics(data.metrics);
          setActualMetrics(data.metrics);
        }
        if (data.scoreData) setScoreData(data.scoreData);
        if (data.quote) {
          setQuote(data.quote);
          setActualQuote(data.quote);
        }
        setLastVerifiedDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
      }
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
        {initialError && !actualQuote ? (
          <div className="py-16 max-w-lg mx-auto space-y-4 text-center">
            <Alert variant="danger" title="Service connection unavailable">
              {initialError}
            </Alert>
            <Button
              variant="primary"
              size="md"
              onClick={initApp}
            >
              Try again
            </Button>
          </div>
        ) : isInitialLoading || !actualQuote ? (
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
              quote={actualQuote}
              disputePasses={disputePasses}
            />

            {/* 3. Hero: Monthly FairScore & Month's Premium side-by-side in one wide panel */}
            <HeroFairScore
              score={scoreData.safetyScore}
              grade={scoreData.scoreGrade}
              quote={actualQuote}
              metrics={actualMetrics}
              isSynced={actualQuote.status !== 'DEFAULT_APPLIED (Unsynced Month)'}
            />

            {/* 4. 6-Month Historical FairScore & Premium Trajectory (Phase 2B Task 5) */}
            <ScoreTrendChart
              currentScore={scoreData.safetyScore}
              currentQuote={actualQuote}
            />

            {/* 5. "How your price was calculated" (ExplainMyPremium printed receipt style) */}
            <PricingReceipt
              quote={actualQuote}
              isSynced={actualQuote.status !== 'DEFAULT_APPLIED (Unsynced Month)'}
            />

            {/* 5. Trip Upload: Single calm dropzone with collapsible demo scenarios drawer */}
            <FileUploader
              onProcessFile={handleProcessFile}
              isProcessing={isProcessing}
              lastResult={lastResult}
              lastVerifiedDate={lastVerifiedDate}
            />

            {/* 6. Risk Simulator: Interactive tool with comparison vs actual price and top opportunity tip */}
            <TripSimulator
              onSimulate={handleSimulate}
              currentScore={scoreData.safetyScore}
              currentQuote={quote}
              actualMetrics={actualMetrics}
              actualQuote={actualQuote}
              consent={consent}
            />

            {/* 7. What leaves your device (Phase 2A Task 3) */}
            <DevicePrivacySection />

            {/* 8. Fallback Fixed-Price Safety Net Plan */}
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
              quote={actualQuote}
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
              lastVerifiedDate={lastVerifiedDate}
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

          <div className="text-ink-subtle text-center sm:text-right max-w-md">
            {PROTOTYPE_PRIVACY_SHORT}
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
