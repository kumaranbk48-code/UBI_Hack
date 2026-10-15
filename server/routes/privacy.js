/**
 * SafeDrive IQ - PrivacyShield & Consent Management API Routes
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const db = require('../db');

const consentSchema = z.object({
  tier: z.enum(['TIER_A', 'TIER_B', 'TIER_C']),
  autoDeleteDays: z.number().min(7).max(365).optional(),
  fallbackFixed: z.boolean().optional(),
});

// GET /api/privacy/consent
router.get('/consent', async (req, res) => {
  try {
    const consent = await db.getConsent();
    const user = await db.getUser();
    res.json({
      consent,
      user,
      tiersInfo: {
        TIER_A: {
          name: 'Tier A — Minimal Mileage Only',
          description: 'Share only total distance traveled. Up to 10% discount. Zero habit tracking.',
          maxDiscount: 10,
          dataShared: ['Total Kilometers (Odometer)'],
        },
        TIER_B: {
          name: 'Tier B — Mileage + Daytime Driving',
          description: 'Share distance and daytime/night hours. Up to 20% discount. No brake tracking.',
          maxDiscount: 20,
          dataShared: ['Total Kilometers', 'Day vs. Night (12-4 AM) exposure'],
        },
        TIER_C: {
          name: 'Tier C — Full Habits & Safe Driving',
          description: 'Share smooth braking and speed limits. Up to 40% discount.',
          maxDiscount: 40,
          dataShared: ['Total Kilometers', 'Time of Day', 'Smooth Braking Rate', 'Speed Adherence'],
        },
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/privacy/consent
router.post('/consent', async (req, res) => {
  try {
    const parsed = consentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid consent data', details: parsed.error.format() });
    }

    const updated = await db.updateConsent(parsed.data);
    res.json({
      success: true,
      consent: updated,
      message: `Privacy settings updated. Active tier: ${updated.tier}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
