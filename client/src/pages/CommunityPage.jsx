import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Eye, Heart, Sparkles, MapPin, Calendar } from 'lucide-react';
import { tripService } from '../services/tripService';
import { formatDateRange } from '../utils/formatDate';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const timeAgo = (dateStr) => {
  if (!dateStr) return 'Traveler';
  try {
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Explorer';
  }
};

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentModalData, setPaymentModalData] = useState(null);

  useEffect(() => {
    tripService.getPublicTrips()
      .then(data => setTrips(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const handleLike = async (tripId) => {
    if (!user) return;
    try {
      const data = await tripService.toggleLike(tripId);
      setTrips(trips.map(t => t._id === tripId ? { ...t, likes: data.likes } : t));
    } catch (err) {
      console.error('Failed to toggle like', err);
    }
  };

  const filteredTrips = trips.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>

      {/* Social Inspiration Header */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(10, 34, 64, 0.03) 0%, rgba(255, 90, 31, 0.03) 100%)',
        border: '1px solid #E2E8F0',
        padding: '36px 28px',
        textAlign: 'center'
      }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="eyebrow" style={{ color: '#FF5A1F', fontWeight: '700' }}>
            <Sparkles style={{ width: '12px', height: '12px' }} /> EXPLORE ITINERARIES
          </span>
          <h1 className="font-display" style={{
            fontSize: '28px', fontWeight: '800', color: '#0A2240',
            marginTop: '8px', letterSpacing: '-0.02em',
          }}>
            Community <span style={{ color: '#FF5A1F' }}>Feed</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px', marginTop: '6px', maxWidth: '440px', margin: '6px auto 0' }}>
            Discover and copy travel itineraries designed by explorers worldwide. Like your favorites and find your next adventure.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '18px', height: '18px', color: '#94A3B8', pointerEvents: 'none' }} />
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="input-field"
          style={{ 
            padding: '14px 16px 14px 48px', 
            borderRadius: '16px', 
            background: 'white',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 10px rgba(10, 34, 64, 0.02)'
          }}
          placeholder="Search by destination or title..." 
        />
      </div>

      {/* Trip Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredTrips.length > 0 ? filteredTrips.map((trip, i) => {
          const isLiked = (trip.likes || []).includes(user?._id);
          const authorInitials = trip.user
            ? `${(trip.user.firstName?.[0] || '').toUpperCase()}${(trip.user.lastName?.[0] || '').toUpperCase()}`
            : 'TR';
          const authorName = trip.user
            ? `${trip.user.firstName} ${trip.user.lastName}`
            : 'Traveler';

          return (
            <motion.div
              key={trip._id}
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              style={{
                borderRadius: '24px', 
                overflow: 'hidden',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 25px rgba(10, 34, 64, 0.03)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Header: User Profile */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0A2240, #FF5A1F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '700', color: 'white',
                    boxShadow: '0 2px 8px rgba(10, 34, 64, 0.1)',
                  }}>
                    {authorInitials}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0A2240', lineHeight: 1.2 }}>
                      {authorName}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                      shared a travel plan · {timeAgo(trip.createdAt)}
                    </span>
                  </div>
                </div>
                
                {/* Globe icon */}
                <Globe style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
              </div>

              {/* Cover Photo */}
              <div 
                style={{ position: 'relative', height: '260px', overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => navigate(`/public/${trip._id}`)}
              >
                <motion.img
                  src={trip.coverPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}
                  alt={trip.title}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.4 }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }} />
                
                {/* Overlay Text: Destinations */}
                <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', pointerEvents: 'none' }}>
                  <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                    {trip.title}
                  </h3>
                  {trip.destinations?.length > 0 && (
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.90)', textShadow: '0 1px 2px rgba(0,0,0,0.4)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin style={{ width: '12px', height: '12px', color: '#FF5A1F' }} />
                      {trip.destinations.join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Body: Description & Meta */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748B', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar style={{ width: '13px', height: '13px', color: '#0A2240' }} />
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </span>
                </div>

                {trip.description && (
                  <p style={{
                    fontSize: '13px', color: '#475569', lineHeight: '1.6',
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {trip.description}
                  </p>
                )}

                {/* Footer: Social Actions */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  paddingTop: '16px', borderTop: '1px solid #F1F5F9', marginTop: '4px'
                }}>
                  {/* Likes count & Heart toggle */}
                  <motion.button 
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleLike(trip._id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                      background: isLiked ? '#FFF3EE' : '#F8FAFC',
                      color: isLiked ? '#FF5A1F' : '#64748B',
                      border: `1px solid ${isLiked ? 'rgba(255, 90, 31, 0.20)' : '#E2E8F0'}`, 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Heart style={{ 
                      width: '14px', height: '14px', 
                      fill: isLiked ? '#FF5A1F' : 'none',
                      color: isLiked ? '#FF5A1F' : '#64748B'
                    }} /> 
                    <span>{trip.likes?.length || 0} Likes</span>
                  </motion.button>

                  {/* Explore button */}
                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate(`/public/${trip._id}`)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '700',
                      background: '#0A2240',
                      color: 'white',
                      border: 'none', cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(10, 34, 64, 0.15)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#07172C'}
                    onMouseLeave={e => e.currentTarget.style.background = '#0A2240'}
                  >
                    <Eye style={{ width: '13px', height: '13px' }} /> Explore Plan
                  </motion.button>
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
            <div className="animate-float" style={{
              width: '74px', height: '74px', borderRadius: '22px',
              background: '#F0F4F8',
              border: '1px solid rgba(10, 34, 64, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Globe style={{ width: '32px', height: '32px', color: '#0A2240' }} />
            </div>
            <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#0A2240', marginBottom: '8px' }}>No public itineraries</h3>
            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '22px' }}>
              Be the first to share an itinerary with the community! Go to My Trips and publish a plan.
            </p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/trips')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '11px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
                background: '#FF5A1F',
                color: 'white', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255, 90, 31, 0.20)',
              }}>
              Go to My Trips
            </motion.button>
          </div>
        )}
      </div>

      <PaymentModal 
        isOpen={!!paymentModalData} 
        onClose={() => setPaymentModalData(null)} 
        trip={paymentModalData} 
      />
    </motion.div>
  );
};

export default CommunityPage;
