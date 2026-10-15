/**
 * SafeDrive IQ - Tamper Check & Cryptographic Verification
 * 
 * Each CSV log produced by the simulated vehicle logger carries an HMAC-SHA256 signature.
 * If any numbers (speed, braking, odometer) were modified in Excel or Notepad,
 * the signature will not match and the platform rejects the tampered file.
 */

const crypto = require('crypto');

const DEFAULT_SECRET = process.env.HMAC_SECRET || 'safedrive-iq-secret-key-2026';

/**
 * Computes an HMAC-SHA256 hash for a single telemetry record
 */
function normalizeNum(val, decimals) {
  let str = Number(val || 0).toFixed(decimals);
  if (str === '-0.00' || str === '-0.0' || str === '-0') {
    str = (0).toFixed(decimals);
  }
  return str;
}



function computeRowSignature(row, secret = DEFAULT_SECRET) {
  // Canonical string: timestamp|speed_kmh|accel_g_longitudinal|accel_g_lateral|odometer_km
  const message = [
    row.timestamp,
    normalizeNum(row.speed_kmh, 1),
    normalizeNum(row.accel_g_longitudinal, 2),
    normalizeNum(row.accel_g_lateral, 2),
    normalizeNum(row.odometer_km, 1),
  ].join('|');

  return crypto.createHmac('sha256', secret).update(message).digest('hex').substring(0, 16);
}


/**
 * Verifies a batch of CSV rows against their signatures
 * @param {Array} rows - parsed CSV objects
 * @returns {Object} verification result
 */
function verifyFileSignatures(rows, secret = DEFAULT_SECRET) {
  if (!rows || rows.length === 0) {
    return { isValid: false, reason: 'Empty file', tamperedRowCount: 0 };
  }

  let tamperedRowCount = 0;
  const sampleErrors = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.signature) {
      tamperedRowCount++;
      if (sampleErrors.length < 3) sampleErrors.push(`Row ${i + 1}: Missing signature`);
      continue;
    }

    const expectedSignature = computeRowSignature(row, secret);
    if (row.signature.trim() !== expectedSignature) {
      tamperedRowCount++;
      if (sampleErrors.length < 3) {
        sampleErrors.push(
          `Row ${i + 1} (${row.timestamp}): Signature mismatch. Expected ${expectedSignature}, found ${row.signature}`
        );
      }
    }
  }

  const isValid = tamperedRowCount === 0;

  return {
    isValid,
    tamperStatus: isValid ? 'VERIFIED' : 'SIGNATURE_MISMATCH',
    totalRows: rows.length,
    tamperedRowCount,
    sampleErrors,
    message: isValid
      ? 'All cryptographic signatures verified. File integrity 100% intact.'
      : `Integrity Alert: ${tamperedRowCount} row(s) appear to have been edited or modified after logging.`,
  };
}

/**
 * Checks for unmonitored kilometer gaps between trips.
 * Flags gaps for review without making accusations.
 */
function checkOdometerContinuity(lastRecordedOdometer, currentFileStartOdometer, loggedDistance) {
  const previousOdo = Number(lastRecordedOdometer || 0);
  const startOdo = Number(currentFileStartOdometer || previousOdo);
  const gap = startOdo - previousOdo;

  // If start odometer is significantly ahead of last known odometer (> 2.0 km), flag it
  if (previousOdo > 0 && gap > 2.0) {
    return {
      hasGap: true,
      gapKm: Number(gap.toFixed(1)),
      tamperStatus: 'ODOMETER_GAP',
      message: `Unmonitored Gap Detected: Vehicle odometer increased by ${gap.toFixed(1)} km before this log started. Flagged for review.`,
    };
  }

  return {
    hasGap: false,
    gapKm: 0,
    tamperStatus: 'VERIFIED',
    message: 'Odometer sequence is continuous and verified.',
  };
}

module.exports = {
  computeRowSignature,
  verifyFileSignatures,
  checkOdometerContinuity,
};
