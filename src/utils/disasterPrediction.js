// CivicEye AI — Disaster Risk Prediction (pure, vanilla JS, no dependencies)
//
// IMPORTANT: Outputs are heuristic ESTIMATES for awareness/resource planning.
// They are NOT official government warnings and must always be labeled as such
// in the UI ("AI Estimate — Not an official government warning.").
//
// Note: written as plain JS (the project is JavaScript, not TypeScript). The
// shape returned matches the requested contract:
//   { area: string, riskPercentage: number, riskLevel: "Low"|"Moderate"|"High"|"Critical" }[]

const RISK_BANDS = [
  { max: 30, level: "Low" },
  { max: 55, level: "Moderate" },
  { max: 80, level: "High" },
  { max: 101, level: "Critical" },
];

function bandFor(pct) {
  for (const b of RISK_BANDS) if (pct < b.max) return b.level;
  return "Critical";
}

// Seasonal weighting by hazard type using the current month (0-11).
// Calibrated on domain intuition for the region — purely illustrative.
function seasonalWeight(hazard, month) {
  switch (hazard) {
    case "Flood":      return [0.2,0.2,0.3,0.4,0.6,0.9,1.0,1.0,0.8,0.5,0.3,0.2][month];
    case "Cyclone":    return [0.2,0.2,0.2,0.3,0.5,0.7,0.6,0.5,0.6,0.9,1.0,0.6][month];
    case "Heatwave":   return [0.3,0.4,0.7,0.9,1.0,0.8,0.5,0.4,0.4,0.4,0.3,0.3][month];
    case "Earthquake": return 0.5; // aseismic-ish baseline, no strong season
    default:           return 0.5;
  }
}

/**
 * predictDisasterRisk
 * @param {Array} zones  seeded mock zones: { area, hazard, baseRisk(0-100), exposure(0-1) }
 * @param {Date}  now    optional reference date (defaults to current date)
 * @returns {Array<{area,hazard,riskPercentage,riskLevel}>}
 */
export function predictDisasterRisk(zones, now = new Date()) {
  if (!Array.isArray(zones) || zones.length === 0) return []; // empty -> no errors
  const month = now.getMonth();
  return zones
    .map((z) => {
      const season = seasonalWeight(z.hazard, month);
      const exposure = typeof z.exposure === "number" ? z.exposure : 0.5;
      // Weighted blend of base risk, seasonality and exposure, clamped 0-100.
      let pct = z.baseRisk * (0.55 + 0.45 * season) * (0.7 + 0.3 * exposure);
      pct = Math.max(0, Math.min(100, Math.round(pct)));
      return {
        area: z.area,
        hazard: z.hazard,
        riskPercentage: pct,
        riskLevel: bandFor(pct),
      };
    })
    .sort((a, b) => b.riskPercentage - a.riskPercentage);
}

export default predictDisasterRisk;
