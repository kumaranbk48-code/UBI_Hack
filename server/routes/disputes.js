/**
 * SafeDrive IQ - TripCheck Dispute & Human-in-the-Loop Review API Routes
 */

const express = require('express');
const router = express.Router();
const { z } = require('zod');
const db = require('../db');

const disputeSchema = z.object({
  tripSummaryId: z.string().optional(),
  reason: z.enum(['PASSENGER_CAB', 'ANIMAL_EMERGENCY', 'POTHOLE_SPIKE', 'OTHER']),
  explanation: z.string().min(3, 'Please provide a short explanation'),
  attachedTripOnly: z.any().optional(), // ONLY this single trip's raw telemetry
});

// POST /api/disputes (Submit a dispute)
router.post('/', async (req, res) => {
  try {
    const parsed = disputeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid dispute submission', details: parsed.error.format() });
    }

    const user = await db.getUser();
    const hasPasses = user.disputePasses > 0;

    let status = 'UNDER_REVIEW';
    let autoCredit = 0.0;
    let message = 'Dispute submitted and forwarded to the Underwriter Review Queue.';

    // FAIRNESS RULE:
    // If the user has a free pass remaining, minor reasonable incidents (pothole, animal, passenger)
    // are automatically granted instant relief to maintain trust!
    if (hasPasses && ['PASSENGER_CAB', 'ANIMAL_EMERGENCY', 'POTHOLE_SPIKE'].includes(parsed.data.reason)) {
      status = 'AUTO_RESOLVED';
      autoCredit = 12.0; // Instant $12 fee reduction
      message = `Fairness rule applied: 1 of your 2 annual Free Passes was used. Instant credit of $${autoCredit.toFixed(2)} applied!`;
    }

    const dispute = await db.createDispute({
      ...parsed.data,
      status,
    });

    if (autoCredit > 0) {
      await db.reviewDispute(dispute.id, {
        decision: 'APPROVED',
        creditGiven: autoCredit,
        notes: `Automated relief granted via annual Free Pass (${parsed.data.reason}).`,
      });
    }

    res.json({
      success: true,
      dispute,
      status,
      autoCredit,
      passesRemaining: Math.max(0, user.disputePasses - (autoCredit > 0 ? 1 : 0)),
      message,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/disputes (Underwriter review queue)
router.get('/', async (req, res) => {
  try {
    const disputes = await db.getDisputes();
    res.json({ disputes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/disputes/review (Underwriter approves or rejects)
router.post('/review', async (req, res) => {
  try {
    const { disputeId, decision, creditGiven = 15.0, notes = '' } = req.body;

    if (!disputeId || !['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({ error: 'Valid disputeId and decision (APPROVED/REJECTED) are required.' });
    }

    const decisionRecord = await db.reviewDispute(disputeId, {
      decision,
      creditGiven: Number(creditGiven),
      notes,
    });

    res.json({
      success: true,
      decision: decisionRecord,
      message: `Dispute ${decision === 'APPROVED' ? 'Approved with credit' : 'Rejected'}.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
