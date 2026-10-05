import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, Trash2, Languages, Edit2, Save, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { tripService } from '../services/tripService';
import TripCard from '../components/TripCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UserProfilePage = () => {
  const { updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t] = await Promise.all([authService.getMe(), tripService.getTrips()]);
        setProfile(p); setForm(p); setTrips(t);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await authService.updateMe({
        firstName: form.firstName, lastName: form.lastName, phone: form.phone,
        city: form.city, country: form.country, languagePreference: form.languagePreference, additionalInfo: form.additionalInfo,
      });
      setProfile(updated); updateUser(updated); setEdit(false); toast.success('Saved!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete your account? This cannot be undone.')) return;
    try { await authService.deleteMe(); logout(); navigate('/login'); toast.success('Account deleted'); }
    catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  const upcomingTrips = trips.filter(t => t.status === 'upcoming');
  const pastTrips = trips.filter(t => t.status === 'completed');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>

      <div>
        <span className="eyebrow"><Sparkles style={{ width: '11px', height: '11px' }} /> Your account</span>
        <h1 className="font-display" style={{ fontSize: '34px', fontWeight: '800', color: '#111827', marginTop: '6px', letterSpacing: '-0.03em' }}>
          My <span className="text-gradient">Profile</span>
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="grid grid-cols-1 md:grid-cols-[1fr_2fr]">
        {/* Profile Card */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', overflow: 'hidden', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
          <div className="animate-float-slow" style={{ position: 'absolute', top: '-50px', right: '-50px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08), transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <motion.div whileHover={{ scale: 1.04 }}
              style={{
                position: 'relative',
                width: '92px', height: '92px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB, #7C3AED, #EC4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', fontWeight: '800', color: 'white',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                fontFamily: 'var(--font-display)',
              }}>
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              <span style={{
                position: 'absolute', bottom: '4px', right: '4px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: '#059669',
                border: '2px solid #FFFFFF',
              }} />
            </motion.div>
            <div style={{ textAlign: 'center' }}>
              <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.01em' }}>
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>{profile?.email}</p>
              {profile?.role === 'admin' && (
                <span style={{
                  display: 'inline-block', marginTop: '8px',
                  padding: '4px 10px', borderRadius: '999px',
                  background: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.20)',
                  color: '#D97706', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Admin
                </span>
              )}
            </div>
          </div>

          {edit ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input value={form.firstName || ''} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="input-field" placeholder="First Name" />
                <input value={form.lastName || ''} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="input-field" placeholder="Last Name" />
              </div>
              <input value={form.phone || ''} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="Phone" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <input value={form.city || ''} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="input-field" placeholder="City" />
                <input value={form.country || ''} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="input-field" placeholder="Country" />
              </div>
              <select value={form.languagePreference || 'en'} onChange={e => setForm(p => ({ ...p, languagePreference: e.target.value }))} className="input-field">
                <option value="en">English</option><option value="es">Spanish</option><option value="fr">French</option><option value="de">German</option>
              </select>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '11px', background: '#2563EB', color: 'white', fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer' }}>
                  <Save style={{ width: '14px', height: '14px' }} /> {saving ? 'Saving...' : 'Save'}
                </motion.button>
                <button onClick={() => { setForm(profile); setEdit(false); }}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '11px', background: '#FFFFFF', color: '#374151', fontSize: '13px', fontWeight: '600', border: '1px solid #E2E8F0', cursor: 'pointer' }}>
                  <X style={{ width: '14px', height: '14px' }} /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {profile?.phone && (
                <div style={infoRow}>
                  <Phone style={infoIcon} />
                  <span>{profile.phone}</span>
                </div>
              )}
              {(profile?.city || profile?.country) && (
                <div style={infoRow}>
                  <MapPin style={infoIcon} />
                  <span>{[profile.city, profile.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              <div style={infoRow}>
                <Languages style={infoIcon} />
                <span style={{ textTransform: 'capitalize' }}>{profile?.languagePreference || 'English'}</span>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => setEdit(true)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '11px', borderRadius: '11px', background: '#FFFFFF', color: '#374151', fontSize: '13px', fontWeight: '600', border: '1px solid #E2E8F0', cursor: 'pointer', marginTop: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <Edit2 style={{ width: '13px', height: '13px' }} /> Edit Profile
              </motion.button>
            </div>
          )}

          <button onClick={handleDelete}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              width: '100%', padding: '11px', borderRadius: '11px',
              background: 'rgba(186, 26, 26, 0.04)', color: '#BA1A1A',
              fontSize: '12px', fontWeight: '600',
              border: '1px solid rgba(186, 26, 26, 0.15)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(186, 26, 26, 0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(186, 26, 26, 0.04)'; }}>
            <Trash2 style={{ width: '13px', height: '13px' }} /> Delete Account
          </button>
        </div>

        {/* Trips section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {upcomingTrips.length > 0 && (
            <section>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '14px', letterSpacing: '-0.01em' }}>Upcoming Trips</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {upcomingTrips.map(t => <TripCard key={t._id} trip={t} onView={id => navigate(`/trips/${id}/itinerary`)} />)}
              </div>
            </section>
          )}
          {pastTrips.length > 0 && (
            <section>
              <h3 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '14px', letterSpacing: '-0.01em' }}>Past Trips</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {pastTrips.map(t => <TripCard key={t._id} trip={t} onView={id => navigate(`/trips/${id}/itinerary`)} />)}
              </div>
            </section>
          )}
          {trips.length === 0 && (
            <div style={{ textAlign: 'center', padding: '70px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <User style={{ width: '40px', height: '40px', color: '#94A3B8', margin: '0 auto 14px' }} />
              <p style={{ color: '#64748B', fontSize: '14px' }}>No trips yet. Start planning!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const infoRow = {
  display: 'flex', alignItems: 'center', gap: '10px',
  padding: '10px 14px', borderRadius: '11px',
  background: '#F8FAFC', border: '1px solid #F1F5F9',
  fontSize: '13px', color: '#374151', fontWeight: 500,
};
const infoIcon = { width: '14px', height: '14px', color: '#2563EB' };

export default UserProfilePage;
