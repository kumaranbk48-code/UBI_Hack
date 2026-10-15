# SafeDrive IQ — Evaluator Walkthrough & Judge Script

SafeDrive IQ is a privacy-first, actuarial usage-based car insurance platform. It replaces opaque machine learning risk scores with transparent, deterministic physics formulas and keeps telemetry processing on the driver's local edge service.

---

## 2-Minute Judge Walkthrough Script

| Step | Action to Click | What to Say | What This Proves |
| :--- | :--- | :--- | :--- |
| **0. Baseline Overview** | Open `http://localhost:5173` | *"Here is the driver's monthly policy overview for Alex Mercer. Notice the baseline FairScore of 94, an itemized premium receipt showing exactly how their $72 rate is calculated from $100 base minus earned safe-driving rewards, and a quiet 6-month trajectory chart."* | Clean editorial layout, instant skeleton loading without flashes, deterministic rate itemization. |
| **1. Normal Commute Upload** | Expand **Demo scenarios (for evaluators)** in the upload section and click **Try this** on **1. Normal file** (`01_smooth_commuter.csv`) | *"Alex uploads their monthly driving log. Each row contains sub-second accelerometer and speed data cryptographically signed by the vehicle dongle. The edge service verifies HMAC signatures, checks odometer continuity, and updates the FairScore to 100 with maximum reward pricing of $60/month."* | End-to-end telemetry ingestion, HMAC cryptographic verification, and actuarial discount rewards. |
| **2. Odometer Gap (Unmonitored Interval)** | Click **Try this** on **2. File with odometer gap** (`04_odometer_gap_unmonitored.csv`) | *"Now suppose a driver unplugs their dongle for a weekend trip. Rather than immediately accusing or punishing the driver, SafeDrive IQ detects an odometer discontinuity and presents a calm, respectful alert inviting the driver to explain or submit a note."* | Hardware continuity tracking; non-punitive, customer-first fraud detection. |
| **3. Trips Ledger & Dispute Note** | Switch to the **Trips** tab in the navigation bar. Find the flagged odometer gap row and click **Add note** (or **Dispute** on harsh brake). | *"In the Activity Ledger, the driver can attach an explanatory note or submit a formal dispute with 2 annual free passes. Notice that only a 30-second snippet of the disputed event is ever shared—not the full trip history."* | Driver agency, respectful dispute workflows, and granular data minimization. |
| **4. Cryptographic Tamper Defense** | Return to **Policy** tab, and click **Try this** on **3. Tampered file** (`03_tampered_signature.csv`) | *"Now an adversarial driver attempts to edit their speed in Excel from 120 km/h down to 50 km/h. Because each row is sealed with a hardware HMAC key, the signature check fails immediately. Notice the calm alert, and crucially: the app rejects the file, never applies fraudulent rates, and preserves the last verified state."* | Mathematical integrity protection; tampered data cannot pollute server state or lower insurance rates. |
| **5. Risk Simulator & Comparison** | Scroll to the **Trip Simulator** section. Move the **Night Driving** or **Harsh Braking** sliders. | *"Drivers can explore what changes will lower their rate. The simulator shows real-time deterministic feedback: 'now → with this change', highlights the single biggest savings opportunity, and includes a one-click button to reset back to actual driving."* | Deterministic actuarial formulas; actionable habit-improvement incentives. |
| **6. Fixed-Price Safety Net** | Scroll to the **Safety Net Plan** section at the bottom and click **Switch to Fixed Plan**. | *"If a driver ever feels uncomfortable with telematics monitoring, SafeDrive IQ guarantees complete freedom to opt out. A focus-trapped confirmation dialog verifies their choice to return to a standard $100 flat rate with zero monitoring."* | Consumer autonomy; no locked-in surveillance; accessible dialog design. |
| **7. Chief Underwriter Review** | Click the **Underwriter Review** tab in the top navigation. | *"Here is the insurer's actuarial console. Underwriters inspect dispute queues, verify sensor noise filtration, and approve credits that sync directly back to the driver's next statement."* | Dual-sided insurance ecosystem; transparent human-in-the-loop auditability. |

---

## How the Privacy Design Works

In SafeDrive IQ, high-frequency telematics does not leave your local machine:
- **Local Edge Processing**: In this prototype, a local edge service on your computer processes second-by-second CSV files. In a production deployment, this engine runs directly on the vehicle's onboard telematics unit or mobile app.
- **Data Minimization**: Speed traces, acceleration readings, road coordinates, and the raw CSV file are parsed in memory and **discarded immediately** after aggregate metrics are calculated.
- **Stored Ledger Data**: Only monthly summary totals (total distance, night proportion, gentle stopping events, holistic FairScore 0–100, and itemized billing lines) are stored. If a driver initiates a dispute, only a single 30-second window relevant to that flagged event is saved for adjudication.

---

## Known Limitations

1. **Local Server Proxy**: A local Express service stands in for on-device embedded firmware processing in this hackathon prototype.
2. **In-Memory Volatility**: Demonstration records (uploaded files, disputes, and quotes) are held in memory by default and reset to baseline upon server restart.
3. **Clearly Labelled Mock History**: Historical 6-month trends and underwriter ledger history contain simulated past records for demonstration context, clearly labelled with sentence-case captions (*"Sample history for demo purposes"*).
4. **Odometer Decreases (Rollback)**: The current continuity check evaluates forward gaps (`gap > 2.0 km`). Negative odometer values (such as loading demo presets out of sequence) are treated as out-of-order test simulations and do not trigger false gaps.
