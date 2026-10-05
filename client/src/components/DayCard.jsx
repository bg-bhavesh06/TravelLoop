import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import ActivityCard from './ActivityCard';

const DayCard = ({ section, index }) => {
  const [expanded, setExpanded] = useState(true);
  const totalCost = section.activities?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(17, 24, 39, 0.04)',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px',
          cursor: 'pointer',
          borderBottom: expanded ? '1px solid #F1F5F9' : 'none',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Day number badge */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(255, 90, 31, 0.08), rgba(10, 34, 64, 0.08))',
            color: '#FF5A1F', fontWeight: 700, fontSize: '13px',
            border: '1px solid rgba(255, 90, 31, 0.15)',
          }}>
            {index + 1}
          </span>
          <div>
            <h3 className="font-display" style={{
              fontSize: '16px', fontWeight: '600', color: '#0A2240',
              letterSpacing: '-0.01em',
            }}>
              {section.title}
            </h3>
            {section.description && (
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                {section.description}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '12px', fontWeight: '600',
            color: '#0D9488', background: 'rgba(13, 148, 136, 0.06)',
            padding: '5px 12px', borderRadius: '999px',
            border: '1px solid rgba(13, 148, 136, 0.12)',
          }}>
            ₹{totalCost}
          </span>
          {expanded
            ? <ChevronUp style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
            : <ChevronDown style={{ width: '16px', height: '16px', color: '#94A3B8' }} />
          }
        </div>
      </div>

      {/* Activities */}
      {expanded && (
        <div style={{ padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {section.activities?.length > 0 ? (
            section.activities.map((activity, i) => (
              <ActivityCard key={i} activity={activity} />
            ))
          ) : (
            <p style={{ padding: '14px', fontSize: '13px', color: '#94A3B8', fontStyle: 'italic' }}>
              No activities added for this day
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default DayCard;
