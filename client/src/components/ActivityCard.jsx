import { motion } from 'framer-motion';

const actTypeColors = {
  hotel: { bg: 'rgba(124, 58, 237, 0.06)', border: 'rgba(124, 58, 237, 0.15)', text: '#7C3AED', dot: '#8B5CF6' },
  flight: { bg: 'rgba(10, 34, 64, 0.06)', border: 'rgba(10, 34, 64, 0.15)', text: '#0A2240', dot: '#0A2240' },
  food: { bg: 'rgba(217, 119, 6, 0.06)', border: 'rgba(217, 119, 6, 0.15)', text: '#D97706', dot: '#F59E0B' },
  transport: { bg: 'rgba(5, 150, 105, 0.06)', border: 'rgba(5, 150, 105, 0.15)', text: '#059669', dot: '#10B981' },
  activity: { bg: 'rgba(6, 182, 212, 0.06)', border: 'rgba(6, 182, 212, 0.15)', text: '#0891B2', dot: '#06B6D4' },
  sightseeing: { bg: 'rgba(219, 39, 119, 0.06)', border: 'rgba(219, 39, 119, 0.15)', text: '#DB2777', dot: '#EC4899' },
};

const ActivityCard = ({ activity }) => {
  const typeStyle = actTypeColors[activity.type] || actTypeColors.activity;

  return (
    <motion.div
      whileHover={{ x: 3 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '12px',
        background: '#F8FAFC',
        border: '1px solid #F1F5F9',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        {/* Type dot */}
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: typeStyle.dot,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: '14px', fontWeight: 500, color: '#111827',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {activity.name}
        </span>
        <span style={{
          fontSize: '10px', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          padding: '3px 8px', borderRadius: '6px',
          background: typeStyle.bg,
          color: typeStyle.text,
          border: `1px solid ${typeStyle.border}`,
          flexShrink: 0,
        }}>
          {activity.type}
        </span>
      </div>
      <span style={{
        fontSize: '14px', fontWeight: '600', color: '#FF5A1F',
        flexShrink: 0, marginLeft: '12px',
      }}>
        ₹{activity.cost || 0}
      </span>
    </motion.div>
  );
};

export default ActivityCard;
