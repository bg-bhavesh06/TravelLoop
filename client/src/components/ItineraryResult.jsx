import { motion } from 'framer-motion';
import { RotateCcw, Lightbulb, DollarSign, Sparkles } from 'lucide-react';
import DayCard from './DayCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';

const ItineraryResult = ({ itinerary, onReset }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!itinerary) return null;

  const handleSave = async () => {
    if (itinerary.savedTripId) {
      navigate('/my-trips');
      return;
    }

    if (!user) {
      toast.error('Please login to save the trip');
      navigate('/login');
      return;
    }

    const toastId = toast.loading('Saving your trip...');
    try {
      const response = await aiService.saveItinerary(itinerary, user.token);
      if (response.success && response.tripId) {
        toast.success('Trip saved to My Trips!', { id: toastId });
        navigate('/my-trips');
      } else {
        toast.error('Failed to save trip', { id: toastId });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save trip', { id: toastId });
    }
  };

  const estimatedCost = itinerary.totalBudget || itinerary.estimatedTotalCost || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}
      >
        <div>
          <h2 className="font-display" style={{ fontSize: '28px', fontWeight: '700', color: '#111827', letterSpacing: '-0.02em' }}>
            {itinerary.tripTitle || itinerary.title}
          </h2>
          {estimatedCost > 0 && (
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign style={{ width: '14px', height: '14px', color: '#059669' }} />
              Estimated Total: <strong style={{ color: '#111827' }}>₹{estimatedCost.toLocaleString()}</strong>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
              background: itinerary.savedTripId ? '#059669' : 'linear-gradient(135deg, #2563EB, #7C3AED)', color: 'white',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.20)',
            }}
          >
            <Sparkles style={{ width: '14px', height: '14px' }} />
            {itinerary.savedTripId ? 'View in My Trips ✓' : 'Save Trip'}
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={onReset}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600',
              background: '#F1F5F9', color: '#374151',
              border: '1px solid #E2E8F0', cursor: 'pointer',
            }}
          >
            <RotateCcw style={{ width: '14px', height: '14px' }} /> Plan Another
          </motion.button>
        </div>
      </motion.div>

      {/* Days */}
      {itinerary.days?.map((day, i) => {
        const activities = day.activities?.map(act => ({
          ...act,
          cost: act.cost !== undefined ? act.cost : act.estimatedCost || 0,
          type: act.type === 'accommodation' ? 'hotel' : act.type
        }));
        return (
          <DayCard key={i} section={{ title: day.title || `Day ${day.day}`, activities, description: '' }} index={i} />
        );
      })}

      {/* Tips */}
      {itinerary.tips?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(17, 24, 39, 0.04)',
          }}
        >
          <h3 className="font-display" style={{
            fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '14px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <Lightbulb style={{ width: '16px', height: '16px', color: '#D97706' }} /> Travel Tips
          </h3>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '0', listStyle: 'none' }}>
            {itinerary.tips.map((tip, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                padding: '10px 14px', borderRadius: '10px',
                background: '#FFFBEB',
                border: '1px solid rgba(217, 119, 6, 0.12)',
                fontSize: '13px', color: '#374151', lineHeight: 1.55,
              }}>
                <span style={{ color: '#D97706', fontWeight: 700, flexShrink: 0 }}>💡</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default ItineraryResult;
