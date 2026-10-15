/**
 * SafeDrive IQ - Pricing & Actuarial Quote API Routes
 */

const express = require('express');
const router = express.Router();
const { calculateSafetyScore, calculateItemizedPremium, calculateWhatIfSavings } = require('../utils/scoringEngine');
const db = require('../db');

// POST /api/pricing/quote (Simulator dynamic calculation)
router.post('/quote', async (req, res) => {
  try {
    const {
      totalDistanceKm = 180,
      nightDistanceKm = 10,
      harshBrakeEvents = 0,
      sharpTurnEvents = 0,
      speedingKm = 5,
      tierOverride = null,
      fallbackFixed = false,
      disputeCredit = 0.0,
    } = req.body;

    const consent = await db.getConsent();
    const effectiveConsent = {
      ...consent,
      tier: tierOverride || consent?.tier || 'TIER_C',
      fallbackFixed: fallbackFixed ?? consent?.fallbackFixed,
    };

    const metrics = {
      totalDistanceKm: Number(totalDistanceKm),
      nightDistanceKm: Number(nightDistanceKm),
      harshBrakeEvents: Number(harshBrakeEvents),
      sharpTurnEvents: Number(sharpTurnEvents),
      speedingKm: Number(speedingKm),
    };

    const scoreData = calculateSafetyScore(metrics, false);
    const quote = calculateItemizedPremium(
      { ...metrics, safetyScore: scoreData.safetyScore },
      effectiveConsent,
      disputeCredit,
      true
    );

    res.json({
      metrics,
      scoreData,
      quote,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pricing/current
router.get('/current', async (req, res) => {
  try {
    const quote = await db.getLatestQuote();
    const summary = await db.getLatestTripSummary();
    const consent = await db.getConsent();

    if (!quote) {
      // Return default unsynced quote
      const defaultQuote = calculateItemizedPremium(
        { totalDistanceKm: 0, safetyScore: 100 },
        consent,
        0.0,
        false
      );
      return res.json({ quote: defaultQuote, isSynced: false });
    }

    res.json({ quote, summary, isSynced: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pricing/what-if (Interactive slider prediction)
router.post('/what-if', (req, res) => {
  try {
    const {
      currentMetrics = { totalDistanceKm: 250, nightDistanceKm: 60, harshBrakeEvents: 2 },
      nightReductionPercent = 25,
    } = req.body;

    const projection = calculateWhatIfSavings(currentMetrics, Number(nightReductionPercent));
    res.json(projection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
