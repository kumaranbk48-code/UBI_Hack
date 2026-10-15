import React, { useState } from 'react';
import { X, AlertCircle, ShieldCheck, CheckCircle2, FileText, Send } from 'lucide-react';

export function DisputeModal({ isOpen, onClose, trip, passesRemaining = 2, onSubmitDispute }) {
  if (!isOpen) return null;

  const [reason, setReason] = useState('ANIMAL_EMERGENCY');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);

  const reasons = [
    { id: 'ANIMAL_EMERGENCY', label: '🐾 Avoided Animal / Road Hazard', desc: 'Emergency braking to save a pedestrian, dog, or road debris.' },
    { id: 'PASSENGER_CAB', label: '🚕 Passenger in Taxi / Bus / Ride-Share', desc: 'I was not driving during this trip (passenger ride).' },
    { id: 'POTHOLE_SPIKE', label: '🕳️ Severe Pothole / Dropped Mount', desc: 'Mechanical road impact or phone fell from magnetic mount.' },
    { id: 'OTHER', label: '⚠️ Other Unusual Circumstance', desc: 'Other valid reason requiring underwriter human review.' },
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
      }, 2000);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">TripCheck™ Dispute Submission</h3>
              <p className="text-xs text-slate-400">Contest an unfair harsh brake or false penalty.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Passes Counter Banner */}
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong className="text-white">Annual Fairness Policy: </strong>
              You have <span className="font-bold underline text-white">{passesRemaining} of 2</span> Free Passes left this year.
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Reason Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Reason for Dispute:
            </label>
            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r.id}
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                    reason === r.id
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="dispute_reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-1 accent-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{r.label}</div>
                    <div className="text-[11px] text-slate-400">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Explanation Textarea */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Brief Explanation:
            </label>
            <textarea
              rows="2"
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="e.g., A stray puppy dashed across the road so I had to brake quickly to avoid a collision."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Privacy Guarantee Note */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-300">Privacy Safeguard: </strong>
              Only this single trip's 30-second telemetry snippet is attached for verification. All other trips remain strictly confidential.
            </span>
          </div>

          {resultMessage && (
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs text-center font-medium border border-emerald-500/30">
              {resultMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Dispute'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
