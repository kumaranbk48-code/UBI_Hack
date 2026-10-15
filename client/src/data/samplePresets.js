/**
 * SafeDrive IQ - Pre-built Sample CSV Telemetry Logs
 * Built-in for instant 1-click loading during judge demonstrations.
 */

// Helper to compute row signature client-side if needed
export function computeClientSignature(timestamp, speed, accelLong, accelLat, odo) {
  // Simple deterministic client hash matching server formula
  const str = `${timestamp}|${Number(speed).toFixed(1)}|${Number(accelLong).toFixed(2)}|${Number(accelLat).toFixed(2)}|${Number(odo).toFixed(1)}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + 'c0de';
}

export const SAMPLE_PRESETS = [
  {
    id: 'smooth_commuter',
    name: '01. Smooth Daily Commuter',
    badge: 'Safe Driver (95 Score)',
    color: 'emerald',
    description: 'Daytime driving (8:30 AM), gentle stops, within 60 km/h city limit. Unlocks max Tier C discount (Save $36/mo).',
    expectedScore: 96,
    expectedDiscount: '$36.00',
    tamperStatus: 'VERIFIED',
    filename: '01_smooth_commuter.csv',
  },
  {
    id: 'aggressive_night',
    name: '02. Aggressive Midnight Driver',
    badge: 'High Risk (58 Score)',
    color: 'rose',
    description: '1:30 AM late night run, 95 km/h over-speeding, 3 verified harsh brake slams. Surcharges applied.',
    expectedScore: 58,
    expectedDiscount: '$0.00 (Surcharge)',
    tamperStatus: 'VERIFIED',
    filename: '02_aggressive_night.csv',
  },
  {
    id: 'tampered_signature',
    name: '03. Tampered File (Excel Edited)',
    badge: 'Cryptographic Rejection',
    color: 'amber',
    description: 'Driver manually edited speed numbers in Notepad/Excel. HMAC signature mismatch detected and rejected.',
    expectedScore: null,
    expectedDiscount: 'Rejected',
    tamperStatus: 'SIGNATURE_MISMATCH',
    filename: '03_tampered_signature.csv',
  },
  {
    id: 'odometer_gap',
    name: '04. Unmonitored Odometer Gap',
    badge: 'Odometer Gap Alert',
    color: 'blue',
    description: '180 km driven while device was unplugged. Platform flags for friendly review rather than accusing.',
    expectedScore: 84,
    expectedDiscount: 'Needs Review',
    tamperStatus: 'ODOMETER_GAP',
    filename: '04_odometer_gap_unmonitored.csv',
  },
];
