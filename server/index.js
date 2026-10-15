/**
 * SafeDrive IQ - Main Backend Server Entry Point
 * Privacy-First Usage-Based Car Insurance (Hackathon PS-008)
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: '../.env' });
const db = require('./db');

const tripsRouter = require('./routes/trips');
const pricingRouter = require('./routes/pricing');
const privacyRouter = require('./routes/privacy');
const disputesRouter = require('./routes/disputes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (usually localhost:5173)
app.use(cors({ origin: true, credentials: true }));

// Parse JSON and large text payloads for CSV logs
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health & Database Warm-Up Endpoint
// Allows the frontend to ping immediately on load to wake up Neon DB
app.get('/api/health', async (req, res) => {
  const dbStatus = db.getDbStatus();
  res.json({
    status: 'ONLINE',
    service: 'SafeDrive IQ Edge Server',
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Mount modular API routers
app.use('/api/trips', tripsRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/privacy', privacyRouter);
app.use('/api/disputes', disputesRouter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SafeDrive IQ REST API',
    description: 'Privacy-First Usage-Based Insurance Engine',
    version: '1.0.0',
    documentation: {
      health: 'GET /api/health',
      tripsUpload: 'POST /api/trips/upload',
      tripsSummary: 'GET /api/trips/summary',
      sampleLogs: 'GET /api/trips/samples',
      pricingQuote: 'POST /api/pricing/quote',
      privacyConsent: 'GET|POST /api/privacy/consent',
      disputes: 'GET|POST /api/disputes',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Uncaught Error]:', err);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});

// Start Express listening
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 SafeDrive IQ Server running on http://localhost:${PORT}`);
  console.log(`🛡️  Edge Privacy: RAW telemetry processed client-side`);
  console.log(`📊 Mode: Deterministic Actuarial Engine (No Black Box)`);
  console.log(`=======================================================`);
});
