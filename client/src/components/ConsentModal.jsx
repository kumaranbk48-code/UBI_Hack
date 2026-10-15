import React, { useState } from 'react';
import { X, ShieldCheck, Check, Lock } from 'lucide-react';
import { Button } from './primitives';

export function ConsentModal({ isOpen, onClose, currentConsent, onSaveConsent }) {
  if (!isOpen) return null;

  const [selectedTier, setSelectedTier] = useState(currentConsent?.tier || 'TIER_C');
  const [autoDeleteDays, setAutoDeleteDays] = useState(currentConsent?.autoDeleteDays || 30);
  const [fallbackFixed, setFallbackFixed] = useState(currentConsent?.fallbackFixed || false);
  const [saving, setSaving] = useState(false);

  const tiers = [
    {
      id: 'TIER_A',
      name: 'Tier A: Odometer Only',
      discount: 'Up to 10% off',
      badge: 'Maximum privacy',
      dataShared: ['Total Kilometres verified via odometer'],
      dataProtected: ['No braking analysis', 'No speed tracking', 'Zero GPS coordinates'],
    },
    {
      id: 'TIER_B',
      name: 'Tier B: Mileage + Day/Night',
      discount: 'Up to 20% off',
      badge: 'Balanced',
      dataShared: ['Total Kilometres', 'Daytime vs. Night exposure (12-4 AM)'],
      dataProtected: ['No braking analysis', 'No speed tracking', 'Zero GPS coordinates'],
    },
    {
      id: 'TIER_C',
      name: 'Tier C: Full Driving Habits',
      discount: 'Up to 40% off',
      badge: 'Maximum savings',
      dataShared: ['Total Kilometres', 'Day vs. Night hours', 'Gentle braking rate', 'Speed limit adherence'],
      dataProtected: ['Raw GPS coordinates masked', 'Phone tracking NOT used', 'Processed on-device'],
    },
  ];

  const handleSave = async () => {
    setSaving(true);
    await onSaveConsent({
      tier: selectedTier,
      autoDeleteDays: Number(autoDeleteDays),
      fallbackFixed,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consentModalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-[2px] animate-fadeIn"
    >
      <div className="relative w-full max-w-3xl rounded-[10px] bg-surface-raised border border-line p-6 sm:p-7 shadow-popover overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-line">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle block mb-1">
              Data Governance
            </span>
            <h2 id="consentModalTitle" className="text-xl font-serif font-normal text-ink">
              PrivacyShield™ consent controls
            </h2>
            <p className="text-[13px] text-ink-muted mt-1">
              Select the data tier you consent to share. Raw trip records remain strictly on your local device.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-ink-subtle hover:text-ink focus-visible:outline-none"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Tier Cards Grid */}
        <div className="mt-5 space-y-3">
          <label className="text-[12px] font-medium text-ink block">
            Select policy data tier
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {tiers.map((t) => {
              const isSelected = selectedTier === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTier(t.id)}
                  className={`cursor-pointer rounded-[8px] p-4 border transition-colors relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-brand bg-brand-light/30 ring-1 ring-brand'
                      : 'border-line bg-surface hover:border-line-dark'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-ink-subtle uppercase tracking-[0.06em]">
                        {t.badge}
                      </span>
                      <span className="text-[12px] font-semibold text-brand tabular-nums">
                        {t.discount}
                      </span>
                    </div>

                    <h3 className="text-[14px] font-semibold text-ink mb-2">{t.name}</h3>

                    <div className="space-y-1.5 text-[12px] mb-3">
                      <div className="text-ink-subtle font-medium text-[11px] uppercase tracking-[0.05em]">Shared:</div>
                      {t.dataShared.map((d, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-ink-muted">
                          <Check className="w-3.5 h-3.5 text-status-positive shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line text-[11px] text-ink-subtle space-y-1">
                    <div className="font-medium flex items-center gap-1 text-ink-muted">
                      <Lock className="w-3 h-3 text-ink-subtle" /> Protected on-device:
                    </div>
                    {t.dataProtected.map((p, i) => (
                      <div key={i} className="truncate">
                        • {p}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Retention & Fallback Settings */}
        <div className="mt-6 p-4 rounded-[8px] bg-surface border border-line space-y-4">
          {/* Retention Period */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-medium text-ink">
                Auto-Delete retention window
              </div>
              <div className="text-[12px] text-ink-muted">
                Trip aggregates are permanently purged from insurer servers after:
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-bg p-1 rounded-[6px] border border-line">
              {[15, 30, 60, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setAutoDeleteDays(days)}
                  className={`px-3 py-1 text-xs rounded-[4px] font-medium transition-colors ${
                    autoDeleteDays === days
                      ? 'bg-surface-raised text-brand shadow-soft font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>

          {/* Fallback Fixed-Price Option */}
          <div className="pt-3 border-t border-line flex items-start justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium text-ink">
                Guaranteed Flat-Price Plan ($85.00/mo)
              </div>
              <div className="text-[12px] text-ink-muted mt-0.5 leading-relaxed">
                Opt into a standard fixed monthly rate with complete exemption from driving habit monitoring.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
              <input
                type="checkbox"
                checked={fallbackFixed}
                onChange={(e) => setFallbackFixed(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-raised after:border-line after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-line">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" loading={saving} onClick={handleSave}>
            Apply preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
