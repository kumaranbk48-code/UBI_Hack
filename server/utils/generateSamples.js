/**
 * Sample CSV Log Generator for SafeDrive IQ
 * Generates 4 demo CSV logs with valid HMAC-SHA256 signatures:
 * 1. 01_smooth_commuter.csv (Clean, daytime commute, 95+ score)
 * 2. 02_aggressive_night.csv (Late night, speeding, harsh brakes)
 * 3. 03_tampered_signature.csv (Tampered row with forged/mismatched signature)
 * 4. 04_odometer_gap_unmonitored.csv (150 km unmonitored driving gap)
 */

const fs = require('fs');
const path = require('path');
const { computeRowSignature } = require('./tamperCheck');

const OUTPUT_DIR = path.join(__dirname, '..', 'sample_logs');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function buildCsvContent(rows) {
  const header = 'timestamp,speed_kmh,accel_g_longitudinal,accel_g_lateral,odometer_km,gps_lat,gps_lon,signature\n';
  const lines = rows.map((r) => {
    let accelLong = Number(r.accel_g_longitudinal).toFixed(2);
    if (accelLong === '-0.00') accelLong = '0.00';

    const formatted = {
      timestamp: r.timestamp,
      speed_kmh: Number(r.speed_kmh).toFixed(1),
      accel_g_longitudinal: accelLong,
      accel_g_lateral: Number(r.accel_g_lateral).toFixed(2),
      odometer_km: Number(r.odometer_km).toFixed(1),
      gps_lat: r.gps_lat || '19.0760',
      gps_lon: r.gps_lon || '72.8777',
    };
    const sig = r.signature || computeRowSignature(formatted);
    return `${formatted.timestamp},${formatted.speed_kmh},${formatted.accel_g_longitudinal},${formatted.accel_g_lateral},${formatted.odometer_km},${formatted.gps_lat},${formatted.gps_lon},${sig}`;
  });
  return header + lines.join('\n');
}


// 1. Smooth Commuter (Daytime 8:30 AM, smooth stops, within 60 km/h)
const smoothRows = [];
let odo1 = 14200.0;
for (let i = 0; i < 20; i++) {
  const min = (30 + i).toString().padStart(2, '0');
  const speed = 40 + Math.sin(i / 2) * 12;
  const accel = -0.1 + Math.sin(i) * 0.15;
  odo1 += speed / 3600 * 60; // km increment per minute
  smoothRows.push({
    timestamp: `2026-10-12T08:${min}:00Z`,
    speed_kmh: speed,
    accel_g_longitudinal: accel,
    accel_g_lateral: 0.05,
    odometer_km: odo1,
  });
}

// 2. Aggressive Midnight Driver (1:15 AM, 95 km/h, 3 harsh brakes)
const aggressiveRows = [];
let odo2 = 14200.0;
for (let i = 0; i < 20; i++) {
  const min = (15 + i).toString().padStart(2, '0');
  let speed = 85 + (i % 3) * 10;
  let accel = 0.1;
  // Trigger hard brakes on rows 5, 12, 17
  if (i === 5 || i === 12 || i === 17) {
    accel = -0.65; // Severe deceleration
    speed = 25; // Speed actually dropped (verified real brake)
  }
  odo2 += speed / 3600 * 60;
  aggressiveRows.push({
    timestamp: `2026-10-13T01:${min}:00Z`,
    speed_kmh: speed,
    accel_g_longitudinal: accel,
    accel_g_lateral: i % 4 === 0 ? 0.48 : 0.1, // sharp corners
    odometer_km: odo2,
  });
}

// 3. Tampered File (Row 7 has speed manually edited in Excel, signature forged/invalid)
const tamperedRows = JSON.parse(JSON.stringify(smoothRows));
tamperedRows.forEach((r) => {
  r.signature = computeRowSignature(r);
});
// Manually alter row 7 without recomputing HMAC
tamperedRows[6].speed_kmh = 135.0; // Driver changed 45 to 135 in notepad
tamperedRows[6].signature = 'bad_sig_c001beef'; // Mismatched signature!

// 4. Odometer Gap (Starting odometer jumped to 14380 instead of 14200)
const gapRows = JSON.parse(JSON.stringify(smoothRows));
let odo4 = 14380.0; // 180 km gap from vehicle baseline of 14200!
gapRows.forEach((r, idx) => {
  odo4 += 0.8;
  r.odometer_km = odo4;
  r.signature = computeRowSignature(r);
});

// Write CSV files
fs.writeFileSync(path.join(OUTPUT_DIR, '01_smooth_commuter.csv'), buildCsvContent(smoothRows));
fs.writeFileSync(path.join(OUTPUT_DIR, '02_aggressive_night.csv'), buildCsvContent(aggressiveRows));
fs.writeFileSync(path.join(OUTPUT_DIR, '03_tampered_signature.csv'), buildCsvContent(tamperedRows));
fs.writeFileSync(path.join(OUTPUT_DIR, '04_odometer_gap_unmonitored.csv'), buildCsvContent(gapRows));

console.log('[Generator] Generated 4 demo CSV log files in server/sample_logs/');

module.exports = {
  buildCsvContent,
  smoothCsv: buildCsvContent(smoothRows),
  aggressiveCsv: buildCsvContent(aggressiveRows),
  tamperedCsv: buildCsvContent(tamperedRows),
  gapCsv: buildCsvContent(gapRows),
};
