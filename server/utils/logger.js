const SecurityLog = require("../models/SecurityLog");

async function createSecurityLog({
  userId,
  email,
  eventType,
  severity = "info",
  message,
  metadata = {}
}) {
  try {
    await SecurityLog.create({
      userId,
      email,
      eventType,
      severity,
      message,
      metadata
    });
  } catch (err) {
    console.error("[SECURITY LOG ERROR]", err.message);
  }
}

module.exports = { createSecurityLog };
