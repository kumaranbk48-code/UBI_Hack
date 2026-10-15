/**
 * SafeDrive IQ - Database Access Layer
 * Includes an Automatic In-Memory Fail-Safe Store.
 * 
 * If Neon PostgreSQL sleeps or internet is down during the hackathon pitch,
 * the system seamlessly switches to in-memory storage so the demo NEVER crashes!
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '../.env' });

let prisma = null;
let isPrismaConnected = false;

// Default demo user and vehicle state
const inMemoryStore = {
  users: [
    {
      id: 'demo-user-1',
      name: 'Alex Mercer',
      email: 'alex.mercer@safedrive.io',
      age: 28,
      yearsDriving: 6,
      city: 'Metropolis',
      disputePasses: 2, // 2 free passes per year
      createdAt: new Date(),
    },
  ],
  vehicles: [
    {
      id: 'demo-vehicle-1',
      userId: 'demo-user-1',
      make: 'Honda',
      model: 'City VTEC',
      year: 2022,
      safetyRating: 5,
      lastOdometer: 14200.0,
      createdAt: new Date(),
    },
  ],
  consentSettings: {
    id: 'demo-consent-1',
    userId: 'demo-user-1',
    tier: 'TIER_C', // TIER_A, TIER_B, TIER_C
    autoDeleteDays: 30,
    fallbackFixed: false,
    updatedAt: new Date(),
  },
  tripSummaries: [],
  quotes: [],
  disputes: [],
  reviewDecisions: [],
};

// Try initializing Prisma
try {
  prisma = new PrismaClient();
} catch (err) {
  console.warn('[DB] Prisma initialization deferred:', err.message);
}

// Warm-up check function
async function checkDbConnection() {
  if (!prisma) return false;
  try {
    // Attempt a light query with a 3-second timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 3000)),
    ]);
    isPrismaConnected = true;
    console.log('[DB] Connected successfully to PostgreSQL (Neon).');
    return true;
  } catch (err) {
    isPrismaConnected = false;
    console.warn('[DB] Neon DB sleeping or offline. Operating in In-Memory Fail-Safe mode (100% Demo Ready).');
    return false;
  }
}

// Initial connection attempt
checkDbConnection();

// ==========================================
// UNIFIED DATA ACCESS METHODS (PRISMA + MEMORY)
// ==========================================

async function getUser() {
  if (isPrismaConnected) {
    try {
      let user = await prisma.user.findFirst({
        include: { consentSettings: true, vehicles: true },
      });
      if (user) return user;
    } catch (e) {
      console.warn('[DB] Fallback to in-memory for getUser');
    }
  }
  return {
    ...inMemoryStore.users[0],
    consentSettings: inMemoryStore.consentSettings,
    vehicles: inMemoryStore.vehicles,
  };
}

async function getVehicle() {
  if (isPrismaConnected) {
    try {
      const v = await prisma.vehicle.findFirst();
      if (v) return v;
    } catch (e) {}
  }
  return inMemoryStore.vehicles[0];
}

async function updateVehicleOdometer(newOdometer) {
  if (isPrismaConnected) {
    try {
      const v = await prisma.vehicle.findFirst();
      if (v) {
        return await prisma.vehicle.update({
          where: { id: v.id },
          data: { lastOdometer: newOdometer },
        });
      }
    } catch (e) {}
  }
  inMemoryStore.vehicles[0].lastOdometer = newOdometer;
  return inMemoryStore.vehicles[0];
}

async function getConsent() {
  if (isPrismaConnected) {
    try {
      const c = await prisma.consentSettings.findFirst();
      if (c) return c;
    } catch (e) {}
  }
  return inMemoryStore.consentSettings;
}

async function updateConsent(data) {
  if (isPrismaConnected) {
    try {
      const user = await getUser();
      return await prisma.consentSettings.upsert({
        where: { userId: user.id },
        update: {
          tier: data.tier,
          autoDeleteDays: data.autoDeleteDays ?? 30,
          fallbackFixed: data.fallbackFixed ?? false,
        },
        create: {
          userId: user.id,
          tier: data.tier,
          autoDeleteDays: data.autoDeleteDays ?? 30,
          fallbackFixed: data.fallbackFixed ?? false,
        },
      });
    } catch (e) {
      console.warn('[DB] Fallback to in-memory for updateConsent');
    }
  }
  inMemoryStore.consentSettings = {
    ...inMemoryStore.consentSettings,
    ...data,
    updatedAt: new Date(),
  };
  return inMemoryStore.consentSettings;
}

async function saveTripSummary(summary) {
  const user = await getUser();
  const record = {
    id: `trip-summary-${Date.now()}`,
    userId: user.id,
    monthYear: summary.monthYear || '2026-10',
    totalDistanceKm: Number(summary.totalDistanceKm || 0),
    nightDistanceKm: Number(summary.nightDistanceKm || 0),
    harshBrakeEvents: Number(summary.harshBrakeEvents || 0),
    sharpTurnEvents: Number(summary.sharpTurnEvents || 0),
    speedingKm: Number(summary.speedingKm || 0),
    safetyScore: Number(summary.safetyScore || 100),
    confidenceBadge: summary.confidenceBadge || 'HIGH',
    tamperStatus: summary.tamperStatus || 'VERIFIED',
    createdAt: new Date(),
  };

  if (isPrismaConnected) {
    try {
      return await prisma.tripSummary.create({ data: record });
    } catch (e) {
      console.warn('[DB] Fallback to in-memory for saveTripSummary');
    }
  }

  inMemoryStore.tripSummaries.unshift(record);
  return record;
}

async function getLatestTripSummary() {
  if (isPrismaConnected) {
    try {
      const summary = await prisma.tripSummary.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (summary) return summary;
    } catch (e) {}
  }
  return inMemoryStore.tripSummaries[0] || null;
}

async function saveQuote(quote) {
  const user = await getUser();
  const record = {
    id: `quote-${Date.now()}`,
    userId: user.id,
    monthYear: quote.monthYear || '2026-10',
    basePremium: Number(quote.basePremium || 100.0),
    mileageDiscount: Number(quote.mileageDiscount || 0.0),
    nightFactor: Number(quote.nightFactor || 0.0),
    smoothBrakeReward: Number(quote.smoothBrakeReward || 0.0),
    disputeCredit: Number(quote.disputeCredit || 0.0),
    finalPremium: Number(quote.finalPremium || 100.0),
    status: quote.status || 'SYNCED',
    createdAt: new Date(),
  };

  if (isPrismaConnected) {
    try {
      return await prisma.premiumQuote.create({ data: record });
    } catch (e) {
      console.warn('[DB] Fallback to in-memory for saveQuote');
    }
  }

  inMemoryStore.quotes.unshift(record);
  return record;
}

async function getLatestQuote() {
  if (isPrismaConnected) {
    try {
      const q = await prisma.premiumQuote.findFirst({
        orderBy: { createdAt: 'desc' },
      });
      if (q) return q;
    } catch (e) {}
  }
  return inMemoryStore.quotes[0] || null;
}

async function createDispute(data) {
  const user = await getUser();
  const dispute = {
    id: `disp-${Date.now()}`,
    userId: user.id,
    tripSummaryId: data.tripSummaryId || (inMemoryStore.tripSummaries[0]?.id ?? 'ts-default'),
    reason: data.reason,
    explanation: data.explanation,
    attachedTripOnly: data.attachedTripOnly || null, // ONLY this trip's telemetry
    status: data.status || 'UNDER_REVIEW',
    createdAt: new Date(),
  };

  // Decrement passes if auto-resolved or submitted
  if (inMemoryStore.users[0].disputePasses > 0) {
    inMemoryStore.users[0].disputePasses -= 1;
  }

  if (isPrismaConnected) {
    try {
      const created = await prisma.dispute.create({ data: dispute });
      await prisma.user.update({
        where: { id: user.id },
        data: { disputePasses: inMemoryStore.users[0].disputePasses },
      });
      return created;
    } catch (e) {
      console.warn('[DB] Fallback to in-memory for createDispute');
    }
  }

  inMemoryStore.disputes.unshift(dispute);
  return dispute;
}

async function getDisputes() {
  if (isPrismaConnected) {
    try {
      return await prisma.dispute.findMany({
        include: { reviewDecision: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (e) {}
  }
  return inMemoryStore.disputes;
}

async function reviewDispute(disputeId, reviewData) {
  const { decision, creditGiven, notes } = reviewData;
  const decisionRecord = {
    id: `rev-${Date.now()}`,
    disputeId,
    reviewer: 'Chief Underwriter',
    decision, // "APPROVED" or "REJECTED"
    creditGiven: Number(creditGiven || 0),
    notes: notes || 'Reviewed against tamper log and road conditions.',
    reviewedAt: new Date(),
  };

  if (isPrismaConnected) {
    try {
      await prisma.dispute.update({
        where: { id: disputeId },
        data: { status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED' },
      });
      return await prisma.reviewDecision.create({ data: decisionRecord });
    } catch (e) {
      console.warn('[DB] Fallback to in-memory for reviewDispute');
    }
  }

  const dispute = inMemoryStore.disputes.find((d) => d.id === disputeId);
  if (dispute) {
    dispute.status = decision === 'APPROVED' ? 'APPROVED' : 'REJECTED';
    dispute.reviewDecision = decisionRecord;
  }
  inMemoryStore.reviewDecisions.push(decisionRecord);

  // If approved, update the latest quote with dispute credit!
  if (decision === 'APPROVED' && inMemoryStore.quotes[0]) {
    inMemoryStore.quotes[0].disputeCredit += Number(creditGiven || 15);
    inMemoryStore.quotes[0].finalPremium = Math.max(
      30,
      inMemoryStore.quotes[0].finalPremium - Number(creditGiven || 15)
    );
  }

  return decisionRecord;
}

function getDbStatus() {
  return {
    mode: isPrismaConnected ? 'POSTGRES_NEON' : 'IN_MEMORY_FAILSAFE',
    status: 'ONLINE',
    message: isPrismaConnected
      ? 'Connected to Cloud Neon PostgreSQL'
      : 'Operating on Local In-Memory Store (Zero-Lag Pitch Mode)',
    userDisputePasses: inMemoryStore.users[0].disputePasses,
  };
}

module.exports = {
  getUser,
  getVehicle,
  updateVehicleOdometer,
  getConsent,
  updateConsent,
  saveTripSummary,
  getLatestTripSummary,
  saveQuote,
  getLatestQuote,
  createDispute,
  getDisputes,
  reviewDispute,
  getDbStatus,
  checkDbConnection,
};
