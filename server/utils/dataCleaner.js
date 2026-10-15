/**
 * SafeDrive IQ - Data Quality & Noise Cleaning Filter
 * 
 * In real-world driving, sensors record noise:
 * - A pothole or curb bounce causes a momentary 0.1s G-force spike (mechanical vibration).
 * - A loose dongle or dropped object spikes G-force without slowing down the car.
 * 
 * This module filters out these false alarms and computes a Data Confidence Score.
 */

/**
 * Cleans telemetry rows and filters out mechanical noise and false alarms.
 * @param {Array} rows - raw telemetry rows
 * @returns {Object} cleaned data and quality report
 */
function cleanTelemetryData(rows) {
  if (!rows || rows.length === 0) {
    return {
      cleanedRows: [],
      noiseEventsRemoved: 0,
      confidenceBadge: 'LOW',
      qualityScore: 0,
      suppressPenalties: true,
      report: 'No data provided',
    };
  }

  const cleanedRows = [];
  let noiseEventsRemoved = 0;
  let falseBrakesFiltered = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = {
      ...rows[i],
      speed_kmh: Number(rows[i].speed_kmh || 0),
      accel_g_longitudinal: Number(rows[i].accel_g_longitudinal || 0),
      accel_g_lateral: Number(rows[i].accel_g_lateral || 0),
      odometer_km: Number(rows[i].odometer_km || 0),
    };

    // NOISE FILTER 1: Speed-Deceleration Correlation
    // If longitudinal deceleration looks harsh ( < -0.4g ), check whether the car actually slowed down.
    const isHarshDecel = row.accel_g_longitudinal < -0.4;
    let isRealBrake = isHarshDecel;

    if (isHarshDecel) {
      // Check next row (if available) to see if speed dropped by at least 8-10 km/h
      const nextRow = rows[i + 1];
      if (nextRow) {
        const speedDelta = row.speed_kmh - Number(nextRow.speed_kmh || 0);
        if (speedDelta < 6) {
          // Accelerometer jerked, but car speed barely changed -> Vibration/Sensor slip!
          isRealBrake = false;
          falseBrakesFiltered++;
          noiseEventsRemoved++;
          row.noiseFlag = 'FALSE_BRAKE_NO_SPEED_DROP';
        }
      }
    }

    // NOISE FILTER 2: Isolated Single-Instant Spike (< 0.5s)
    // A real emergency brake lasts 1.0 to 3.0 seconds across multiple samples.
    // An isolated 1-frame spike flanked by smooth driving is road noise / pothole.
    if (isRealBrake && i > 0 && i < rows.length - 1) {
      const prev = rows[i - 1];
      const next = rows[i + 1];
      const prevSmooth = Math.abs(Number(prev.accel_g_longitudinal || 0)) < 0.2;
      const nextSmooth = Math.abs(Number(next.accel_g_longitudinal || 0)) < 0.2;
      if (prevSmooth && nextSmooth) {
        // Isolated single-frame spike -> Pothole impact!
        isRealBrake = false;
        falseBrakesFiltered++;
        noiseEventsRemoved++;
        row.noiseFlag = 'POTHOLE_IMPACT_FILTERED';
      }
    }

    row.isVerifiedHarshBrake = isRealBrake;
    row.isVerifiedSharpTurn = Math.abs(row.accel_g_lateral) > 0.45;
    cleanedRows.push(row);
  }

  // Calculate Data Quality & Confidence
  const totalRows = rows.length;
  const validRows = totalRows - noiseEventsRemoved;
  const qualityRatio = totalRows > 0 ? validRows / totalRows : 0;
  const qualityScore = Math.round(qualityRatio * 100);

  let confidenceBadge = 'HIGH';
  let suppressPenalties = false;

  if (qualityScore >= 92) {
    confidenceBadge = 'HIGH';
  } else if (qualityScore >= 75) {
    confidenceBadge = 'MEDIUM';
  } else {
    confidenceBadge = 'LOW';
    // Core fairness rule: If sensor data is too noisy (<75% clean), NEVER penalize the user!
    suppressPenalties = true;
  }

  return {
    cleanedRows,
    noiseEventsRemoved,
    falseBrakesFiltered,
    confidenceBadge,
    qualityScore,
    suppressPenalties,
    summary: `Data validation complete. Cleaned ${noiseEventsRemoved} noise/pothole artifacts. Confidence: ${confidenceBadge} (${qualityScore}% valid).`,
  };
}

module.exports = {
  cleanTelemetryData,
};
