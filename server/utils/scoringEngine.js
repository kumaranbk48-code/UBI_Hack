/**
 * SafeDrive IQ - Actuarial Scoring & ExplainMyPremium Engine
 * 
 * 100% Deterministic & Regulatory-Compliant.
 * NO trained "black-box" machine learning models.
 * Calculates monthly averages, applies fair buffers, and produces an itemized receipt.
 */

const BASE_PREMIUM = 100.0; // Standard base insurance rate

/**
 * Calculates the monthly SafeScore (0 to 100)
 * Uses monthly averages over distance, ensuring 1 or 2 hard brakes never ruin a good driver's score.
 */
function calculateSafetyScore(metrics, suppressPenalties = false) {
  if (suppressPenalties) {
    return {
      safetyScore: 90, // Protected score under low confidence
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
  if (safetyScore >= 90) scoreGrade = 'Elite Safe Driver ⭐⭐⭐⭐⭐';
  else if (safetyScore >= 80) scoreGrade = 'Careful Driver ⭐⭐⭐⭐';
  else if (safetyScore >= 70) scoreGrade = 'Standard Driver ⭐⭐⭐';
  else scoreGrade = 'High Risk Caution ⚠️';

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
 * Calculates the ExplainMyPremium itemized receipt
 * Enforces Consent Tiers:
 * - TIER_A: Mileage only (up to 10% discount)
 * - TIER_B: Mileage + Night factor (up to 20% discount)
 * - TIER_C: Full driving habits (up to 40% discount)
 */
function calculateItemizedPremium(scoreData, consentSettings, disputeCredit = 0.0, isSynced = true) {
  // If user has not synced a file for the month, standard base price applies with zero discount!
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

  // If user opted into the Fallback Fixed-Price Plan (e.g. bad road area)
  if (consentSettings?.fallbackFixed) {
    const fixedRate = 85.0; // Flat discounted rate without telematics tracking
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

  // 1. Low Mileage Bonus (Available in ALL tiers: Tier A, B, C)
  // Up to $10 discount if total mileage < 500 km/mo
  let mileageDiscount = 0.0;
  if (totalDistanceKm < 200) mileageDiscount = 10.0;
  else if (totalDistanceKm < 400) mileageDiscount = 7.0;
  else if (totalDistanceKm < 600) mileageDiscount = 4.0;

  // 2. Daytime / Low Night Bonus (Available in Tier B and Tier C)
  // Up to $10 bonus if night driving is minimal (<5% of distance)
  let nightFactor = 0.0;
  if (tier === 'TIER_B' || tier === 'TIER_C') {
    const nightRatio = nightDistanceKm / Math.max(1, totalDistanceKm);
    if (nightRatio <= 0.05) nightFactor = 10.0; // $10 reward
    else if (nightRatio <= 0.15) nightFactor = 5.0;
    else if (nightRatio > 0.3) nightFactor = -8.0; // Penalty for extreme late night driving
  }

  // 3. Smooth Driving & Safe Braking Reward (Tier C ONLY)
  // Up to $20 discount for high safety score
  let smoothBrakeReward = 0.0;
  if (tier === 'TIER_C') {
    if (safetyScore >= 95) smoothBrakeReward = 20.0;
    else if (safetyScore >= 90) smoothBrakeReward = 16.0;
    else if (safetyScore >= 80) smoothBrakeReward = 10.0;
    else if (safetyScore >= 70) smoothBrakeReward = 4.0;
    else smoothBrakeReward = -10.0; // High risk surcharge
  }

  // Cap discounts by tier maximums
  let maxPossibleDiscount = 10.0;
  if (tier === 'TIER_B') maxPossibleDiscount = 20.0;
  if (tier === 'TIER_C') maxPossibleDiscount = 40.0;

  const rawDiscounts = mileageDiscount + Math.max(0, nightFactor) + Math.max(0, smoothBrakeReward);
  const cappedDiscount = Math.min(maxPossibleDiscount, rawDiscounts);

  // Surcharges (if reckless or extreme night)
  const surcharges = (nightFactor < 0 ? Math.abs(nightFactor) : 0) + (smoothBrakeReward < 0 ? Math.abs(smoothBrakeReward) : 0);

  // Final Premium computation
  const credit = Number(disputeCredit || 0);
  const calculatedPremium = BASE_PREMIUM - cappedDiscount + surcharges - credit;
  const finalPremium = Math.max(30.0, Math.round(calculatedPremium * 100) / 100);
  const totalSaved = Math.max(0, Math.round((BASE_PREMIUM - finalPremium) * 100) / 100);
  const discountPercentage = Math.round((totalSaved / BASE_PREMIUM) * 100);

  // Build clean, transparent itemized receipt lines
  const receiptLines = [
    { label: 'Standard Insurer Base Premium', amount: BASE_PREMIUM, type: 'base' },
    { label: `Low Mileage Reward (${Math.round(totalDistanceKm)} km)`, amount: -mileageDiscount, type: 'discount' },
  ];

  if (tier !== 'TIER_A') {
    receiptLines.push({
      label: nightFactor >= 0 ? 'Safe Daytime Driving Bonus' : 'High Night Exposure Surcharge (12-4 AM)',
      amount: -nightFactor,
      type: nightFactor >= 0 ? 'discount' : 'surcharge',
    });
  }

  if (tier === 'TIER_C') {
    receiptLines.push({
      label: smoothBrakeReward >= 0 ? `SafeScore Habit Reward (${safetyScore}/100)` : 'Reckless Telematics Surcharge',
      amount: -smoothBrakeReward,
      type: smoothBrakeReward >= 0 ? 'discount' : 'surcharge',
    });
  }

  if (credit > 0) {
    receiptLines.push({
      label: 'Approved Dispute Credit (Human Review)',
      amount: -credit,
      type: 'credit',
    });
  }

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
    receiptLines,
  };
}

/**
 * What-If Slider Prediction Helper
 * "If you reduce night driving by X%, you save $Y"
 */
function calculateWhatIfSavings(currentMetrics, nightReductionPercent = 20) {
  const currentNightKm = currentMetrics.nightDistanceKm || 50;
  const reducedNightKm = currentNightKm * (1 - nightReductionPercent / 100);

  const improvedMetrics = {
    ...currentMetrics,
    nightDistanceKm: reducedNightKm,
  };

  const currentScore = calculateSafetyScore(currentMetrics).safetyScore;
  const improvedScore = calculateSafetyScore(improvedMetrics).safetyScore;

  const currentQuote = calculateItemizedPremium(
    { ...currentMetrics, safetyScore: currentScore },
    { tier: 'TIER_C' }
  );
  const improvedQuote = calculateItemizedPremium(
    { ...improvedMetrics, safetyScore: improvedScore },
    { tier: 'TIER_C' }
  );

  const additionalSavings = Math.max(0, currentQuote.finalPremium - improvedQuote.finalPremium);

  return {
    nightReductionPercent,
    currentPremium: currentQuote.finalPremium,
    projectedPremium: improvedQuote.finalPremium,
    additionalSavings: Math.round(additionalSavings * 100) / 100,
    scoreImprovement: improvedScore - currentScore,
  };
}

module.exports = {
  calculateSafetyScore,
  calculateItemizedPremium,
  calculateWhatIfSavings,
};
