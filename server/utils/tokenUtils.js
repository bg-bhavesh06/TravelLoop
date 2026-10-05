const jwt = require("jsonwebtoken");

function generatePendingToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET || "traveloop_secret", { expiresIn: "10m" });
}

function verifyPendingToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET || "traveloop_secret");
}

module.exports = {
  generatePendingToken,
  verifyPendingToken
};
