/**
 * TrustiFi Trust Score Calculator
 * Algorithmically computes an overall trust score (0-100) and grade
 * based on inspection data from a submitted InspectionReport.
 */

const WEIGHTS = {
  imei: 0.25,      // 25 points max (IMEI clean & verified)
  hardware: 0.25,  // 25 points max (Screen, body, ports, buttons)
  battery: 0.25,   // 25 points max (Health %, originality)
  parts: 0.25,     // 25 points max (All original parts)
};

/**
 * Calculate IMEI sub-score (0-25)
 */
const calcImeiScore = (imei = {}) => {
  let score = 0;
  if (imei.verified) score += 10;
  if (imei.status === 'clean') score += 15;
  else if (imei.status === 'unknown') score += 5;
  if (!imei.networkLock) score += 0; // already max from above
  return Math.min(score, 25);
};

/**
 * Calculate Hardware sub-score (0-25)
 */
const calcHardwareScore = (hardware = {}) => {
  const items = [
    hardware.screenCondition ?? 7,    // 0-10
    hardware.bodyCondition ?? 7,      // 0-10
    hardware.portsFunctional !== false ? 10 : 0,
    hardware.buttonsFunctional !== false ? 10 : 0,
    hardware.speakerMicFunctional !== false ? 10 : 0,
    hardware.cameraFunctional !== false ? 10 : 0,
  ];

  // Convert to 0-25 range
  const rawAvg =
    (items[0] + items[1]) / 2 + (items[2] + items[3] + items[4] + items[5]) / 4;
  return parseFloat(((rawAvg / 20) * 25).toFixed(2));
};

/**
 * Calculate Battery sub-score (0-25)
 */
const calcBatteryScore = (battery = {}) => {
  const healthPct = battery.healthPercentage ?? 80;
  let score = (healthPct / 100) * 20; // up to 20 points for health
  if (battery.isOriginal !== false) score += 5; // 5 extra for original battery
  return Math.min(parseFloat(score.toFixed(2)), 25);
};

/**
 * Calculate Parts sub-score (0-25)
 */
const calcPartsScore = (parts = {}) => {
  const checks = [
    parts.screenOriginal !== false,
    parts.batteryOriginal !== false,
    parts.backPanelOriginal !== false,
    parts.cameraOriginal !== false,
    parts.chargingPortOriginal !== false,
  ];
  const originalCount = checks.filter(Boolean).length;
  return parseFloat(((originalCount / checks.length) * 25).toFixed(2));
};

/**
 * Get grade from overall score
 */
const getGrade = (score) => {
  if (score >= 92) return 'A+';
  if (score >= 82) return 'A';
  if (score >= 72) return 'B+';
  if (score >= 62) return 'B';
  if (score >= 50) return 'C';
  if (score >= 35) return 'D';
  return 'F';
};

/**
 * Main trust score calculator
 * @param {Object} reportData - Inspection report fields
 * @returns {Object} - { overall, breakdown, grade }
 */
const calculateTrustScore = (reportData) => {
  const imeiScore = calcImeiScore(reportData.imei);
  const hardwareScore = calcHardwareScore(reportData.hardware);
  const batteryScore = calcBatteryScore(reportData.battery);
  const partsScore = calcPartsScore(reportData.parts);

  const overall = parseFloat(
    (imeiScore + hardwareScore + batteryScore + partsScore).toFixed(1)
  );

  const grade = getGrade(overall);

  return {
    overall,
    breakdown: {
      imeiScore,
      hardwareScore,
      batteryScore,
      partsScore,
    },
    grade,
    verifiedAt: new Date(),
  };
};

module.exports = { calculateTrustScore, getGrade };
