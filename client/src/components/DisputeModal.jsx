import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Send, FileText, CheckCircle2 } from 'lucide-react';
import { Button, Alert } from './primitives';

export function DisputeModal({ isOpen, onClose, trip, passesRemaining = 2, onSubmitDispute }) {
  if (!isOpen) return null;

  const [reason, setReason] = useState('ANIMAL_EMERGENCY');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const closeBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  const modalRef = useRef(null);

  // Accessible dialog: close on Escape key & trap focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const reasons = [
    { id: 'ANIMAL_EMERGENCY', label: 'Avoided Animal or Road Obstacle', desc: 'Emergency braking to prevent colliding with pedestrian, animal, or debris.' },
    { id: 'PASSENGER_CAB', label: 'Passenger in Taxi, Bus, or Ride-Share', desc: 'You were a passenger during this commute and not operating the vehicle.' },
    { id: 'POTHOLE_SPIKE', label: 'Severe Road Impact or Dropped Mount', desc: 'Abrupt road shock or device dropped from magnetic cradle.' },
    { id: 'OTHER', label: 'Other Valid Hazard', desc: 'Circumstance requiring human underwriter review.' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!explanation.trim()) return;

    setSubmitting(true);
    const res = await onSubmitDispute({
      tripSummaryId: trip?.id,
      reason,
      explanation,
      attachedTripOnly: {
        timestamp: trip?.timestamp || '2026-10-14T08:30:00Z',
        distanceKm: trip?.distanceKm || 12.4,
        maxDecelG: -0.65,
        flaggedEvent: 'Sudden deceleration > 0.4g',
      },
    });

    setSubmitting(false);
    if (res?.message) {
      setResultMessage(res.message);
      setTimeout(() => {
        setResultMessage(null);
        onClose();
      }, 1800);
    } else {
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="disputeModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px] animate-fadeIn"
    >
      <div ref={modalRef} className="relative w-full max-w-lg rounded-[10px] bg-surface-raised border border-line p-6 sm:p-7 shadow-popover overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
              Trip Adjudication
            </span>
            <h2 id="disputeModalTitle" className="text-xl font-serif font-normal text-ink">
              Contest flagged driving event
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="p-1 rounded-[4px] text-ink-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand min-w-[32px] min-h-[32px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Free Passes Banner */}
        <div className="mt-4 p-3 rounded-[6px] bg-surface border border-line flex items-center justify-between text-[12px]">
          <span className="text-ink-muted">Annual fairness allocation:</span>
          <span className="font-medium text-brand tabular-nums">
            {passesRemaining} of 2 Free Passes remaining
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-[12px] font-medium text-ink block mb-2">
              Reason for contested event
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 p-3 rounded-[6px] border cursor-pointer transition-colors ${
                    reason === r.id
                      ? 'border-brand bg-brand-light/30'
                      : 'border-line bg-surface hover:border-line-dark'
                  }`}
                >
                  <input
                    type="radio"
                    name="dispute_reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-0.5 accent-brand"
                  />
                  <div>
                    <div className="text-[13px] font-medium text-ink">{r.label}</div>
                    <div className="text-[11px] text-ink-muted mt-0.5">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-medium text-ink block mb-1">
              Driver statement
            </label>
            <textarea
              rows={3}
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Describe what occurred (e.g., A stray puppy dashed across the road requiring an immediate full stop)."
              className="w-full px-3 py-2 rounded-[6px] bg-surface border border-line text-[13px] text-ink placeholder-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>

          {/* Privacy Note */}
          <div className="text-[11px] text-ink-subtle leading-relaxed bg-bg p-2.5 rounded-[6px] border border-line">
            <strong className="text-ink font-medium">Privacy note: </strong>
            Only a 30-second telemetry snippet around this specific timestamp will be forwarded to the underwriter. All other trips remain strictly confidential.
          </div>

          {resultMessage && (
            <Alert variant="positive">
              {resultMessage}
            </Alert>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-line">
            <Button type="button" variant="ghost" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting}>
              Submit dispute
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
