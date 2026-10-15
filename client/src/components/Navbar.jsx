import React, { useState, useRef, useEffect } from 'react';
import { Shield, ShieldCheck, Database, Sliders, ChevronDown, Check, ExternalLink, ArrowDown } from 'lucide-react';
import { PROTOTYPE_PRIVACY_NOTE } from '../data/privacyCopy';

export function Navbar({
  activeTab = 'policy', // 'policy' | 'trips' | 'underwriter'
  setActiveTab,
  dbStatus,
  consent,
  onOpenConsentModal,
  disputePasses = 2,
}) {
  const [isPrivacyPopoverOpen, setIsPrivacyPopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  const isPostgres = dbStatus?.mode === 'POSTGRES_NEON';

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsPrivacyPopoverOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-line shadow-soft">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Wordmark */}
        <div className="flex items-center space-x-6 sm:space-x-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('policy');
            }}
            className="flex items-center gap-2 group text-decoration-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-[4px]"
          >
            <div className="w-7 h-7 rounded-[5px] bg-brand text-surface-raised flex items-center justify-center font-serif text-sm font-semibold tracking-tight">
              S
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-normal text-ink tracking-tight">
                SafeDrive
              </span>
              <span className="font-serif italic text-base text-accent font-normal">
                IQ
              </span>
            </div>
          </a>

          {/* Clean Navigation Underlined Tabs */}
          <nav className="hidden sm:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('policy')}
              className={`px-3 py-4 text-[14px] font-medium transition-colors relative focus-visible:outline-none ${
                activeTab === 'policy'
                  ? 'text-brand font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              My policy
              {activeTab === 'policy' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`px-3 py-4 text-[14px] font-medium transition-colors relative focus-visible:outline-none ${
                activeTab === 'trips'
                  ? 'text-brand font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Trips & Disputes
              {activeTab === 'trips' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('underwriter')}
              className={`px-3 py-4 text-[14px] font-medium transition-colors relative focus-visible:outline-none ${
                activeTab === 'underwriter'
                  ? 'text-brand font-semibold'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              Underwriter review
              {activeTab === 'underwriter' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
              )}
            </button>
          </nav>
        </div>

        {/* Right Controls: Unobtrusive Privacy Popover & Settings */}
        <div className="flex items-center space-x-3">
          {/* Mobile Tab Switcher */}
          <div className="sm:hidden flex items-center bg-bg rounded-[6px] p-0.5 border border-line text-xs">
            <button
              onClick={() => setActiveTab('policy')}
              className={`px-2.5 py-1 rounded-[4px] font-medium ${activeTab === 'policy' ? 'bg-surface-raised text-brand shadow-soft' : 'text-ink-muted'}`}
            >
              Policy
            </button>
            <button
              onClick={() => setActiveTab('trips')}
              className={`px-2.5 py-1 rounded-[4px] font-medium ${activeTab === 'trips' ? 'bg-surface-raised text-brand shadow-soft' : 'text-ink-muted'}`}
            >
              Trips
            </button>
            <button
              onClick={() => setActiveTab('underwriter')}
              className={`px-2.5 py-1 rounded-[4px] font-medium ${activeTab === 'underwriter' ? 'bg-surface-raised text-brand shadow-soft' : 'text-ink-muted'}`}
            >
              Audit
            </button>
          </div>

          {/* Discreet Privacy Indicator with Editorial Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setIsPrivacyPopoverOpen(!isPrivacyPopoverOpen)}
              aria-expanded={isPrivacyPopoverOpen}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[13px] font-medium text-ink-muted hover:text-ink bg-surface-raised hover:bg-bg border border-line transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand stroke-[1.75]" />
              <span className="hidden md:inline">On-device privacy</span>
              <span className="md:hidden">Privacy</span>
              <ChevronDown className="w-3 h-3 text-ink-subtle stroke-[1.5]" />
            </button>

            {/* Privacy Architecture Popover */}
            {isPrivacyPopoverOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[8px] bg-surface-raised border border-line p-5 shadow-popover z-50 animate-fadeIn">
                <div className="flex items-start justify-between pb-3 border-b border-line">
                  <div>
                    <h3 className="text-sm font-semibold text-ink font-serif">
                      Privacy & Data Architecture
                    </h3>
                    <p className="text-[12px] text-ink-muted mt-0.5">
                      How SafeDrive IQ protects your personal telemetry
                    </p>
                  </div>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-brand-light text-brand">
                    Active
                  </span>
                </div>

                <div className="py-3 space-y-2.5 text-[12px] text-ink-muted border-b border-line">
                  <p className="text-[12px] text-ink leading-relaxed pb-1 border-b border-line/60">
                    {PROTOTYPE_PRIVACY_NOTE}
                  </p>
                  <div className="flex items-start gap-2 pt-1">
                    <Check className="w-3.5 h-3.5 text-status-positive shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink font-medium">Speed & Acceleration Readings:</strong> Raw sensor traces are processed in local memory and discarded immediately.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-status-positive shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink font-medium">Monthly Totals Only:</strong> Only monthly distance, night driving ratio, and gentle stopping totals are retained.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-status-positive shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-ink font-medium">Retention Policy:</strong> Demo setting: no data is deleted in this prototype.
                    </span>
                  </div>
                </div>

                {/* Technical System Details Moved from Header */}
                <div className="py-3 space-y-1.5 text-[11px] text-ink-subtle bg-bg -mx-5 px-5 my-1">
                  <div className="flex justify-between">
                    <span>Engine Mode:</span>
                    <span className="text-ink font-medium">
                      {isPostgres ? 'Neon Cloud PostgreSQL' : 'Local In-Memory Engine'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Policy Tier:</span>
                    <span className="text-ink font-medium">
                      {consent?.fallbackFixed ? 'Fixed Plan ($85)' : consent?.tier || 'Tier C (Habits)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Status:</span>
                    <span className="text-status-positive font-medium">HMAC-SHA256 Signed</span>
                  </div>
                </div>

                <div className="pt-3 space-y-2">
                  {/* Link to What leaves your device section per Phase 2A task 3 */}
                  <a
                    href="#what-leaves-your-device"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('policy');
                      setIsPrivacyPopoverOpen(false);
                      setTimeout(() => {
                        const el = document.getElementById('what-leaves-your-device');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }}
                    className="w-full flex items-center justify-between text-xs text-brand hover:text-brand-hover font-medium underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded-[2px] py-1"
                  >
                    <span>See what stays on your device</span>
                    <ArrowDown className="w-3.5 h-3.5 stroke-[1.5]" />
                  </a>

                  <button
                    onClick={() => {
                      setIsPrivacyPopoverOpen(false);
                      onOpenConsentModal();
                    }}
                    className="w-full text-center py-2 px-3 rounded-[6px] text-xs font-medium text-brand hover:text-brand-hover bg-brand-light hover:bg-line transition-colors"
                  >
                    Manage Consent & Retention Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
