function calculateRisk({ isTrustedDevice, location, failedAttempts, unusualLoginTime = false }) {
  let score = 0;
  const reasons = [];

  // RULE 1: 0 Failed Attempts -> Score 0 (Low Risk) -> Direct Instant Login
  // RULE 2: 1 Failed Attempt -> Score 40 (Medium Risk) -> Visual Pattern Selection
  // RULE 3: 2 or more Failed Attempts -> Score 75 (High Risk) -> Full Contextual OTP 2FA + Pattern
  if (failedAttempts === 1) {
    score += 40;
    reasons.push("1 failed login attempt detected. Step-up Visual Pattern required.");
  } else if (failedAttempts >= 2) {
    score += 75;
    reasons.push(`${failedAttempts} failed login attempts detected. High Risk Contextual OTP required.`);
  }

  if (location === "HighRisk") {
    score += 75;
    reasons.push("High-risk location anomaly detected.");
  }

  let riskLevel = "low";

  if (score >= 70) {
    riskLevel = "high";
  } else if (score >= 40) {
    riskLevel = "medium";
  }

  return { riskScore: score, riskLevel, reasons };
}

module.exports = { calculateRisk };
