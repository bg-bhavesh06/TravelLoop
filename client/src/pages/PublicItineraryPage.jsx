import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Calendar, MapPin, Copy, Sparkles, ArrowLeft, MessageCircle } from 'lucide-react';
import { tripService } from '../services/tripService';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateRange } from '../utils/formatDate';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const PublicItineraryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    tripService.getPublicTrip(id).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <Globe style={{ width: '40px', height: '40px', color: '#94A3B8', margin: '0 auto 14px' }} />
          <p style={{ color: '#64748B', fontSize: '15px' }}>Trip not found or not public.</p>
        </div>
      </div>
    );
  }

  const { trip, itinerary } = data;
  const actDotColors = { hotel: '#7C3AED', flight: '#2563EB', food: '#D97706', transport: '#059669', activity: '#06B6D4', sightseeing: '#EC4899' };

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Top nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E2E8F0',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '13px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
            <ArrowLeft style={{ width: '15px', height: '15px' }} /> Back
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Globe style={{ width: '17px', height: '17px', color: 'white' }} />
            </div>
            <span className="font-display" style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>Traveloop</span>
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: '880px', margin: '0 auto', padding: '40px 24px 80px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
          <span className="eyebrow"><Sparkles style={{ width: '11px', height: '11px' }} /> Shared journey</span>
          <h1 className="font-display" style={{
            fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: '800',
            color: '#111827', marginTop: '10px', marginBottom: '14px',
            letterSpacing: '-0.03em', lineHeight: 1.05,
          }}>
            {trip.title}
          </h1>
          <p style={{ color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
            <Calendar style={{ width: '15px', height: '15px', color: '#2563EB' }} />
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>

          {trip.destinations?.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
              {trip.destinations.map(d => (
                <span key={d} style={{
                  padding: '6px 14px', borderRadius: '999px',
                  background: 'rgba(37, 99, 235, 0.06)',
                  color: '#2563EB',
                  border: '1px solid rgba(37, 99, 235, 0.15)',
                  fontSize: '12px', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <MapPin style={{ width: '12px', height: '12px' }} /> {d}
                </span>
              ))}
            </div>
          )}

          {trip.description && (
            <p style={{ color: '#475569', maxWidth: '580px', margin: '20px auto 0', fontSize: '14px', lineHeight: 1.65 }}>
              {trip.description}
            </p>
          )}

          {trip.user && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '8px 16px', borderRadius: '999px', marginTop: '18px',
              background: '#F8FAFC', border: '1px solid #E2E8F0',
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 700, color: 'white',
              }}>
                {trip.user.firstName?.[0]}{trip.user.lastName?.[0]}
              </div>
              <span style={{ fontSize: '12px', color: '#475569' }}>
                Curated by <strong style={{ color: '#111827' }}>{trip.user.firstName} {trip.user.lastName}</strong>
              </span>
            </div>
          )}
        </motion.div>

        {/* Itinerary */}
        {itinerary?.sections?.map((section, idx) => (
          <motion.div key={idx}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
            style={{ padding: '24px', position: 'relative', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
            <div style={{
              position: 'absolute', top: '20px', bottom: '20px', left: 0, width: '3px',
              borderRadius: '0 4px 4px 0',
              background: 'linear-gradient(180deg, #2563EB, #7C3AED)',
            }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '9px',
                background: 'rgba(37, 99, 235, 0.08)',
                color: '#2563EB', fontWeight: 700, fontSize: '12px',
                border: '1px solid rgba(37, 99, 235, 0.15)',
              }}>{idx + 1}</span>
              <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#111827', letterSpacing: '-0.01em' }}>{section.title}</h3>
            </div>
            {section.description && <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px', lineHeight: 1.55 }}>{section.description}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {section.activities?.map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 16px', borderRadius: '11px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: actDotColors[a.type] || '#2563EB',
                    }} />
                    <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{a.name}</span>
                    <span style={{
                      fontSize: '10px', color: actDotColors[a.type] || '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em',
                      background: 'rgba(37, 99, 235, 0.06)', padding: '2px 7px', borderRadius: '5px', fontWeight: 600,
                    }}>{a.type}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>₹{a.cost || 0}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={async () => { 
              try {
                const toastId = toast.loading('Copying trip...');
                const newTrip = await tripService.copyTrip(id);
                toast.success('Trip copied successfully!', { id: toastId });
                navigate(`/trips/${newTrip._id}/itinerary`);
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to copy trip. Please login first.');
              }
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '14px 28px', borderRadius: '14px',
              background: '#2563EB',
              color: 'white', fontWeight: '700', fontSize: '14px',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.20)',
            }}>
            <Copy style={{ width: '15px', height: '15px' }} /> Copy This Trip
          </motion.button>

          {/* Chat With Traveler Button */}
          {user && trip.user && user._id !== trip.user._id && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowPaymentModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '14px 28px', borderRadius: '14px',
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                color: 'white', fontWeight: '700', fontSize: '14px',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(124, 58, 237, 0.20)',
              }}>
              <MessageCircle style={{ width: '15px', height: '15px' }} /> Chat With Traveler
            </motion.button>
          )}
        </div>
      </div>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        trip={data?.trip} 
      />
    </div>
  );
};

export default PublicItineraryPage;
