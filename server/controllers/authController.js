const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Device = require('../models/Device');
const LoginHistory = require('../models/LoginHistory');
const SecurityLog = require('../models/SecurityLog');
const { buildFingerprint, getClientIp } = require('../utils/deviceUtils');
const { calculateRisk } = require('../utils/riskEngine');
const { generatePendingToken, verifyPendingToken } = require('../utils/tokenUtils');
const { createSecurityLog } = require('../utils/logger');
const {
  buildEncodedOtp,
  generateContextualOtp,
  mapDeviceCode,
  parseEncodedOtp
} = require('../utils/contextualOtp');

const PATTERN_POOL = ["shield", "eye", "lock", "orb", "pulse", "matrix"];

function generatePattern() {
  const shuffled = [...PATTERN_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function isUnusualLoginTime() {
  const currentHour = new Date().getHours();
  return currentHour >= 0 && currentHour < 5;
}

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'traveloop_secret', { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

async function upsertTrustedDevice({ user, deviceInfo, fingerprintHash }) {
  await Device.findOneAndUpdate(
    { userId: user._id, fingerprintHash },
    {
      userId: user._id,
      fingerprintHash,
      browser: deviceInfo?.browser,
      os: deviceInfo?.os,
      screenResolution: deviceInfo?.screenResolution,
      userAgent: deviceInfo?.userAgent,
      trusted: true,
      lastSeenAt: new Date()
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, city, country, additionalInfo, profilePhoto } = req.body;
    const userExists = await User.findOne({ email: email?.toLowerCase() });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ firstName, lastName, email: email?.toLowerCase(), password, phone, city, country, additionalInfo, profilePhoto });
    
    await createSecurityLog({
      userId: user._id,
      email: user.email,
      eventType: "REGISTER_SUCCESS",
      message: "User registered successfully."
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login (Upgraded with Adaptive 2FA Risk Engine)
exports.login = async (req, res) => {
  try {
    const { email, password, deviceInfo, location } = req.body;
    const normalizedEmail = email?.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    const fingerprintHash = buildFingerprint(deviceInfo);
    const clientIp = getClientIp(req);

    if (!user) {
      await LoginHistory.create({
        email: normalizedEmail,
        status: "FAILED_EMAIL",
        riskLevel: "unknown",
        riskScore: 0,
        location,
        ipAddress: clientIp,
        deviceFingerprint: fingerprintHash,
        challengeType: "email"
      });

      await createSecurityLog({
        email: normalizedEmail,
        eventType: "LOGIN_FAILED",
        severity: "warning",
        message: "Login attempt with unknown email.",
        metadata: { location, fingerprintHash, clientIp }
      });

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await user.matchPassword(password);

    if (!passwordMatches) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();

      await LoginHistory.create({
        userId: user._id,
        email: user.email,
        status: "FAILED_PASSWORD",
        riskLevel: "unknown",
        riskScore: 0,
        location,
        ipAddress: clientIp,
        deviceFingerprint: fingerprintHash,
        challengeType: "password"
      });

      await createSecurityLog({
        userId: user._id,
        email: user.email,
        eventType: "PASSWORD_FAILURE",
        severity: "warning",
        message: "Incorrect password submitted.",
        metadata: { failedLoginAttempts: user.failedLoginAttempts, fingerprintHash, location }
      });

      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const knownDevice = await Device.findOne({ userId: user._id, fingerprintHash });
    const isTrustedDevice = Boolean(knownDevice && knownDevice.trusted);

    // Count all recent failed attempts on this device/IP in last 15 mins (invalid email OR invalid password)
    const recentDeviceFailures = await LoginHistory.countDocuments({
      $or: [
        { deviceFingerprint: fingerprintHash },
        { userId: user._id }
      ],
      status: { $in: ["FAILED_PASSWORD", "FAILED_EMAIL"] },
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    });

    const totalFailedAttempts = Math.max(user.failedLoginAttempts || 0, recentDeviceFailures);

    const { riskScore, riskLevel, reasons } = calculateRisk({
      isTrustedDevice,
      location,
      failedAttempts: totalFailedAttempts,
      unusualLoginTime: isUnusualLoginTime()
    });

    // If Low Risk -> Seamless Direct Login!
    if (riskLevel === "low") {
      await upsertTrustedDevice({ user, deviceInfo, fingerprintHash });
      user.failedLoginAttempts = 0;
      user.pendingAuth = null;
      await user.save();

      await LoginHistory.create({
        userId: user._id,
        email: user.email,
        status: "SUCCESS_DIRECT",
        riskLevel,
        riskScore,
        location,
        ipAddress: clientIp,
        deviceFingerprint: fingerprintHash,
        challengeType: "none"
      });

      await createSecurityLog({
        userId: user._id,
        email: user.email,
        eventType: "LOGIN_SUCCESS_DIRECT",
        message: "Low-risk direct login granted.",
        metadata: { riskScore, isTrustedDevice, location }
      });

      return res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        token: generateToken(user._id),
      });
    }

    // Medium or High Risk -> Step-Up Verification Required!
    const sessionId = `${user._id}-${Date.now()}`;
    const initialChallenge = riskLevel === "high" ? "otp" : "pattern";
    const generatedOtp = generateContextualOtp(deviceInfo, clientIp);

    const pendingAuth = {
      sessionId,
      fingerprintHash,
      ipAddress: clientIp,
      location,
      riskLevel,
      riskScore,
      challengeType: initialChallenge,
      patternSequence: generatePattern(),
      otpHash: await bcrypt.hash(generatedOtp.otp, 10),
      rawOtp: generatedOtp.rawOtp,
      deviceType: generatedOtp.device,
      deviceCode: generatedOtp.deviceCode,
      ipSuffix: generatedOtp.ipSuffix,
      timestampCode: generatedOtp.timestampCode,
      otpIssuedAt: generatedOtp.timestamp,
      attempts: 0,
      honeypotTriggered: false,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };

    user.pendingAuth = pendingAuth;
    user.failedLoginAttempts = 0;
    await user.save();

    await LoginHistory.create({
      userId: user._id,
      email: user.email,
      status: "CHALLENGE_REQUIRED",
      riskLevel,
      riskScore,
      location,
      ipAddress: clientIp,
      deviceFingerprint: fingerprintHash,
      challengeType: initialChallenge
    });

    await createSecurityLog({
      userId: user._id,
      email: user.email,
      eventType: "LOGIN_RISK_EVALUATED",
      message: `Risk level evaluated as ${riskLevel.toUpperCase()}. Challenge required: ${initialChallenge}`,
      metadata: { riskLevel, riskScore, reasons, isTrustedDevice, location, fingerprintHash, ipAddress: clientIp }
    });

    const pendingToken = generatePendingToken({
      userId: user._id.toString(),
      sessionId,
      challengeType: initialChallenge
    });

    // Send REAL EMAIL via Nodemailer to the user's registered email address
    const { sendTwoFactorEmail } = require("../utils/emailService");
    await sendTwoFactorEmail({
      to: user.email,
      otp: generatedOtp.otp,
      patternSequence: pendingAuth.patternSequence
    });

    // Clean secure API response — no secret OTP or pattern hints sent to frontend!
    return res.json({
      requiresChallenge: true,
      message: `Step-up 2FA verification required. A security code and pattern sequence has been sent to your email (${user.email}).`,
      nextStep: initialChallenge,
      pendingToken,
      riskLevel,
      riskScore,
      reasons,
      trustedDevice: isTrustedDevice,
      sentToEmail: user.email,
      patternPool: PATTERN_POOL
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
  try {
    const { pendingToken, otp, deviceInfo } = req.body;
    const decoded = verifyPendingToken(pendingToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.pendingAuth || user.pendingAuth.sessionId !== decoded.sessionId) {
      return res.status(401).json({ message: "Verification session expired. Please log in again." });
    }

    if (user.pendingAuth.honeypotTriggered) {
      return res.status(403).json({
        message: "Suspicious behavior detected.",
        nextStep: "honeypot"
      });
    }

    if (!user.pendingAuth.otpIssuedAt || new Date(user.pendingAuth.expiresAt) < new Date()) {
      user.pendingAuth = null;
      await user.save();
      return res.status(401).json({ message: "Contextual OTP expired. Please log in again." });
    }

    const parsedOtp = parseEncodedOtp((otp || "").toUpperCase());
    if (!parsedOtp) {
      return res.status(400).json({ message: "Invalid OTP format. Use RAW-DEVICE-IPXX-TYY format." });
    }

    const fingerprintHash = buildFingerprint(deviceInfo);
    const clientIp = getClientIp(req);
    const expectedDeviceCode = mapDeviceCode(user.pendingAuth.deviceType);

    const componentsMatch =
      parsedOtp.rawOtp === user.pendingAuth.rawOtp &&
      parsedOtp.deviceCode === expectedDeviceCode &&
      parsedOtp.ipSuffix === user.pendingAuth.ipSuffix &&
      parsedOtp.timestampCode === user.pendingAuth.timestampCode;

    let otpMatches = componentsMatch;
    if (componentsMatch && user.pendingAuth.otpHash) {
      const directMatch = await bcrypt.compare((otp || "").toUpperCase(), user.pendingAuth.otpHash);
      if (directMatch) otpMatches = true;
    }

    if (!otpMatches) {
      user.pendingAuth.attempts = (user.pendingAuth.attempts || 0) + 1;

      if (user.pendingAuth.attempts >= 3) {
        user.pendingAuth.honeypotTriggered = true;
        await user.save();

        await createSecurityLog({
          userId: user._id,
          email: user.email,
          eventType: "HONEYPOT_TRIGGERED",
          severity: "critical",
          message: "Repeated OTP failures triggered honeypot decoy.",
          metadata: { attempts: user.pendingAuth.attempts, fingerprintHash }
        });

        return res.status(403).json({
          message: "Too many failed OTP attempts.",
          nextStep: "honeypot"
        });
      }

      await user.save();
      await createSecurityLog({
        userId: user._id,
        email: user.email,
        eventType: "OTP_FAILURE",
        severity: "warning",
        message: "Contextual OTP verification failed.",
        metadata: { attempts: user.pendingAuth.attempts, fingerprintHash }
      });

      return res.status(401).json({
        message: "Invalid contextual OTP.",
        attempts: user.pendingAuth.attempts
      });
    }

    await createSecurityLog({
      userId: user._id,
      email: user.email,
      eventType: "OTP_SUCCESS",
      message: "Contextual OTP verified successfully."
    });

    return res.json({
      message: "Contextual OTP verified successfully. Now complete pattern verification.",
      nextStep: "pattern",
      patternHint: `Repeat this pattern: ${user.pendingAuth.patternSequence.join(" -> ")}`,
      patternPool: PATTERN_POOL
    });
  } catch (error) {
    return res.status(500).json({ message: "OTP verification failed.", error: error.message });
  }
};

// POST /api/auth/verify-pattern
exports.verifyPattern = async (req, res) => {
  try {
    const { pendingToken, selectedPattern, deviceInfo } = req.body;
    const decoded = verifyPendingToken(pendingToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.pendingAuth || user.pendingAuth.sessionId !== decoded.sessionId) {
      return res.status(401).json({ message: "Verification session expired. Please log in again." });
    }

    const expected = (user.pendingAuth.patternSequence || []).join(",");
    const received = (selectedPattern || []).join(",");

    if (expected !== received) {
      await createSecurityLog({
        userId: user._id,
        email: user.email,
        eventType: "PATTERN_FAILURE",
        severity: "warning",
        message: "Visual pattern verification failed.",
        metadata: { expected, received }
      });

      return res.status(401).json({ message: "Pattern verification failed. Select the exact icon sequence." });
    }

    const fingerprintHash = buildFingerprint(deviceInfo);
    await upsertTrustedDevice({ user, deviceInfo, fingerprintHash });
    user.pendingAuth = null;
    user.failedLoginAttempts = 0;
    await user.save();

    // Clear recent failed login records for this device
    await LoginHistory.deleteMany({
      $or: [{ deviceFingerprint: fingerprintHash }, { userId: user._id }],
      status: { $in: ["FAILED_PASSWORD", "FAILED_EMAIL"] }
    });

    await LoginHistory.create({
      userId: user._id,
      email: user.email,
      status: "SUCCESS_VERIFIED",
      riskLevel: "medium",
      riskScore: 50,
      location: deviceInfo?.location || "Verified",
      ipAddress: getClientIp(req),
      deviceFingerprint: fingerprintHash,
      challengeType: "pattern"
    });

    await createSecurityLog({
      userId: user._id,
      email: user.email,
      eventType: "PATTERN_SUCCESS",
      message: "Visual pattern verification successful. User authenticated."
    });

    return res.json({
      message: "Pattern verified successfully.",
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      profilePhoto: user.profilePhoto,
      token: generateToken(user._id)
    });
  } catch (error) {
    return res.status(500).json({ message: "Pattern verification failed.", error: error.message });
  }
};

// POST /api/auth/honeypot
exports.submitHoneypot = async (req, res) => {
  try {
    const { email, fakeOtp, deviceInfo } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    const fingerprintHash = buildFingerprint(deviceInfo);

    await createSecurityLog({
      userId: user?._id,
      email,
      eventType: "HONEYPOT_INTERACTION",
      severity: "critical",
      message: "Decoy fake OTP screen used by suspicious entity.",
      metadata: { fakeOtp, fingerprintHash }
    });

    return res.json({
      message: "Verification pending. Security team has been notified."
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to submit honeypot OTP.", error: error.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -pendingAuth');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/auth/me
exports.updateMe = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.role;
    delete updates.pendingAuth;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password -pendingAuth');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/auth/me
exports.deleteMe = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/security-overview
exports.getSecurityOverview = async (req, res) => {
  try {
    const [devices, loginHistory, securityLogs] = await Promise.all([
      Device.find({ userId: req.user._id }).sort({ updatedAt: -1 }),
      LoginHistory.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10),
      SecurityLog.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10)
    ]);

    return res.json({ devices, loginHistory, securityLogs });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load security overview.", error: error.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    user.resetCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`[AUTH] Password reset code for ${email}: ${resetCode}`);

    res.json({
      success: true,
      message: 'Verification code generated successfully',
      code: resetCode
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetCode: code,
      resetCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/clear-trusted-devices
exports.clearTrustedDevices = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        await Device.deleteMany({ userId: user._id });
      }
    } else {
      await Device.deleteMany({});
    }
    return res.json({ success: true, message: 'Trusted devices cleared. Next login will require 2FA!' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/test-email
exports.testEmail = async (req, res) => {
  try {
    const { sendTwoFactorEmail } = require('../utils/emailService');
    const targetEmail = req.query.email || process.env.SMTP_USER || 'yluv7986@gmail.com';
    const info = await sendTwoFactorEmail({
      to: targetEmail,
      otp: 'WIN-7X9P-IP01-T88',
      patternSequence: ['shield', 'eye', 'lock']
    });
    return res.json({
      success: true,
      message: `Test email sent to ${targetEmail}!`,
      info
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
