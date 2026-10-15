/**
 * SafeDrive IQ - Client Actuarial Scoring & Pricing Helper
 * 
 * Re-exports the exact deterministic math from server/utils/scoringEngine.js
 * No new math or black boxes. Used for instant client-side what-if projections & top tips.
 */

export const BASE_PREMIUM = 100.0; // Standard base insurance rate

/**
 * Calculates the monthly SafeScore (0 to 100)
 * Uses monthly averages over distance with 1 free brake per 150 km fairness buffer.
 */
export function calculateSafetyScore(metrics, suppressPenalties = false) {
  if (suppressPenalties) {
    return {
      safetyScore: 90,
      brakingDeduction: 0,
      speedingDeduction: 0,
      nightDeduction: 0,
      turnDeduction: 0,
      scoreGrade: 'Protected (Low Sensor Confidence)',
    };
  }

  const {
    totalDistanceKm = 100,
    nightDistanceKm = 0,
    harshBrakeEvents = 0,
    sharpTurnEvents = 0,
    speedingKm = 0,
  } = metrics;

  const distance = Math.max(10, totalDistanceKm);

  // 1. Harsh Braking Rate (with Fairness Buffer: 1 free emergency stop per 150 km)
  const freeBrakeBuffer = Math.floor(distance / 150);
  const penalizedBrakes = Math.max(0, harshBrakeEvents - freeBrakeBuffer);
  const brakesPer100Km = (penalizedBrakes / distance) * 100;
  const brakingDeduction = Math.min(25, Math.round(brakesPer100Km * 4));

  // 2. Speeding Deductions (over 60 city / 90 highway)
  const speedingRatio = Math.min(1.0, speedingKm / distance);
  const speedingDeduction = Math.min(25, Math.round(speedingRatio * 35));

  // 3. Night Driving Exposure (12 AM - 4 AM)
  const nightRatio = Math.min(1.0, nightDistanceKm / distance);
  const nightDeduction = Math.min(20, Math.round(nightRatio * 30));

  // 4. Sharp Turn Deductions
  const turnsPer100Km = (sharpTurnEvents / distance) * 100;
  const turnDeduction = Math.min(10, Math.round(turnsPer100Km * 2));

  // Final SafeScore (0 to 100)
  const rawScore = 100 - brakingDeduction - speedingDeduction - nightDeduction - turnDeduction;
  const safetyScore = Math.max(40, Math.min(100, Math.round(rawScore)));

  let scoreGrade = 'Average Driver';
  if (safetyScore >= 90) scoreGrade = 'Elite Safe Driver';
  else if (safetyScore >= 80) scoreGrade = 'Careful Driver';
  else if (safetyScore >= 70) scoreGrade = 'Standard Driver';
  else scoreGrade = 'High Risk Caution';

  return {
    safetyScore,
    scoreGrade,
    brakingDeduction,
    speedingDeduction,
    nightDeduction,
    turnDeduction,
    freeBrakesForgiven: Math.min(freeBrakeBuffer, harshBrakeEvents),
  };
}

/**
 * Calculates the ExplainMyPremium itemized receipt using existing actuarial tiers
 */
