import { motion } from 'framer-motion';
import { Calendar, MapPin, Trash2, Edit, Eye, Wallet } from 'lucide-react';
import { formatDateRange } from '../utils/formatDate';
import { getTripCover } from '../utils/coverImage';

const statusConfig = {
  ongoing: { color: '#0D9488', bg: 'rgba(13, 148, 136, 0.08)', border: 'rgba(13, 148, 136, 0.18)', label: 'Ongoing', dot: '#0D9488' },
  upcoming: { color: '#FF5A1F', bg: 'rgba(255, 90, 31, 0.06)', border: 'rgba(255, 90, 31, 0.18)', label: 'Upcoming', dot: '#FF5A1F' },
  completed: { color: '#64748B', bg: 'rgba(100, 116, 139, 0.08)', border: 'rgba(100, 116, 139, 0.18)', label: 'Completed', dot: '#94A3B8' },
};

const TripCard = ({ trip, onView, onEdit, onDelete }) => {
  const status = statusConfig[trip.status] || statusConfig.upcoming;
  const coverPhoto = getTripCover(trip);

  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(10, 34, 64, 0.08)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(10, 34, 64, 0.03)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
      }}
      onClick={() => onView && onView(trip._id)}
    >
      {/* Cover image with zoom on hover */}
      <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
        <motion.img
          src={coverPhoto}
          alt={trip.title}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        
        {/* Status badge */}
        <span style={{
          position: 'absolute', top: '14px', right: '14px',
          padding: '6px 12px', borderRadius: '999px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          fontSize: '11px', fontWeight: '700',
          color: status.color,
          border: `1px solid ${status.border}`,
          display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 2px 10px rgba(10, 34, 64, 0.05)',
        }}>
          <motion.span 
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: status.dot,
            }} 
          />
          {status.label}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h3 className="font-display" style={{
            fontSize: '18px', fontWeight: '700', color: '#0A2240',
            letterSpacing: '-0.01em', marginBottom: '10px',
            lineHeight: '1.3'
          }}>
            {trip.title}
          </h3>

          {/* Destinations */}
          {trip.destinations?.length > 0 && (
            <div style={{
              fontSize: '13px', color: '#475569',
              display: 'flex', alignItems: 'center', gap: '6px',
              marginBottom: '8px', fontWeight: '500'
            }}>
              <MapPin style={{ width: '14px', height: '14px', color: '#FF5A1F', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {trip.destinations.join(' · ')}
              </span>
            </div>
          )}

          {/* Dates */}
          <div style={{
            fontSize: '12px', color: '#64748B',
            display: 'flex', alignItems: 'center', gap: '6px',
            marginBottom: '12px', fontWeight: '500'
          }}>
            <Calendar style={{ width: '13px', height: '13px', color: '#0A2240', flexShrink: 0 }} />
            <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
          </div>

          {/* Optional Budget Tag */}
          {trip.totalBudget > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '4px 10px', borderRadius: '8px',
              background: '#FFF3EE', border: '1px solid rgba(255, 90, 31, 0.12)',
              fontSize: '12px', color: '#E04812', fontWeight: '600',
              marginBottom: '16px',
            }}>
              <Wallet style={{ width: '12px', height: '12px' }} />
              <span>Budget: ₹{trip.totalBudget.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          paddingTop: '16px',
          borderTop: '1px solid #F1F5F9',
          marginTop: '8px'
        }}
        onClick={e => e.stopPropagation()} /* Prevents card click trigger when clicking buttons */
        >
          {onView && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onView(trip._id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '9px 12px', borderRadius: '10px',
                background: '#0A2240', color: 'white',
                fontSize: '12px', fontWeight: '600',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(10, 34, 64, 0.15)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#07172C'}
              onMouseLeave={e => e.currentTarget.style.background = '#0A2240'}
            >
              <Eye style={{ width: '13px', height: '13px' }} /> View
            </motion.button>
          )}
          {onEdit && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => onEdit(trip._id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '8px 12px', borderRadius: '10px',
                background: '#F8FAFC', color: '#475569',
                fontSize: '12px', fontWeight: '600',
                border: '1px solid #E2E8F0', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EEF2F6'; e.currentTarget.style.color = '#1E293B'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#475569'; }}
            >
              <Edit style={{ width: '13px', height: '13px' }} /> Edit
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(trip._id)}
              style={{
                padding: '9px', borderRadius: '10px',
                background: 'transparent', color: '#94A3B8',
                border: '1px solid transparent', cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.background = 'rgba(220, 38, 38, 0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}
            >
              <Trash2 style={{ width: '13px', height: '13px' }} />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TripCard;
