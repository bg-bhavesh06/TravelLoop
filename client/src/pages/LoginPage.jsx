import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, ShieldCheck, KeyRound, ArrowLeft, MapPin, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getDeviceFingerprint } from '../utils/deviceFingerprint';
import { TwoFactorModal } from '../components/TwoFactorModal';
import logoSvg from '../assets/plane logo.png';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login, setUserSession } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [form, setForm] = useState({ email: '', password: '' });
  const [selectedLocation, setSelectedLocation] = useState('Normal'); // 'Normal' | 'Unknown'
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [demoCode, setDemoCode] = useState('');
  
  // 2FA Challenge State
  const [challengeData, setChallengeData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const device = getDeviceFingerprint(selectedLocation);
      const res = await login(form.email, form.password, device.deviceInfo, selectedLocation);

      if (res.requiresChallenge) {
        toast.custom((t) => (
          <div style={{
            background: '#1E293B', color: 'white', padding: '12px 18px', borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <Shield style={{ width: '18px', height: '18px', color: '#F59E0B' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Adaptive 2FA Triggered ({res.riskLevel?.toUpperCase()} Risk)</span>
          </div>
        ));
        setChallengeData({ ...res, email: form.email });
      } else {
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const handle2FASuccess = (userData) => {
    setUserSession(userData);
    setChallengeData(null);
    navigate('/dashboard');
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      toast.success('Verification code generated!');
      if (res.code) {
        setDemoCode(res.code);
      }
      setMode('reset');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Forgot password failed');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(forgotEmail, code, newPassword);
      toast.success('Password reset successful! Please log in.');
      setMode('login');
      setForm(prev => ({ ...prev, email: forgotEmail, password: '' }));
      setCode('');
      setNewPassword('');
      setDemoCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset password failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#F8FAFC',
    }}>
      {/* 2FA Modal */}
      {challengeData && (
        <TwoFactorModal
          challengeData={challengeData}
          selectedLocation={selectedLocation}
          onSuccess={handle2FASuccess}
          onClose={() => setChallengeData(null)}
        />
      )}

      {/* Left — Brand Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(40px, 6vw, 80px)',
        background: 'linear-gradient(160deg, var(--color-primary), var(--color-secondary))',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '100vh',
      }} className="hidden lg:flex">
        {/* Decorative shapes */}
        <div className="animate-float-slow" style={{
          position: 'absolute', top: '-80px', right: '-60px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13, 148, 136, 0.20), transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}
          >
            <div style={{
              width: '48px', height: '48px', borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.20)',
            }}>
              <img src={logoSvg} alt="Traveloop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Traveloop
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              fontSize: 'clamp(36px, 4vw, 48px)',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              fontFamily: 'var(--font-heading)',
              marginBottom: '18px',
            }}
          >
            Plan your next adventure with AI precision.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontSize: '16px', color: 'rgba(255,255,255,0.80)', lineHeight: 1.6, maxWidth: '400px' }}
          >
            Create multi-city itineraries, track budgets, share with the community, and experience adaptive 2FA security.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', gap: '24px', marginTop: '40px' }}
          >
            {[
              { n: '10K+', l: 'Trips Planned' },
              { n: '120+', l: 'Cities' },
              { n: '4.9★', l: 'User Rating' },
            ].map(s => (
              <div key={s.l}>
                <p style={{ fontSize: '24px', fontWeight: 800, color: 'white', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>{s.n}</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>{s.l}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right — Active State Panel */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={logoSvg} alt="Traveloop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="font-display" style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Traveloop</span>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="font-display" style={{
                  fontSize: '28px', fontWeight: 700, color: '#1E293B',
                  marginBottom: '6px', letterSpacing: '-0.02em',
                }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>
                  Sign in to continue planning your trips
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                      <input
                        type="email" required
                        value={form.email}
                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="input-field input-with-icon"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                      <button 
                        type="button"
                        onClick={() => setMode('forgot')}
                        style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                      <input
                        type="password" required
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        className="input-field input-with-icon"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.99 } : {}}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                  >
                    {loading ? 'Evaluating Security...' : <>Sign In <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
                  </motion.button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '28px' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Create one
                  </Link>
                </p>
              </motion.div>
            )}

            {mode === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '24px', outline: 'none' }}
                >
                  <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to login
                </button>

                <h2 className="font-display" style={{
                  fontSize: '28px', fontWeight: 700, color: '#1E293B',
                  marginBottom: '8px', letterSpacing: '-0.02em',
                }}>
                  Forgot Password?
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px', lineHeight: 1.5 }}>
                  Enter your email address and we'll generate a 6-digit password verification code.
                </p>

                <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                      <input
                        type="email" required
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        className="input-field input-with-icon"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.99 } : {}}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                  >
                    {loading ? 'Sending...' : <>Send Verification Code <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {mode === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#64748B', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '24px', outline: 'none' }}
                >
                  <ArrowLeft style={{ width: '14px', height: '14px' }} /> Back to email input
                </button>

                <h2 className="font-display" style={{
                  fontSize: '28px', fontWeight: 700, color: '#1E293B',
                  marginBottom: '8px', letterSpacing: '-0.02em',
                }}>
                  Reset Your Password
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.5 }}>
                  Verification code has been successfully generated for <strong style={{ color: '#1E293B' }}>{forgotEmail}</strong>.
                </p>

                {demoCode && (
                  <div style={{
                    padding: '16px', borderRadius: '12px',
                    background: 'rgba(13, 148, 136, 0.08)',
                    border: '1px solid rgba(13, 148, 136, 0.20)',
                    marginBottom: '24px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0F766E', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      <ShieldCheck style={{ width: '16px', height: '16px' }} />
                      Demo Verification Code (Local Offline mode)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '0.2em', color: '#0F766E', fontFamily: 'monospace' }}>
                        {demoCode}
                      </span>
                      <button 
                        onClick={() => { setCode(demoCode); toast.success('Code copied!'); }}
                        style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: '#0F766E', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Auto-Fill Code
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div>
                    <label style={labelStyle}>6-Digit Code</label>
                    <div style={{ position: 'relative' }}>
                      <KeyRound style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                      <input
                        type="text" required maxLength={6}
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        className="input-field input-with-icon"
                        placeholder="Enter 6-digit code"
                      />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>New Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                      <input
                        type="password" required minLength={6}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="input-field input-with-icon"
                        placeholder="Min 6 characters"
                      />
                    </div>
                  </div>
                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.99 } : {}}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
                  >
                    {loading ? 'Resetting...' : <>Reset Password & Log In <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#475569',
  marginBottom: '8px',
};

export default LoginPage;
