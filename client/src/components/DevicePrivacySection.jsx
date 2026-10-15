import React from 'react';
import { FileText, Activity, ShieldCheck, Receipt, Gauge, Fingerprint, Lock, Server, MapPin } from 'lucide-react';
import { PROTOTYPE_PRIVACY_NOTE } from '../data/privacyCopy';

/**
 * Data privacy architecture section (Phase 2A Task 3 / Phase 3 Task 3)
 * Open two-column section divided by hairline rules (not a card)
 * Outlines exact data boundaries: local processing vs stored monthly aggregates
 */
export function DevicePrivacySection() {
  const staysOnDevice = [
    {
      icon: Activity,
      title: 'Speed & acceleration readings',
      desc: 'Raw sub-second speed traces and accelerometer readings stay in memory and are discarded after processing.',
    },
    {
      icon: FileText,
      title: 'Raw CSV files & trip logs',
      desc: 'Second-by-second telematics files are processed locally and discarded; raw traces are not retained.',
    },
    {
      icon: MapPin,
      title: 'Road paths & coordinates',
      desc: 'Raw trip coordinates and routes are never stored in the database.',
    },
  ];

  const sharedWithInsurer = [
    {
      icon: Gauge,
      title: 'Monthly FairScore (0–100)',
      desc: 'Single holistic safety index calculated over your monthly distance average.',
    },
    {
      icon: Receipt,
      title: 'Itemized premium & discounts',
      desc: 'Final dollar rate and earned safe-habit rewards recorded on your monthly statement.',
    },
    {
      icon: Fingerprint,
      title: 'Monthly mileage & night totals',
      desc: 'Aggregated monthly distance and night proportion used for actuarial rate calculations.',
    },
    {
      icon: ShieldCheck,
      title: 'Dispute summaries',
      desc: 'If a driver files a dispute, a short summary of that event is retained for review.',
    },
  ];

  return (
    <section
      id="what-leaves-your-device"
      aria-label="What leaves your device"
      className="py-12 border-t border-line space-y-8 scroll-mt-20"
    >
      {/* Header */}
      <div>
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
          Data privacy architecture
        </span>
        <h2 className="text-xl sm:text-2xl font-serif font-normal text-ink">
          Data boundary & retention
        </h2>
        <p className="text-[13px] text-ink-muted mt-1 max-w-2xl leading-relaxed">
          {PROTOTYPE_PRIVACY_NOTE}
        </p>
      </div>

      {/* Two-Column Open Comparison Divided by Hairline */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 md:divide-x md:divide-line items-start">
        {/* Column 1: Processed and discarded */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <Lock className="w-4 h-4 text-ink-muted stroke-[1.5]" />
            <h3 className="font-serif text-lg font-normal text-ink">
              Processed and discarded
            </h3>
          </div>

          <ul className="space-y-4">
            {staysOnDevice.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <Icon className="w-4 h-4 text-ink-muted stroke-[1.5]" />
                  </div>
                  <div className="space-y-0.5 text-[13px]">
                    <div className="font-medium text-ink">
                      {item.title}
                    </div>
                    <div className="text-ink-muted text-xs leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Column 2: Shared with your insurer */}
        <div className="space-y-5 md:pl-12">
          <div className="flex items-center gap-2 pb-2 border-b border-line">
            <Server className="w-4 h-4 text-ink-muted stroke-[1.5]" />
            <h3 className="font-serif text-lg font-normal text-ink">
              Kept on local ledger
            </h3>
          </div>

          <ul className="space-y-4">
            {sharedWithInsurer.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <Icon className="w-4 h-4 text-ink-muted stroke-[1.5]" />
                  </div>
                  <div className="space-y-0.5 text-[13px]">
                    <div className="font-medium text-ink">
                      {item.title}
                    </div>
                    <div className="text-ink-muted text-xs leading-relaxed">
                      {item.desc}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
