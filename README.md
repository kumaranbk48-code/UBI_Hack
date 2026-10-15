# 🚗 SafeDrive IQ — Privacy-First  Usage-Based Car Insurance
### Hackathon Problem Statement PS-008: InsurTech & IoT Telematics

SafeDrive IQ is an end-to-end usage-based insurance pricing platform where **safe driving directly lowers your monthly car insurance premium**, the price is **100% transparent and explainable**, drivers control their **privacy through granular consent tiers**, and **unfair penalties can be contested with human-in-the-loop dispute review**.

---

## 🏆 Key Innovations Built for Hackathon Judges

1. **Simulated Car Logger Flow (Pen-Drive Style)**:
   - A vehicle dongle records trips to a standard CSV log.
   - Drivers plug the logger into their computer and sync to the web app.
   - Includes **4 pre-built 1-click test scenarios** for instant judge evaluation.

2. **Edge-Processed Privacy by Design**:
   - High-frequency sensor streams (second-by-second braking, acceleration, speed) are processed **directly in the user's browser/device**.
   - Only the **consented safety score and total mileage** are written to the insurer's ledger.
   - Raw second-by-second road trips are **never uploaded or stored on the server**.

3. **Cryptographic HMAC Tamper Detection**:
   - Each row is cryptographically signed with an HMAC-SHA256 signature.
   - If a driver modifies speeds or deletes harsh brakes in Excel/Notepad, the system detects signature mismatches and rejects the file.
   - **Odometer Continuity Audit**: Automatically detects if the logger was unplugged to hide high-speed joyrides or night races.

4. **Zero Black-Box Pricing (ExplainMyPremium™)**:
   - Eliminates customer distrust with an **itemized receipt** showing exact dollar adjustments:
     $$\text{Final Premium} = \text{Base (\$100)} - \text{Low Mileage Reward} - \text{Daytime Bonus} - \text{SafeScore Reward} - \text{Dispute Credits}$$
   - No trained, unexplainable machine learning black boxes. 100% regulatory-compliant actuarial math.

5. **Monthly FairScore™ with Averaging Protection**:
   - Scores are computed over **monthly distance averages**.
   - Includes a **fairness buffer**: 1 emergency stop per 150 km is forgiven, so an emergency brake to save a pedestrian or avoid a collision never ruins a good driver's rate.

6. **TripCheck™ Dispute Portal (Human-in-the-Loop)**:
   - Policyholders get **2 Free Dispute Passes per year**.
   - Reason options: Avoided animal / road hazard, passenger in taxi/bus, severe road pothole / phone drop.
   - Drivers attach **ONLY that single trip's 30-second telemetry snippet**; all other trips remain strictly confidential.
   - Underwriters have an **Auditor Review Console** to approve credits ($15) or reject disputes.

7. **Reliability for the Live Pitch**:
   - Designed for zero demo crashes. Includes an **Automatic In-Memory Fail-Safe Mode** so the app runs smoothly offline even if the venue Wi-Fi fails or the cloud database sleeps.

---

## 🚀 Quick Start (1-Command Run)

### 1. Start Both Backend & Frontend
From the project root:
```bash
npm run dev
```
This runs `concurrently`:
* **Backend Express Server**: `http://localhost:5000`
* **Frontend React + Vite**: `http://localhost:5173`

Open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📁 Project Architecture & Folder Structure

```text
safedrive-iq/
├── package.json                 # Unified startup script (npm run dev)
├── .env                         # Neon DATABASE_URL, PORT=5000, HMAC_SECRET
├── prisma/
│   └── schema.prisma            # 7 Prisma database models
├── server/                      # Node.js + Express Backend
│   ├── index.js                 # Express server with warm-up endpoint
│   ├── db.js                    # Prisma client + Automatic In-Memory Fail-Safe store
│   ├── routes/
│   │   ├── trips.js             # Upload CSV, verify HMAC, clean noise, calculate quote
│   │   ├── pricing.js           # Actuarial pricing quote & what-if simulator
│   │   ├── privacy.js           # PrivacyShield consent tiers & data minimization
│   │   └── disputes.js          # Driver disputes & underwriter human review
│   ├── utils/
│   │   ├── tamperCheck.js       # HMAC-SHA256 signature verifier & Odometer gap check
│   │   ├── dataCleaner.js       # Noise filter (<0.5s spikes, 0-speed g-spikes) & Confidence score
│   │   ├── scoringEngine.js     # Deterministic actuarial formulas & tier capping
│   │   └── generateSamples.js   # Generates authentic sample logs with cryptographic signatures
│   └── sample_logs/             # 4 pre-built sample CSV logs
└── client/                      # React 18 + Vite + Tailwind CSS Frontend
    ├── index.html               # Dark theme web page
    ├── src/
    │   ├── App.jsx              # Main driver dashboard & underwriter view router
    │   ├── components/
    │   │   ├── Navbar.jsx       # Edge privacy pill, DB status, Driver/Underwriter switcher
    │   │   ├── FileUploader.jsx # CSV dropzone + 4 1-click Judge test scenarios
    │   │   ├── TripSimulator.jsx# Live sliders (Distance, Night, Brakes, Speed)
    │   │   ├── SafetyGauge.jsx  # Animated 0-100 speedometer circular gauge
    │   │   ├── PricingReceipt.jsx# Itemized price waterfall & Recharts comparison bar
    │   │   ├── WhatIfSlider.jsx # "Reduce night driving by X% -> Save $Y/mo"
    │   │   ├── TripList.jsx     # Driving sessions with "[Dispute Penalty]" button
    │   │   ├── DisputeModal.jsx # 2 free passes tracker + single-trip telemetry attachment
    │   │   ├── UnderwriterView.jsx # Insurer audit console: approve/reject disputes & tamper log
    │   │   └── FallbackPlanCard.jsx# 1-click fallback to fixed-rate $85 plan for rough roads
    │   └── data/
    │       └── samplePresets.js # Built-in test presets for judge presentations
```

---

## 🎯 How to Demo to Hackathon Judges (Step-by-Step)

1. **Open the App**: Point judges to the top navigation bar showing **"Edge Privacy: Active"** and **"Local In-Memory Mode"**.
2. **Show the Pen-Drive Sync Station**:
   - Click **[ 🟢 01. Smooth Daily Commuter ]**: Watch the green HMAC signature verification badge appear, score jump to 94+, and final price drop to ~$60 (Save $40!).
   - Click **[ 🟡 03. Tampered File (Excel Edited) ]**: Show how our cryptographic HMAC-SHA256 check catches manual edits to speed in Excel and rejects the file.
   - Click **[ 🔵 04. Unmonitored Odometer Gap ]**: Show how the system flags a 166 km gap where the logger was unplugged.
3. **Show the Trip Simulator**: Drag the *Night Driving* or *Hard Brakes* sliders to demonstrate 60 FPS real-time actuarial recalculations.
4. **Show Pricing Transparency**: Point out the **ExplainMyPremium™ Itemized Receipt** and expand the actuarial formula disclosure.
5. **Demonstrate Human Fairness**:
   - Click **[ Dispute Penalty ]** on the trip log.
   - Show the **"2 of 2 Annual Free Passes"** policy.
   - Submit a dispute for an animal hazard to watch the instant $12 fair credit apply.
6. **Switch to Underwriter Review**:
   - In the top right navbar, click **[ Underwriter Review ]**.
   - Show the insurance auditor dashboard with pending disputes and the **Hardware Tamper Audit Log**.
