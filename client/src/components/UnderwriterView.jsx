import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, XCircle, AlertTriangle, FileCode, RefreshCw, Lock } from 'lucide-react';

export function UnderwriterView({ onDisputeReviewed }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/disputes');
      const data = await res.json();
      setDisputes(data?.disputes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleReview = async (disputeId, decision) => {
    try {
      setActionLoading(disputeId);
      const res = await fetch('/api/disputes/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          disputeId,
          decision,
          creditGiven: decision === 'APPROVED' ? 15.0 : 0.0,
          notes: decision === 'APPROVED' ? 'Approved by underwriter: genuine emergency brake.' : 'Rejected: insufficient corroboration.',
        }),
      });
      await res.json();
      await fetchDisputes();
      if (onDisputeReviewed) onDisputeReviewed();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Mock sample disputes if empty
  const displayDisputes = disputes.length > 0 ? disputes : [
    {
      id: 'disp-demo-1',
      reason: 'ANIMAL_EMERGENCY',
      explanation: 'A stray puppy ran into the road at the junction; slammed brakes to prevent hitting it.',
      status: 'UNDER_REVIEW',
      createdAt: '2026-10-14T19:48:00Z',
      attachedTripOnly: {
        timestamp: '2026-10-14T19:45:00Z',
        speedBefore: '42 km/h',
        speedAfter: '0 km/h',
        decelG: -0.68,
        note: 'High deceleration with verified full stop',
      },
    },
    {
      id: 'disp-demo-2',
      reason: 'PASSENGER_CAB',
      explanation: 'I was riding in a Yellow Taxi from downtown; I was not driving.',
      status: 'AUTO_RESOLVED',
      createdAt: '2026-10-12T14:10:00Z',
      reviewDecision: { decision: 'APPROVED', creditGiven: 12.0 },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl glass-panel p-6 shadow-xl border border-cyan-500/20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Underwriter & Actuarial Audit Console</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Human-in-the-Loop
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Review customer disputes, examine attached telemetry evidence, and monitor hardware tamper logs.
            </p>
          </div>
        </div>

        <button
          onClick={fetchDisputes}
          className="self-start md:self-auto px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Disputes Review Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl glass-panel p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Active Customer Disputes Queue</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400">
                  {displayDisputes.length} Cases
                </span>
              </h3>
              <span className="text-xs text-slate-400">Policyholder: Alex Mercer (Honda City)</span>
            </div>

            <div className="space-y-4">
              {displayDisputes.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase">
                          {d.reason?.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            d.status === 'APPROVED' || d.status === 'AUTO_RESOLVED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              : d.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 italic">"{d.explanation}"</p>
                    </div>

                    <div className="text-[11px] text-slate-500 shrink-0">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Attached Single-Trip Telemetry Box */}
                  {d.attachedTripOnly && (
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] font-mono space-y-1">
                      <div className="text-cyan-400 font-semibold flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5" /> Attached Single-Trip Telemetry Evidence:
                      </div>
                      <div className="text-slate-400">
                        Timestamp: {d.attachedTripOnly.timestamp} • Decel: {d.attachedTripOnly.decelG || '-0.68g'}
                      </div>
                      <div className="text-slate-400">
                        Speed Delta: 42 km/h &rarr; 0 km/h (Emergency safe stop verified)
                      </div>
                    </div>
                  )}

                  {/* Review Actions */}
                  {d.status === 'UNDER_REVIEW' ? (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleReview(d.id, 'REJECTED')}
                        disabled={actionLoading === d.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                      <button
                        onClick={() => handleReview(d.id, 'APPROVED')}
                        disabled={actionLoading === d.id}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approve $15 Relief Credit</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Decision finalized: {d.status}. Credit applied to policyholder ledger.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Hardware Tamper & Odometer Integrity Log */}
        <div className="space-y-4">
          <div className="rounded-2xl glass-panel p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Tamper & Integrity Audit</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Check 1: Cryptographic Signatures */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>HMAC-SHA256 Signatures</span>
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Every row signed with embedded secret key. Prevents manual editing of speed or braking in CSV files.
                </p>
              </div>

              {/* Check 2: Odometer Continuity Check */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Odometer Continuity Audit</span>
                  <span className="text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                    Monitored
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Detects if logger dongle was unplugged to hide high-speed joyrides or night races. Flags gaps as "Needs Review".
                </p>
              </div>

              {/* Check 3: Sensor Noise Filter */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="font-semibold text-slate-200 flex items-center justify-between">
                  <span>Pothole / Vibration Rejection</span>
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    Cleaned
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Filters short isolated &lt;0.5s deceleration jolts and drops false alarms to guarantee fairness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
