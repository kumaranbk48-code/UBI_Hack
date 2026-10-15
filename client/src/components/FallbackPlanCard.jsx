import React, { useState, useEffect, useRef } from 'react';
import { Check, ArrowRight, X } from 'lucide-react';
import { Button } from './primitives';

/**
 * Fixed-Price Safety Net Plan (Phase 2A Task 4)
 * Reworded as a safety net with accessible confirmation dialog (focus trapped, Escape closes)
 */
export function FallbackPlanCard({ isFixedActive, onToggleFixed }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cancelBtnRef = useRef(null);
  const confirmBtnRef = useRef(null);
  const dialogRef = useRef(null);

  // Focus trap and Escape key listener for accessible modal dialog
  useEffect(() => {
    if (!isDialogOpen) return;

    // Focus cancel button initially to prevent accidental enter triggers
    const timer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsDialogOpen(false);
      } else if (e.key === 'Tab') {
        const focusable = [cancelBtnRef.current, confirmBtnRef.current].filter(Boolean);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDialogOpen]);

  const handleConfirm = () => {
    setIsDialogOpen(false);
    onToggleFixed();
  };

  return (
    <section
      aria-label="Fixed-price fairness plan"
      className="pt-10 pb-4 border-t border-line"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex-1 min-w-0 max-w-2xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
              Safety net plan
            </span>
            {isFixedActive && (
              <span className="text-[12px] font-normal text-ink-muted">
                • Active plan
              </span>
            )}
          </div>

          {/* Plain safety net copy per Phase 2A task 4 */}
          <h3 className="font-serif text-lg sm:text-xl font-normal text-ink">
            Prefer a predictable price?
          </h3>
          <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">
            Switch to the Fixed Plan at $85.00/mo with no trip monitoring. Driving habits and road sensors will not adjust your monthly price. You can return to usage-based pricing at any time.
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-center">
          <Button
            variant={isFixedActive ? 'secondary' : 'primary'}
            size="md"
            onClick={() => setIsDialogOpen(true)}
          >
            {isFixedActive ? (
              <>
                <Check className="w-4 h-4 text-brand mr-1" />
                <span>Fixed Plan Active ($85/mo)</span>
              </>
            ) : (
              <>
                <span>Switch to Fixed $85 Rate</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog per Phase 2A task 4 */}
      {isDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="fixedPlanDialogTitle"
          aria-describedby="fixedPlanDialogDesc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px] animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDialogOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            className="relative w-full max-w-md rounded-[10px] bg-surface-raised border border-line p-6 shadow-popover space-y-4"
          >
            <div className="flex items-start justify-between pb-2 border-b border-line">
              <h3 id="fixedPlanDialogTitle" className="font-serif text-lg font-normal text-ink">
                {isFixedActive ? 'Switch to driving-based pricing?' : 'Switch to the Fixed Plan?'}
              </h3>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="p-1 rounded-[4px] text-ink-subtle hover:text-ink focus-visible:outline-none"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>

            <p id="fixedPlanDialogDesc" className="text-[13px] text-ink-muted leading-relaxed">
              {isFixedActive
                ? 'Your premium will once again adjust each month based on your driving habits, mileage, and FairScore.'
                : 'Your rate will be fixed at $85.00/mo with no trip monitoring. Driving habits and vehicle trip logs will not adjust your monthly price. You can return to habit-based pricing at any time.'}
            </p>

            <div className="pt-3 border-t border-line flex items-center justify-end gap-3">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="px-3 py-1.5 min-h-[38px] text-[13px] font-medium rounded-[6px] text-ink border border-line bg-surface-raised hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                ref={confirmBtnRef}
                type="button"
                onClick={handleConfirm}
                className="px-4 py-1.5 min-h-[38px] text-[13px] font-medium rounded-[6px] text-surface-raised bg-brand hover:bg-brand-hover shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand whitespace-nowrap"
              >
                {isFixedActive ? 'Confirm switch to FairScore' : 'Confirm switch to $85.00/mo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
