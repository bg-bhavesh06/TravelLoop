const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyOtp,
  verifyPattern,
  submitHoneypot,
  getMe,
  updateMe,
  deleteMe,
  getSecurityOverview,
  forgotPassword,
  resetPassword,
  clearTrustedDevices,
  testEmail
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/verify-pattern', verifyPattern);
router.post('/honeypot', submitHoneypot);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/clear-trusted-devices', clearTrustedDevices);
router.get('/test-email', testEmail);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.delete('/me', protect, deleteMe);
router.get('/security-overview', protect, getSecurityOverview);

module.exports = router;
