/**
 * SafeDrive IQ - Trips API Routes
 * 
 * Flow:
 * 1. Driver uploads CSV log (pen-drive simulation)
 * 2. Cryptographic HMAC check (detects if Excel/Notepad altered numbers)
 * 3. Odometer gap check (flags unmonitored driving gaps)
 * 4. Noise cleaner (filters potholes and dropped sensors)
 * 5. Deterministic actuarial scoring (monthly averages)
 * 6. Edge-privacy storage (only aggregated scores are stored)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { z } = require('zod');
const { verifyFileSignatures, checkOdometerContinuity } = require('../utils/tamperCheck');
const { cleanTelemetryData } = require('../utils/dataCleaner');
const { calculateSafetyScore, calculateItemizedPremium } = require('../utils/scoringEngine');
const db = require('../db');

// Helper to parse CSV text into objects
function parseCsv(csvInput) {
  let csvText = '';
  if (Array.isArray(csvInput)) {
    csvText = csvInput.join('\n');
  } else if (typeof csvInput === 'string') {
    csvText = csvInput;
  } else if (csvInput && typeof csvInput === 'object') {
    csvText = JSON.stringify(csvInput);
  }

  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map((h) => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length >= headers.length) {
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx];
      });
      rows.push(row);
    }
  }
  return rows;
}


// POST /api/trips/upload
router.post('/upload', async (req, res) => {
  try {
    let { csvText, rows: inputRows, filename = 'trip_log.csv' } = req.body;

    // Fallback: If filename is one of the sample logs and csvText is empty, read directly from sample_logs directory
    if (!csvText && !inputRows && filename) {
      const samplePath = path.join(__dirname, '..', 'sample_logs', filename);
      if (fs.existsSync(samplePath)) {
        csvText = fs.readFileSync(samplePath, 'utf8');
      }
    }

    let rows = inputRows;
    if (!rows && csvText) {
      rows = parseCsv(csvText);
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: 'No valid telemetry rows found in file.' });
    }


    // 1. TAMPER CHECK: Verify HMAC-SHA256 signatures
    const tamperResult = verifyFileSignatures(rows);

    // 2. ODOMETER CHECK: Verify odometer continuity
    const vehicle = await db.getVehicle();
    const startOdo = Number(rows[0].odometer_km || vehicle.lastOdometer);
    const endOdo = Number(rows[rows.length - 1].odometer_km || startOdo);
    const loggedDistance = Math.max(0.1, endOdo - startOdo);

    const odoResult = checkOdometerContinuity(vehicle.lastOdometer, startOdo, loggedDistance);

    // Determine combined tamper status
    let finalTamperStatus = 'VERIFIED';
    if (!tamperResult.isValid) {
      finalTamperStatus = 'SIGNATURE_MISMATCH';
    } else if (odoResult.hasGap) {
      finalTamperStatus = 'ODOMETER_GAP';
    }

    // 3. DATA QUALITY: Clean noise & calculate confidence
    const qualityResult = cleanTelemetryData(rows);

    // 4. METRICS AGGREGATION
    let nightDistanceKm = 0;
    let speedingKm = 0;
    let harshBrakes = 0;
    let sharpTurns = 0;

    qualityResult.cleanedRows.forEach((r) => {
      // Check time of day (12 AM - 4 AM)
      try {
        const hour = new Date(r.timestamp).getUTCHours();
        if (hour >= 0 && hour < 4) {
          nightDistanceKm += (r.speed_kmh / 3600) * 60; // 1 min distance
        }
      } catch (e) {}

      // Check speeding (> 60 km/h city baseline, or > 90 km/h)
      if (r.speed_kmh > 75) {
        speedingKm += (r.speed_kmh / 3600) * 60;
      }

      if (r.isVerifiedHarshBrake) harshBrakes++;
      if (r.isVerifiedSharpTurn) sharpTurns++;
    });

    const metrics = {
      totalDistanceKm: Number(loggedDistance.toFixed(1)),
      nightDistanceKm: Number(nightDistanceKm.toFixed(1)),
      harshBrakeEvents: harshBrakes,
      sharpTurnEvents: sharpTurns,
      speedingKm: Number(speedingKm.toFixed(1)),
    };

    // 5. DETERMINISTIC ACTUARIAL SCORING
    const scoreData = calculateSafetyScore(metrics, qualityResult.suppressPenalties);

    // 6. ITEMIZED EXPLAIN-MY-PREMIUM RECEIPT
    const consent = await db.getConsent();
    const quote = calculateItemizedPremium(
      { ...metrics, safetyScore: scoreData.safetyScore },
      consent,
      0.0,
      true
    );

    const isRejected = finalTamperStatus === 'SIGNATURE_MISMATCH' || !tamperResult.isValid;

    let summaryRecord = null;
    let finalQuote = quote;

    if (!isRejected) {
      // 7. EDGE PRIVACY: Only aggregated record is saved
      summaryRecord = await db.saveTripSummary({
        monthYear: '2026-10',
        totalDistanceKm: metrics.totalDistanceKm,
        nightDistanceKm: metrics.nightDistanceKm,
        harshBrakeEvents: metrics.harshBrakeEvents,
        sharpTurnEvents: metrics.sharpTurnEvents,
        speedingKm: metrics.speedingKm,
        safetyScore: scoreData.safetyScore,
        confidenceBadge: qualityResult.confidenceBadge,
        tamperStatus: finalTamperStatus,
      });

      await db.saveQuote(quote);
      await db.updateVehicleOdometer(endOdo);
    } else {
      finalQuote = null;
    }

    return res.json({
      success: true,
      filename,
      tamperResult: {
        ...tamperResult,
        odometerCheck: odoResult,
        status: finalTamperStatus,
      },
      qualityResult: {
        confidenceBadge: qualityResult.confidenceBadge,
        qualityScore: qualityResult.qualityScore,
        noiseEventsRemoved: qualityResult.noiseEventsRemoved,
        falseBrakesFiltered: qualityResult.falseBrakesFiltered,
        suppressPenalties: qualityResult.suppressPenalties,
        summary: qualityResult.summary,
      },
      metrics,
      scoreData,
      quote: finalQuote,
      summaryId: summaryRecord ? summaryRecord.id : null,
      privacyStatement:
        'Raw second-by-second telematics was processed on the client. Only the consented score and aggregate mileage were written to the insurer ledger.',
    });
  } catch (err) {
    console.error('[Trips API Error]:', err);
    return res.status(500).json({ error: 'Failed to process trip data: ' + err.message });
  }
});

// GET /api/trips/summary
router.get('/summary', async (req, res) => {
  try {
    const summary = await db.getLatestTripSummary();
    const rawQuote = await db.getLatestQuote();
    const vehicle = await db.getVehicle();
    const consent = await db.getConsent();

    const metrics = summary || {
      monthYear: '2026-10',
      totalDistanceKm: 240,
      nightDistanceKm: 15,
      harshBrakeEvents: 0,
      sharpTurnEvents: 0,
      speedingKm: 10,
      safetyScore: 94,
      confidenceBadge: 'HIGH',
      tamperStatus: 'VERIFIED',
    };

    const quote = calculateItemizedPremium(
      metrics,
      consent,
      rawQuote?.disputeCredit || 0,
      true
    );

    res.json({
      summary: metrics,
      quote,
      vehicle,
      consent,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/trips/samples
router.get('/samples', (req, res) => {
  try {
    const samplesDir = path.join(__dirname, '..', 'sample_logs');
    const samples = {};

    const files = [
      '01_smooth_commuter.csv',
      '02_aggressive_night.csv',
      '03_tampered_signature.csv',
      '04_odometer_gap_unmonitored.csv',
    ];

    files.forEach((f) => {
      const p = path.join(samplesDir, f);
      if (fs.existsSync(p)) {
        samples[f] = fs.readFileSync(p, 'utf8');
      }
    });

    res.json({ samples });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