export function calculateItemizedPremium(scoreData, consentSettings, disputeCredit = 0.0, isSynced = true) {
  if (!isSynced) {
    return {
      basePremium: BASE_PREMIUM,
      mileageDiscount: 0.0,
      nightFactor: 0.0,
      smoothBrakeReward: 0.0,
      disputeCredit: 0.0,
      finalPremium: BASE_PREMIUM,
      totalSaved: 0.0,
      discountPercentage: 0,
      status: 'DEFAULT_APPLIED (Unsynced Month)',
      receiptLines: [
        { label: 'Standard Base Premium', amount: BASE_PREMIUM, type: 'base' },
        { label: 'Monthly Sync Status', amount: 0, type: 'note', text: 'No log synced — standard rate applies' },
      ],
    };
  }

  if (consentSettings?.fallbackFixed) {
    const fixedRate = 85.0;
    return {
      basePremium: BASE_PREMIUM,
      mileageDiscount: 15.0,
      nightFactor: 0.0,
      smoothBrakeReward: 0.0,
      disputeCredit: Number(disputeCredit || 0),
      finalPremium: Math.max(30, fixedRate - Number(disputeCredit || 0)),
      totalSaved: 15.0 + Number(disputeCredit || 0),
      discountPercentage: 15,
      status: 'FIXED_FALLBACK_ACTIVE',
      receiptLines: [
        { label: 'Standard Base Premium', amount: BASE_PREMIUM, type: 'base' },
        { label: 'Fixed Fallback Discount', amount: -15.0, type: 'discount' },
        ...(disputeCredit > 0 ? [{ label: 'Approved Dispute Credit', amount: -disputeCredit, type: 'credit' }] : []),
      ],
    };
  }

  const tier = consentSettings?.tier || 'TIER_C';
  const { totalDistanceKm = 100, nightDistanceKm = 0, safetyScore = 90 } = scoreData;

  // 1. Low Mileage Bonus
  let mileageDiscount = 0.0;
  if (totalDistanceKm < 200) mileageDiscount = 10.0;
  else if (totalDistanceKm < 400) mileageDiscount = 7.0;
  else if (totalDistanceKm < 600) mileageDiscount = 4.0;

  // 2. Daytime / Low Night Bonus
  let nightFactor = 0.0;
  if (tier === 'TIER_B' || tier === 'TIER_C') {
    const nightRatio = nightDistanceKm / Math.max(1, totalDistanceKm);
    if (nightRatio <= 0.05) nightFactor = 10.0;
    else if (nightRatio <= 0.15) nightFactor = 5.0;
    else if (nightRatio > 0.3) nightFactor = -8.0;
  }

  // 3. Smooth Driving & Safe Braking Reward
  let smoothBrakeReward = 0.0;
  if (tier === 'TIER_C') {
    if (safetyScore >= 95) smoothBrakeReward = 20.0;
    else if (safetyScore >= 90) smoothBrakeReward = 16.0;
    else if (safetyScore >= 80) smoothBrakeReward = 10.0;
    else if (safetyScore >= 70) smoothBrakeReward = 4.0;
    else smoothBrakeReward = -10.0;
  }

  // Cap discounts by tier maximums
  let maxPossibleDiscount = 10.0;
  if (tier === 'TIER_B') maxPossibleDiscount = 20.0;
  if (tier === 'TIER_C') maxPossibleDiscount = 40.0;

  const rawDiscounts = mileageDiscount + Math.max(0, nightFactor) + Math.max(0, smoothBrakeReward);
  const cappedDiscount = Math.min(maxPossibleDiscount, rawDiscounts);
  const surcharges = (nightFactor < 0 ? Math.abs(nightFactor) : 0) + (smoothBrakeReward < 0 ? Math.abs(smoothBrakeReward) : 0);

  const credit = Number(disputeCredit || 0);
  const calculatedPremium = BASE_PREMIUM - cappedDiscount + surcharges - credit;
  const finalPremium = Math.max(30.0, Math.round(calculatedPremium * 100) / 100);
  const totalSaved = Math.max(0, Math.round((BASE_PREMIUM - finalPremium) * 100) / 100);
  const discountPercentage = Math.round((totalSaved / BASE_PREMIUM) * 100);

  return {
    basePremium: BASE_PREMIUM,
    mileageDiscount,
    nightFactor,
    smoothBrakeReward,
    disputeCredit: credit,
    finalPremium,
    totalSaved,
    discountPercentage,
    tier,
    status: 'SYNCED',
  };
}

/**
 * Computes Top Opportunity Tip by calling the existing pricing calculation with 1 slider reduced at a time.
 * Evaluates realistic reductions (never below 0), picks largest saving, or shows positive message.
 */
