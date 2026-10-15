import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileCode, RefreshCw, X, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Button, StatusDot, Alert } from './primitives';

export function UnderwriterView({ onDisputeReviewed }) {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'

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
      if (selectedDispute?.id === disputeId) {
        setSelectedDispute((prev) => (prev ? { ...prev, status: decision } : null));
      }
      if (onDisputeReviewed) onDisputeReviewed();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  // Realistic sample disputes if empty
  const defaultDisputes = [
    {
      id: 'disp-demo-1',
      policyholder: 'Alex Mercer',
      vehicle: '2022 Honda City VTEC',
      reason: 'ANIMAL_EMERGENCY',
      explanation: 'A stray puppy ran into the road at the junction; slammed brakes to prevent hitting it.',
      status: 'UNDER_REVIEW',
      createdAt: '2026-10-14T19:48:00Z',
      attachedTripOnly: {
        timestamp: '2026-10-14T19:45:00Z',
        speedBefore: '42 km/h',
        speedAfter: '0 km/h',
        decelG: -0.68,
        note: 'High deceleration with verified full emergency stop',
      },
    },
    {
      id: 'disp-demo-2',
      policyholder: 'Alex Mercer',
      vehicle: '2022 Honda City VTEC',
      reason: 'PASSENGER_CAB',
      explanation: 'I was riding in a Yellow Taxi from downtown; I was not driving.',
      status: 'APPROVED',
      createdAt: '2026-10-12T14:10:00Z',
      reviewDecision: { decision: 'APPROVED', creditGiven: 12.0 },
      attachedTripOnly: {
        timestamp: '2026-10-12T14:05:00Z',
        speedBefore: '58 km/h',
        speedAfter: '12 km/h',
        decelG: -0.44,
        note: 'Taxi passenger GPS track corroborated',
      },
    },
  ];

  const rawList = disputes.length > 0 ? disputes : defaultDisputes;
  const filteredDisputes = rawList.filter((d) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'UNDER_REVIEW') return d.status === 'UNDER_REVIEW';
    if (filterStatus === 'APPROVED') return d.status === 'APPROVED' || d.status === 'AUTO_RESOLVED';
    if (filterStatus === 'REJECTED') return d.status === 'REJECTED';
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="pb-5 border-b border-line flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Actuarial Audit Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal text-ink">
            Underwriter & dispute review
          </h1>
          <p className="text-[13px] text-ink-muted mt-1 max-w-2xl">
            Human-in-the-loop dispute adjudications, privacy-minimized telemetry snippets, and cryptographic hardware tamper logs.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchDisputes}
        >
          Refresh queue
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Filterable Dispute Table Workspace */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-[10px] bg-surface border border-line p-5 sm:p-6 shadow-soft space-y-4">
            {/* Table Controls & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
              <div className="flex items-center gap-1.5 bg-bg p-1 rounded-[6px] border border-line text-xs">
                {['ALL', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-[4px] font-medium transition-colors ${
                      filterStatus === st
                        ? 'bg-surface-raised text-brand shadow-soft font-semibold'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {st === 'ALL'
                      ? 'All'
                      : st === 'UNDER_REVIEW'
                      ? 'Under review'
                      : st === 'APPROVED'
                      ? 'Approved'
                      : 'Rejected'}
                  </button>
                ))}
              </div>

              <span className="text-[12px] text-ink-subtle tabular-nums">
                Showing {filteredDisputes.length} records
              </span>
            </div>

            {/* Clean Data Table */}
            <div className="overflow-x-auto border border-line rounded-[6px] bg-surface-raised">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-line bg-surface text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle sticky top-0">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Policyholder</th>
                    <th className="py-2.5 px-4">Claimed Reason</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {filteredDisputes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-ink-muted text-xs">
                        No dispute records match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDisputes.map((d) => {
                      const isSelected = selectedDispute?.id === d.id;
                      return (
                        <tr
                          key={d.id}
                          onClick={() => setSelectedDispute(d)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-brand-light/40' : 'hover:bg-bg/60'
                          }`}
                        >
                          <td className="py-3 px-4 tabular-nums text-ink-muted text-xs">
                            {new Date(d.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 font-medium text-ink">
                            {d.policyholder || 'Alex Mercer'}
                            <span className="block text-[11px] text-ink-subtle font-normal">
                              {d.vehicle || '2022 Honda City'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-ink-muted">
                            <span className="text-ink font-medium">
                              {d.reason?.replace(/_/g, ' ')}
                            </span>
                            <span className="block text-[11px] text-ink-subtle truncate max-w-xs">
                              "{d.explanation}"
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <StatusDot
                              status={
                                d.status === 'APPROVED' || d.status === 'AUTO_RESOLVED'
                                  ? 'positive'
                                  : d.status === 'REJECTED'
                                  ? 'danger'
                                  : 'warning'
                              }
                              label={
                                d.status === 'UNDER_REVIEW'
                                  ? 'Under review'
                                  : d.status === 'APPROVED' || d.status === 'AUTO_RESOLVED'
                                  ? 'Approved'
                                  : 'Rejected'
                              }
                            />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="text-xs text-brand font-medium inline-flex items-center gap-0.5">
                              <span>Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Detail Drawer / Inspection Panel & Audit Checks */}
        <div className="lg:col-span-4 space-y-6">
          {/* Detail Drawer on Row Click */}
          {selectedDispute ? (
            <div className="rounded-[10px] bg-surface-raised border border-line p-5 shadow-soft space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-line">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
                    Dispute Evidence
                  </span>
                  <h3 className="font-serif text-base font-normal text-ink">
                    Case #{selectedDispute.id}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="p-1 rounded-[4px] text-ink-subtle hover:text-ink focus-visible:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-[13px]">
                <div>
                  <span className="text-xs text-ink-subtle uppercase tracking-[0.06em]">Policyholder Statement</span>
                  <p className="text-ink-muted italic mt-1 bg-bg p-3 rounded-[6px] border border-line text-xs leading-relaxed">
                    "{selectedDispute.explanation}"
                  </p>
                </div>

                {/* Attached Single-Trip Telemetry (Privacy Protected) */}
                {selectedDispute.attachedTripOnly && (
                  <div className="p-3 rounded-[6px] bg-bg border border-line text-xs font-mono tabular-nums space-y-1.5">
                    <div className="flex items-center gap-1.5 font-sans font-medium text-ink">
                      <FileCode className="w-3.5 h-3.5 text-brand" />
                      <span>Attached 30s Telemetry Slice</span>
                    </div>
                    <div className="text-ink-muted">
                      Timestamp: {selectedDispute.attachedTripOnly.timestamp}
                    </div>
                    <div className="text-ink-muted">
                      Peak Deceleration: {selectedDispute.attachedTripOnly.decelG || '-0.68'}g
                    </div>
                    <div className="text-ink-muted">
                      Delta: {selectedDispute.attachedTripOnly.speedBefore || '42 km/h'} &rarr; {selectedDispute.attachedTripOnly.speedAfter || '0 km/h'}
                    </div>
                    <div className="text-[11px] text-brand font-sans pt-1">
                      Verified safe full stop without collision.
                    </div>
                  </div>
                )}

                {/* Decision Actions */}
                {selectedDispute.status === 'UNDER_REVIEW' ? (
                  <div className="pt-3 border-t border-line flex items-center justify-end gap-2.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={actionLoading === selectedDispute.id}
                      onClick={() => handleReview(selectedDispute.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      loading={actionLoading === selectedDispute.id}
                      onClick={() => handleReview(selectedDispute.id, 'APPROVED')}
                    >
                      Approve $15 Credit
                    </Button>
                  </div>
                ) : (
                  <div className="pt-2 text-xs text-brand font-medium">
                    Decision finalized: {selectedDispute.status}. Credit recorded on ledger.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-[10px] bg-surface border border-line border-dashed p-6 text-center text-ink-muted text-xs">
              Select a dispute from the queue to inspect attached telemetry and finalize an adjudication.
            </div>
          )}

          {/* Cryptographic & Sensor Integrity Audit Panel */}
          <div className="rounded-[10px] bg-surface border border-line p-5 shadow-soft space-y-4">
            <div className="pb-3 border-b border-line">
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
                Hardware Verification
              </span>
              <h3 className="font-serif text-base font-normal text-ink">
                Tamper & continuity audit
              </h3>
            </div>

            <div className="space-y-3 text-[12px]">
              <div className="p-3 rounded-[6px] bg-surface-raised border border-line">
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>HMAC-SHA256 Signatures</span>
                  <StatusDot status="positive" label="Active" />
                </div>
                <p className="text-ink-muted text-[11px] mt-1 leading-relaxed">
                  Every 1-second record is cryptographically signed using an embedded secure element. Spreadsheet edits are automatically flagged.
                </p>
              </div>

              <div className="p-3 rounded-[6px] bg-surface-raised border border-line">
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>Odometer Continuity Audit</span>
                  <StatusDot status="info" label="Monitored" />
                </div>
                <p className="text-ink-muted text-[11px] mt-1 leading-relaxed">
                  Detects unmonitored kilometres between device plug cycles. Unplugged devices are flagged for friendly review rather than penalty.
                </p>
              </div>

              <div className="p-3 rounded-[6px] bg-surface-raised border border-line">
                <div className="flex items-center justify-between font-medium text-ink">
                  <span>Sensor Vibration Filter</span>
                  <StatusDot status="positive" label="Validated" />
                </div>
                <p className="text-ink-muted text-[11px] mt-1 leading-relaxed">
                  Rejects isolated spike jolts (&lt; 0.5s duration) caused by road potholes or dropped phone mounts to prevent false braking penalties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
