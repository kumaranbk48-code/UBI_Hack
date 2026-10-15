import React from 'react';
import { Flag, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Button, StatusDot } from './primitives';

export function TripList({ onOpenDispute }) {
  // Realistic recent trips for driver
  const trips = [
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
      id: 'trip-104',
      date: 'Oct 12 • 2:10 PM',
      title: 'Suburban Highway Route',
      distanceKm: 45.0,
      duration: '42 mins',
      avgSpeed: '65 km/h',
      status: 'smooth',
      brakes: 0,
      badge: 'Smooth cruising',
      canDispute: false,
    },
  ];

  return (
    <section
      aria-label="Recent Driving Sessions"
      className="rounded-[10px] bg-surface border border-line p-6 sm:p-7 shadow-soft space-y-5"
    >
      <div className="pb-4 border-b border-line flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
            Activity Ledger
          </span>
          <h2 className="text-xl font-serif font-normal text-ink">
            Recent driving sessions
          </h2>
        </div>
        <span className="text-[12px] text-ink-muted">
          Click <strong className="text-ink font-medium">Dispute penalty</strong> on any flagged event to request underwriter review
        </span>
      </div>

      {/* Clean Statement List with Hairline Dividers */}
      <div className="divide-y divide-line border border-line rounded-[8px] bg-surface-raised overflow-hidden">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-bg/40 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-[14px] font-medium text-ink">{trip.title}</h3>
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

              {trip.note && (
                <p className="text-[12px] text-status-warning italic pt-0.5">
                  "{trip.note}"
                </p>
              )}
            </div>

            {/* Action */}
            <div className="shrink-0 self-end md:self-center">
              {trip.canDispute ? (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Flag}
                  onClick={() => onOpenDispute(trip)}
                >
                  Dispute penalty
                </Button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12px] text-ink-subtle">
                  <CheckCircle2 className="w-3.5 h-3.5 text-status-positive stroke-[1.5]" />
                  <span>Verified clean</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