export function computeTopTip(currentMetrics, consent = { tier: 'TIER_C' }) {
  const currentScore = calculateSafetyScore(currentMetrics).safetyScore;
  const currentQuote = calculateItemizedPremium({ ...currentMetrics, safetyScore: currentScore }, consent);
  const currentPrice = currentQuote.finalPremium;

  const candidates = [];

  // 1. Night driving reduction
  if (currentMetrics.nightDistanceKm > 0) {
    const cuts = [10, 20, currentMetrics.nightDistanceKm];
    for (const cut of cuts) {
      const actualCut = Math.min(cut, currentMetrics.nightDistanceKm);
      if (actualCut > 0) {
        const testM = { ...currentMetrics, nightDistanceKm: currentMetrics.nightDistanceKm - actualCut };
        const score = calculateSafetyScore(testM).safetyScore;
        const q = calculateItemizedPremium({ ...testM, safetyScore: score }, consent);
        const savings = currentPrice - q.finalPremium;
        if (savings > 0) {
          candidates.push({
            label: `cutting ${actualCut} km of night driving`,
            savings,
            cut: actualCut,
          });
        }
      }
    }
  }

  // 2. Harsh braking reduction
  if (currentMetrics.harshBrakeEvents > 0) {
    const cuts = [1, currentMetrics.harshBrakeEvents];
    for (const cut of cuts) {
      const actualCut = Math.min(cut, currentMetrics.harshBrakeEvents);
      const testM = { ...currentMetrics, harshBrakeEvents: currentMetrics.harshBrakeEvents - actualCut };
      const score = calculateSafetyScore(testM).safetyScore;
      const q = calculateItemizedPremium({ ...testM, safetyScore: score }, consent);
      const savings = currentPrice - q.finalPremium;
      if (savings > 0) {
        candidates.push({
          label: `avoiding ${actualCut} harsh ${actualCut === 1 ? 'brake' : 'brakes'}`,
          savings,
          cut: actualCut,
        });
      }
    }
  }

  // 3. Over-limit speeding reduction
  if (currentMetrics.speedingKm > 0) {
    const cuts = [10, 20, currentMetrics.speedingKm];
    for (const cut of cuts) {
      const actualCut = Math.min(cut, currentMetrics.speedingKm);
      if (actualCut > 0) {
        const testM = { ...currentMetrics, speedingKm: currentMetrics.speedingKm - actualCut };
        const score = calculateSafetyScore(testM).safetyScore;
        const q = calculateItemizedPremium({ ...testM, safetyScore: score }, consent);
        const savings = currentPrice - q.finalPremium;
        if (savings > 0) {
          candidates.push({
            label: `reducing speeding by ${actualCut} km`,
            savings,
            cut: actualCut,
          });
        }
      }
    }
  }

  // 4. Distance reduction
  if (currentMetrics.totalDistanceKm > 100) {
    const cuts = [50, 100];
    for (const cut of cuts) {
      const actualCut = Math.min(cut, currentMetrics.totalDistanceKm - 20);
      if (actualCut > 0) {
        const testM = { ...currentMetrics, totalDistanceKm: currentMetrics.totalDistanceKm - actualCut };
        const score = calculateSafetyScore(testM).safetyScore;
        const q = calculateItemizedPremium({ ...testM, safetyScore: score }, consent);
        const savings = currentPrice - q.finalPremium;
        if (savings > 0) {
          candidates.push({
            label: `reducing monthly driving by ${actualCut} km`,
            savings,
            cut: actualCut,
          });
        }
      }
    }
  }

  // Sort by highest dollar savings first
  candidates.sort((a, b) => b.savings - a.savings || a.cut - b.cut);

  if (candidates.length > 0) {
    return {
      hasOpportunity: true,
      text: `Biggest opportunity: ${candidates[0].label} would save about $${candidates[0].savings.toFixed(2)} per month.`,
    };
  }

  return {
    hasOpportunity: false,
    text: "You're already at the best rate for this month.",
  };
}
