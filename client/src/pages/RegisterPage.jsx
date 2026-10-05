import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoSvg from '../assets/plane logo.png';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Left — Brand Panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(40px, 6vw, 80px)',
        background: 'linear-gradient(160deg, var(--color-primary), var(--color-secondary))',
        position: 'relative', overflow: 'hidden', minHeight: '100vh',
      }} className="hidden lg:flex">
        <div className="animate-float-slow" style={{
          position: 'absolute', top: '-80px', left: '-60px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)',
        }} />
        <div className="animate-float" style={{
          position: 'absolute', bottom: '-50px', right: '-50px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.18), transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.20)' }}>
              <img src={logoSvg} alt="Traveloop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: 700, color: 'white', fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
              Traveloop
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              fontSize: 'clamp(36px, 4vw, 48px)', fontWeight: 700, color: 'white',
              lineHeight: 1.1, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)', marginBottom: '18px',
            }}
          >
            Start your journey today.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontSize: '16px', color: 'rgba(255,255,255,0.80)', lineHeight: 1.6, maxWidth: '400px' }}
          >
            Join thousands of travelers who plan smarter with AI-powered itineraries, budget tracking, and community inspiration.
          </motion.p>
        </div>
      </div>

      {/* Right — Register Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '420px' }}
        >
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', overflow: 'hidden' }}>
              <img src={logoSvg} alt="Traveloop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="font-display" style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Traveloop</span>
          </div>

          <h2 className="font-display" style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '6px', letterSpacing: '-0.02em' }}>
            Create your account
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '32px' }}>
            Sign up to start planning your dream trips
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <User style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                  <input type="text" required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    className="input-field input-with-icon" placeholder="John" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input type="text" required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                  className="input-field" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field input-with-icon" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field input-with-icon" placeholder="Create a password" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94A3B8', pointerEvents: 'none' }} />
                <input type="password" required value={form.confirmPassword} onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="input-field input-with-icon" placeholder="Confirm your password" />
              </div>
            </div>
            <motion.button type="submit" disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}
            >
              {loading ? 'Creating Account...' : <>Create Account <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748B', marginTop: '28px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' };

export default RegisterPage;
