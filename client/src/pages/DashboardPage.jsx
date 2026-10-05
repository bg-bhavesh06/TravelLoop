import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Plus, Sparkles, Calendar, Compass, ArrowRight } from 'lucide-react';
import { tripService } from '../services/tripService';
import { useAuth } from '../context/AuthContext';
import TripCard from '../components/TripCard';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripService.getTrips().then(setTrips).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const ongoing = trips.filter(t => t.status === 'ongoing');
  const upcoming = trips.filter(t => t.status === 'upcoming');
  const recentTrips = trips.slice(0, 4);

  const stats = [
    { label: 'Total Trips', value: trips.length, icon: Map, color: '#0A2240', bg: '#F0F4F8', border: 'rgba(10, 34, 64, 0.12)' },
    { label: 'Ongoing', value: ongoing.length, icon: Compass, color: '#0D9488', bg: '#E6F4F2', border: 'rgba(13, 148, 136, 0.12)' },
    { label: 'Upcoming', value: upcoming.length, icon: Calendar, color: '#FF5A1F', bg: '#FFF3EE', border: 'rgba(255, 90, 31, 0.12)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}
    >
      {/* Welcome header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="eyebrow" style={{ color: '#FF5A1F', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.08em' }}>
            <Sparkles style={{ width: '12px', height: '12px' }} /> WELCOME BACK
          </span>
          <h1 className="font-display" style={{
            fontSize: '32px', fontWeight: '700', color: '#0A2240',
            marginTop: '6px', letterSpacing: '-0.02em',
          }}>
            Hello, <span style={{
              background: 'linear-gradient(135deg, #0A2240 0%, #FF5A1F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>{user?.firstName || 'Traveler'}</span> 👋
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px', fontWeight: 500 }}>
            Here is your personalized travel dashboard.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/trips/new')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', borderRadius: '12px',
            background: '#FF5A1F', color: 'white',
            fontSize: '14px', fontWeight: '600',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E04812'}
          onMouseLeave={e => e.currentTarget.style.background = '#FF5A1F'}
        >
          <Plus style={{ width: '16px', height: '16px' }} /> New Trip
        </motion.button>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(10, 34, 64, 0.05)', borderColor: s.color }}
              style={{
                display: 'flex', alignItems: 'center', gap: '18px',
                padding: '20px 24px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '20px',
                boxShadow: '0 2px 12px rgba(10, 34, 64, 0.02)',
                transition: 'all 0.25s ease',
              }}
            >
              <div style={{
                width: '46px', height: '46px', borderRadius: '12px',
                background: s.bg, border: `1px solid ${s.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: '20px', height: '20px', color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>
                  {s.label}
                </p>
                <p className="font-display" style={{ fontSize: '24px', fontWeight: '700', color: '#0A2240', lineHeight: 1 }}>
                  {s.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Premium AI Planner CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        whileHover={{ scale: 1.005 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '28px 36px', borderRadius: '24px',
          background: 'linear-gradient(135deg, #0A2240 0%, #164070 100%)',
          border: '1px solid rgba(255, 90, 31, 0.12)',
          flexWrap: 'wrap', gap: '20px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(10, 34, 64, 0.15)',
        }}
      >
        {/* Glow visual backdrops */}
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 90, 31, 0.15), transparent 70%)', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '8px',
            background: 'rgba(255, 90, 31, 0.15)', border: '1px solid rgba(255, 90, 31, 0.25)',
            fontSize: '11px', color: '#FF5A1F', fontWeight: '700',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px'
          }}>
            <Sparkles style={{ width: '11px', height: '11px' }} /> Powered by Groq AI
          </span>
          <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: 'white', letterSpacing: '-0.01em' }}>
            Instant AI Itinerary Builder
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.75)', marginTop: '6px', lineHeight: 1.5 }}>
            Tell us where you want to go, and let AI generate a customized, day-by-day plan tailored to your budget and travel interests in seconds.
          </p>
        </div>

        <motion.button 
          whileHover={{ scale: 1.04 }} 
          whileTap={{ scale: 0.96 }} 
          onClick={() => navigate('/ai-planner')}
          style={{
            position: 'relative', zIndex: 1,
            padding: '12px 24px', borderRadius: '12px',
            background: '#FF5A1F',
            color: 'white', fontSize: '14px', fontWeight: '600',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 6px 20px rgba(255, 90, 31, 0.25)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#E04812'}
          onMouseLeave={e => e.currentTarget.style.background = '#FF5A1F'}
        >
          Try AI Planner <ArrowRight style={{ width: '14px', height: '14px' }} />
        </motion.button>
      </motion.div>

      {/* Recent Trips Section */}
      {recentTrips.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#0A2240', letterSpacing: '-0.01em' }}>
              Recent Trips
            </h2>
            <button onClick={() => navigate('/trips')}
              style={{
                fontSize: '13px', fontWeight: '700', color: '#FF5A1F',
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#E04812'}
              onMouseLeave={e => e.currentTarget.style.color = '#FF5A1F'}
            >
              View all trips <ArrowRight style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {recentTrips.map((trip, i) => (
              <motion.div key={trip._id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <TripCard
                  trip={trip}
                  onView={id => navigate(`/trips/${id}/itinerary`)}
                  onEdit={id => navigate(`/trips/${id}/build`)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {trips.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center', padding: '60px 24px',
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '24px',
            boxShadow: '0 4px 20px rgba(10, 34, 64, 0.02)',
          }}
        >
          <div style={{
            width: '74px', height: '74px', borderRadius: '22px',
            background: '#FFF3EE',
            border: '1px solid rgba(255, 90, 31, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 15px rgba(255, 90, 31, 0.08)',
          }}
          className="animate-float"
          >
            <Compass style={{ width: '32px', height: '32px', color: '#FF5A1F' }} />
          </div>
          <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#0A2240', marginBottom: '8px' }}>
            No trips planned yet
          </h3>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.5 }}>
            Create your first itinerary manually or use our smart AI Planner to jumpstart your next adventure!
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/trips/new')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '11px 22px', borderRadius: '12px',
                background: '#FF5A1F', color: 'white',
                fontSize: '13px', fontWeight: '600',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 90, 31, 0.25)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#E04812'}
              onMouseLeave={e => e.currentTarget.style.background = '#FF5A1F'}
            >
              <Plus style={{ width: '14px', height: '14px' }} /> Create Manually
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/ai-planner')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '11px 22px', borderRadius: '12px',
                background: '#0A2240', color: 'white',
                fontSize: '13px', fontWeight: '600',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(10, 34, 64, 0.25)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#07172C'}
              onMouseLeave={e => e.currentTarget.style.background = '#0A2240'}
            >
              <Sparkles style={{ width: '14px', height: '14px' }} /> Generate with AI
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DashboardPage;
