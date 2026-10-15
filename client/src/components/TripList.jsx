import React from 'react';
import { Clock, MapPin, AlertTriangle, ShieldCheck, Flag, CheckCircle2 } from 'lucide-react';

export function TripList({ onOpenDispute }) {
  // Sample realistic recent trips for the driver view
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
      badge: '100% Gentle Stops',
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
      badge: '1 Harsh Brake (-0.62g)',
      canDispute: true,
      note: 'Sudden deceleration flagged near Crossroad 4th Ave.',
    },
    {
      id: 'trip-103',
      date: 'Oct 13 • 1:20 AM',
      title: 'Late Night Return (1-4 AM)',
      distanceKm: 24.5,
      duration: '22 mins',
      avgSpeed: '68 km/h',
      status: 'caution',
      brakes: 0,
      badge: 'Night Exposure (12-4 AM)',
      canDispute: false,
    },
    {
      id: 'trip-104',
      date: 'Oct 12 • 2:10 PM',
      title: 'Suburban Highway Drive',
      distanceKm: 45.0,
      duration: '42 mins',
      avgSpeed: '65 km/h',
      status: 'smooth',
      brakes: 0,
      badge: 'Smooth Cruising',
      canDispute: false,
    },
  ];

  return (
    <div className="rounded-2xl glass-panel p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            TripCheck™ Activity Log
          </span>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Recent Logged Driving Sessions</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              Edge Filtered
            </span>
          </h3>
        </div>
        <div className="text-xs text-slate-400">
          Click <span className="text-amber-400 font-semibold">Dispute</span> on any flagged event to request review.
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {trips.map((trip) => (
          <div
            key={trip.id}
            className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  trip.status === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : trip.status === 'caution'
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}
              >
                {trip.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : trip.status === 'caution' ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{trip.title}</h4>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                      trip.status === 'warning'
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                        : trip.status === 'caution'
                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    }`}
                  >
                    {trip.badge}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                  <span>{trip.date}</span>
                  <span>•</span>
                  <span>{trip.distanceKm} km</span>
                  <span>•</span>
                  <span>{trip.avgSpeed} avg</span>
                </div>
                {trip.note && (
                  <div className="text-[11px] text-amber-400/90 mt-1 italic">
                    "{trip.note}"
                  </div>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="self-end md:self-center shrink-0">
              {trip.canDispute ? (
                <button
                  onClick={() => onOpenDispute(trip)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 transition shadow-sm"
                >
                  <Flag className="w-3 h-3" />
                  <span>Dispute Penalty</span>
                </button>
              ) : (
                <span className="text-[11px] text-emerald-400/80 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Clean
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
