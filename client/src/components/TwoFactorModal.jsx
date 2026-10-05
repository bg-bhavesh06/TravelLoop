import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Eye, Lock, Globe, Activity, Grid, CheckCircle2, ArrowRight, RefreshCw, KeyRound, AlertOctagon, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';

const ICON_MAP = {
  shield: { label: 'Shield', icon: Shield, color: '#3B82F6' },
  eye: { label: 'Eye', icon: Eye, color: '#10B981' },
  lock: { label: 'Lock', icon: Lock, color: '#F59E0B' },
  orb: { label: 'Orb', icon: Globe, color: '#8B5CF6' },
  pulse: { label: 'Pulse', icon: Activity, color: '#EC4899' },
  matrix: { label: 'Matrix', icon: Grid, color: '#06B6D4' }
};

export const TwoFactorModal = ({ challengeData, onSuccess, onClose, selectedLocation }) => {
  const [currentStep, setCurrentStep] = useState(challengeData.nextStep || 'otp'); // 'otp' | 'pattern' | 'honeypot'
  const [otpInput, setOtpInput] = useState('');
  const [selectedPattern, setSelectedPattern] = useState([]);
  const [loading, setLoading] = useState(false);
  const [honeypotSubmitted, setHoneypotSubmitted] = useState(false);
  const [fakeHoneypotOtp, setFakeHoneypotOtp] = useState('');

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim()) {
      toast.error('Please type the OTP code sent to your email');
      return;
    }
    setLoading(true);
    try {
      const device = getDeviceFingerprint(selectedLocation);
      const res = await authService.verifyOtp({
        pendingToken: challengeData.pendingToken,
        otp: otpInput.trim(),
        deviceInfo: device.deviceInfo
      });

      toast.success('Contextual OTP Verified!');
      if (res.nextStep === 'pattern') {
        setCurrentStep('pattern');
      } else if (res.nextStep === 'honeypot') {
        setCurrentStep('honeypot');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.nextStep === 'honeypot') {
        setCurrentStep('honeypot');
      } else {
        toast.error(data?.message || 'OTP verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatternIcon = (key) => {
    if (selectedPattern.length < 3) {
      setSelectedPattern([...selectedPattern, key]);
    }
  };

  const handleResetPattern = () => {
    setSelectedPattern([]);
  };

  const handleVerifyPattern = async () => {
    if (selectedPattern.length !== 3) {
      toast.error('Please select a sequence of 3 icons');
      return;
    }
    setLoading(true);
    try {
      const device = getDeviceFingerprint(selectedLocation);
      const res = await authService.verifyPattern({
        pendingToken: challengeData.pendingToken,
        selectedPattern,
        deviceInfo: { ...device.deviceInfo, location: selectedLocation }
      });

      toast.success('Identity Verified! Welcome to Traveloop.');
      onSuccess(res);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Pattern verification failed');
      setSelectedPattern([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHoneypot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const device = getDeviceFingerprint(selectedLocation);
      await authService.submitHoneypot({
        email: challengeData.sentToEmail || challengeData.email || 'user@traveloop.com',
        fakeOtp: fakeHoneypotOtp,
        deviceInfo: device.deviceInfo
      });
      setHoneypotSubmitted(true);
      toast.success('Verification log submitted');
    } catch {
      setHoneypotSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const userEmail = challengeData.sentToEmail || challengeData.email || 'your email inbox';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        {/* Header Risk Banner */}
        <div style={{
          padding: '20px 24px',
          background: challengeData.riskLevel === 'high' 
            ? 'linear-gradient(135deg, #EF4444, #DC2626)' 
            : 'linear-gradient(135deg, #1E293B, #0F172A)',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <Shield style={{ width: '18px', height: '18px', color: '#38BDF8' }} />
              Traveloop Security Engine
            </div>
            <span style={{
              fontSize: '12px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(4px)'
            }}>
              Risk Level: {challengeData.riskLevel?.toUpperCase()}
            </span>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {currentStep === 'otp' && 'Step 1: Enter OTP from Email'}
            {currentStep === 'pattern' && 'Step 2: Select Visual Pattern from Email'}
            {currentStep === 'honeypot' && 'Security Verification Trap'}
          </h3>
          <p style={{ fontSize: '13px', opacity: 0.85, marginTop: '4px', margin: 0 }}>
            Two-Factor security codes sent via Nodemailer.
          </p>
        </div>

        {/* EMAIL SENT NOTIFICATION BANNER */}
        <div style={{
          background: '#EFF6FF',
          borderBottom: '1px solid #DBEAFE',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Mail style={{ width: '22px', height: '22px', color: '#2563EB', flexShrink: 0 }} />
          <div style={{ fontSize: '12px', color: '#1E40AF', lineHeight: 1.4 }}>
            An email with your <strong>2FA Passcode & Visual Pattern</strong> has been sent to <strong style={{ color: '#1E3A8A' }}>{userEmail}</strong>. Please check your inbox and manually type/select them below.
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px' }}>
          <AnimatePresence mode="wait">
            {/* STEP 1: CONTEXTUAL OTP */}
            {currentStep === 'otp' && (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Type 4-Part Contextual OTP Code (from your email)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8' }} />
                      <input
                        type="text"
                        required
                        placeholder="Check email & type code (e.g. WIN-7X9P-IP01-T88)"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          borderRadius: '12px',
                          border: '1px solid #CBD5E1',
                          fontSize: '14px',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={onClose}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid #CBD5E1',
                        background: '#F8FAFC',
                        color: '#64748B',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 2,
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        color: 'white',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {loading ? 'Verifying...' : <>Verify OTP <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: VISUAL PATTERN VERIFICATION */}
            {currentStep === 'pattern' && (
              <motion.div
                key="pattern-step"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                    Select Visual Icon Pattern (3 Icons matching your email)
                  </label>

                  {/* Selected Pattern Bar */}
                  <div style={{
                    minHeight: '48px',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    border: '2px dashed #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {selectedPattern.length === 0 ? (
                        <span style={{ fontSize: '13px', color: '#94A3B8' }}>Select 3 icons matching your email...</span>
                      ) : (
                        selectedPattern.map((key, idx) => {
                          const IconComp = ICON_MAP[key]?.icon || Shield;
                          return (
                            <span
                              key={idx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                fontSize: '12px',
                                fontWeight: 700,
                                color: ICON_MAP[key]?.color || '#1E293B'
                              }}
                            >
                              <IconComp style={{ width: '14px', height: '14px' }} />
                              {ICON_MAP[key]?.label}
                            </span>
                          );
                        })
                      )}
                    </div>

                    {selectedPattern.length > 0 && (
                      <button
                        type="button"
                        onClick={handleResetPattern}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#EF4444',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RefreshCw style={{ width: '12px', height: '12px' }} /> Clear
                      </button>
                    )}
                  </div>

                  {/* Icons Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                  }}>
                    {Object.entries(ICON_MAP).map(([key, item]) => {
                      const IconComponent = item.icon;
                      const isSelected = selectedPattern.includes(key);
                      return (
                        <motion.button
                          key={key}
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => handleSelectPatternIcon(key)}
                          style={{
                            padding: '16px 12px',
                            borderRadius: '16px',
                            border: isSelected ? `2px solid ${item.color}` : '1px solid #E2E8F0',
                            background: isSelected ? `${item.color}10` : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <IconComponent style={{ width: '28px', height: '28px', color: item.color }} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                            {item.label}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      background: '#F8FAFC',
                      color: '#64748B',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={selectedPattern.length !== 3 || loading}
                    onClick={handleVerifyPattern}
                    style={{
                      flex: 2,
                      padding: '12px',
                      borderRadius: '12px',
                      background: selectedPattern.length === 3 
                        ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' 
                        : '#CBD5E1',
                      color: 'white',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: selectedPattern.length === 3 ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {loading ? 'Authenticating...' : <>Complete Login <CheckCircle2 style={{ width: '16px', height: '16px' }} /></>}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: HONEYPOT DECOY SCREEN */}
            {currentStep === 'honeypot' && (
              <motion.div
                key="honeypot-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertOctagon style={{ width: '24px', height: '24px', color: '#DC2626', shrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#991B1B', margin: '0 0 4px 0' }}>
                      Security Incident Prevention Active
                    </h4>
                    <p style={{ fontSize: '12px', color: '#B91C1C', margin: 0, lineHeight: 1.4 }}>
                      Multiple failed authentication attempts were detected. Please re-verify your emergency key or contact security.
                    </p>
                  </div>
                </div>

                {!honeypotSubmitted ? (
                  <form onSubmit={handleSubmitHoneypot} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                        Emergency Override Passkey
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Emergency 6-Digit Key"
                        value={fakeHoneypotOtp}
                        onChange={(e) => setFakeHoneypotOtp(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          border: '1px solid #CBD5E1',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: '#DC2626',
                        color: 'white',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      {loading ? 'Submitting Log...' : 'Submit Emergency Key'}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <AlertOctagon style={{ width: '48px', height: '48px', color: '#DC2626', margin: '0 auto 12px auto' }} />
                    <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>Security Verification Under Review</h4>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                      Your security response has been logged. Access will remain restricted pending administrative clearance.
                    </p>
                    <button
                      onClick={onClose}
                      style={{
                        marginTop: '16px',
                        padding: '10px 24px',
                        borderRadius: '12px',
                        background: '#475569',
                        color: 'white',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Close Window
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
