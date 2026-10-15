import React, { useState } from 'react';
import { Flag, CheckCircle2, MessageSquare, AlertTriangle, Clock, X, Check } from 'lucide-react';
import { Button, StatusDot, Skeleton } from './primitives';

/**
 * Trips & Activity Ledger (Phase 2B Task 6)
 * Open editorial layout with hairline rules (no heavy card-in-card)
 * Non-accusatory wording for flagged telemetry gaps and inline "Add a note" flow
 */
export function TripList({ onOpenDispute, isLoading = false }) {
  const [activeNoteTripId, setActiveNoteTripId] = useState(null);
  const [noteText, setNoteText] = useState('');
  
  // Driving activity sessions including flagged unmonitored interval
  const [trips, setTrips] = useState([
    {
      id: 'trip-101',
      date: 'Today, Oct 15 • 8:15 AM',
      title: 'Morning Office Commute',
      distanceKm: 18.2,
      duration: '26 mins',
      avgSpeed: '42 km/h',
      status: 'smooth',
      brakes: 0,
      badge: 'Gentle stops',
      canDispute: false,
    },
    {
      id: 'trip-102',
      date: 'Yesterday, Oct 14 • 7:45 PM',
      title: 'Main Street Boulevard',
      distanceKm: 12.4,
      duration: '19 mins',
      avgSpeed: '38 km/h',
      status: 'warning',
      brakes: 1,
      badge: '1 Harsh brake (-0.62g)',
      canDispute: true,
      note: 'Sudden deceleration flagged near Crossroad 4th Ave.',
    },
    {
      id: 'trip-103',
      date: 'Oct 13 • 1:20 AM',
      title: 'Late Night Return',
      distanceKm: 24.5,
      duration: '22 mins',
      avgSpeed: '68 km/h',
      status: 'caution',
      brakes: 0,
      badge: 'Night exposure (1-4 AM)',
      canDispute: false,
    },
    {
      id: 'trip-105',
      date: 'Oct 11 • 5:30 PM',
      title: 'Unmonitored Distance Interval',
      distanceKm: 180.0,
      duration: 'Unrecorded',
      avgSpeed: '—',
      status: 'warning',
      isFlaggedGap: true,
      badge: 'Odometer gap (180 km)',
      canDispute: true,
      flagMessage: 'We noticed 180 km with no data. This is usually an unplugged device. Confirm or add a note.',
      noteStatus: null, // null | 'Submitted' | 'Under review' | 'Resolved'
      userNote: '',
    },
    {
      id: 'trip-104',
      date: 'Oct 10 • 2:10 PM',
      title: 'Suburban Highway Route',
      distanceKm: 45.0,
      duration: '42 mins',
      avgSpeed: '65 km/h',
      status: 'smooth',
      brakes: 0,
      badge: 'Smooth cruising',
      canDispute: false,
    },
  ]);

  const handleOpenNoteForm = (trip) => {
    setActiveNoteTripId(trip.id);
    setNoteText(trip.userNote || '');
  };

  const handleSaveNote = (tripId) => {
    if (!noteText.trim()) return;
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? { ...t, userNote: noteText.trim(), noteStatus: 'Submitted' }
          : t
      )
    );
    setActiveNoteTripId(null);
    setNoteText('');
  };

  if (isLoading) {
    return (
      <div className="py-10 border-t border-line space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <section
      aria-label="Recent Driving Sessions"
      className="py-10 border-t border-line space-y-6"
    >
      {/* Header */}
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Activity Ledger
          </span>
          <div className="flex flex-wrap items-baseline gap-2.5">
            <h2 className="text-xl font-serif font-normal text-ink">
              Recent driving sessions
            </h2>
            <span className="text-[13px] text-ink-muted">
              • Sample trips for demo purposes
            </span>
          </div>
        </div>
        <span className="text-[12px] text-ink-muted">
          Add a note or request review on any flagged telemetry event
        </span>
      </div>

      {/* Open Statement List with Hairline Dividers (No boxed card-in-card) */}
      {trips.length === 0 ? (
        <div className="py-12 text-center text-ink-muted text-xs border-y border-line">
          No driving sessions recorded for the active cycle.
        </div>
      ) : (
        <div className="divide-y divide-line border-t border-b border-line">
          {trips.map((trip) => {
            const isEditingNote = activeNoteTripId === trip.id;
            return (
              <div
                key={trip.id}
                className="py-4 sm:py-5 flex flex-col gap-3 hover:bg-surface/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[14px] font-medium text-ink">{trip.title}</h3>
                      
                      {/* Simple status dot + text (Not a filled neon pill) */}
                      <StatusDot
                        status={
                          trip.status === 'warning'
                            ? 'warning'
                            : trip.status === 'caution'
                            ? 'info'
                            : 'positive'
                        }
                        label={trip.badge}
                      />

                      {/* Note status indicator if note was submitted */}
                      {trip.noteStatus && (
                        <StatusDot
                          status={trip.noteStatus === 'Resolved' ? 'positive' : 'info'}
                          label={trip.noteStatus}
                        />
                      )}
                    </div>

                    <div className="text-[12px] text-ink-muted flex items-center gap-2 tabular-nums">
                      <span>{trip.date}</span>
                      <span>•</span>
                      <span>{trip.distanceKm} km</span>
                      <span>•</span>
                      <span>{trip.duration}</span>
                      <span>•</span>
                      <span>{trip.avgSpeed} avg</span>
                    </div>

                    {/* Non-accusatory message for flagged events per Phase 2B task 6 */}
                    {trip.flagMessage && (
                      <p className="text-[12px] text-ink-muted pt-1 leading-relaxed max-w-xl">
                        {trip.flagMessage}
                      </p>
                    )}

                    {trip.note && !trip.flagMessage && (
                      <p className="text-[12px] text-status-warning italic pt-0.5">
                        "{trip.note}"
                      </p>
                    )}

                    {/* Display submitted policyholder note */}
                    {trip.userNote && !isEditingNote && (
                      <div className="mt-2 p-2.5 rounded-[6px] bg-surface border border-line text-xs space-y-1 max-w-xl">
                        <div className="flex items-center justify-between text-ink-subtle">
                          <span className="font-medium text-ink">Your submitted explanation:</span>
                          <button
                            type="button"
                            onClick={() => handleOpenNoteForm(trip)}
                            className="text-brand hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <p className="text-ink-muted italic">"{trip.userNote}"</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
                    {/* Add a note action for flagged trips */}
                    {trip.isFlaggedGap && !isEditingNote && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={MessageSquare}
                        onClick={() => handleOpenNoteForm(trip)}
                      >
                        {trip.userNote ? 'Update note' : 'Add a note'}
                      </Button>
                    )}

                    {trip.canDispute && (
                      <Button
                        size="sm"
                        variant={trip.isFlaggedGap ? 'ghost' : 'secondary'}
                        icon={Flag}
                        onClick={() => onOpenDispute(trip)}
                      >
                        Dispute penalty
                      </Button>
                    )}

                    {!trip.canDispute && (
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-subtle">
                        <CheckCircle2 className="w-3.5 h-3.5 text-status-positive stroke-[1.5]" />
                        <span>Verified clean</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Inline "Add a note" form per Phase 2B task 6 */}
                {isEditingNote && (
                  <div className="mt-2 p-4 rounded-[6px] bg-surface-raised border border-line space-y-3 max-w-xl animate-fadeIn">
                    <label className="block text-[12px] font-medium text-ink">
                      Add a note for policy review
                    </label>
                    <textarea
                      rows={2}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Explain what happened (e.g. vehicle was in auto service, battery disconnected, passenger ride)..."
                      className="w-full text-xs p-2.5 rounded-[4px] border border-line bg-surface text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveNoteTripId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={!noteText.trim()}
                        onClick={() => handleSaveNote(trip.id)}
                      >
                        Submit note
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
