import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Share2, AlertTriangle, Edit, MapPin, Sparkles, Wallet, FileText, CheckSquare, Receipt, Globe } from 'lucide-react';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import { budgetService } from '../services/budgetService';
import { BudgetPieChart, BudgetBarChart } from '../components/BudgetChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateRange, getDayCount } from '../utils/formatDate';
import { getTripCover } from '../utils/coverImage';
import toast from 'react-hot-toast';

const ItineraryViewPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [itinerary, setItinerary] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, b] = await Promise.all([tripService.getTrip(id), budgetService.getBudget(id)]);
        setTrip(t); setBudget(b);
        try { const i = await itineraryService.getItinerary(id); setItinerary(i); } catch {}
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/public/${id}`);
    toast.success('Link copied to clipboard!');
  };

  if (loading) return <LoadingSpinner />;
  if (!trip) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Trip not found</div>;

  const dayCount = getDayCount(trip.startDate, trip.endDate);
  const overBudget = budget && budget.totalSpent > budget.totalBudget && budget.totalBudget > 0;
  const actDotColors = { hotel: '#7C3AED', flight: '#2563EB', food: '#D97706', transport: '#059669', activity: '#06B6D4', sightseeing: '#EC4899' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}
    >
      {/* Hero header card */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08))',
        border: '1px solid #E2E8F0',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
          <img src={getTripCover(trip)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95))' }} />
        </div>
        <div className="animate-float-slow" style={{ position: 'absolute', top: '-60px', right: '20%', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15), transparent 70%)' }} />

        <div style={{ position: 'relative', padding: '32px clamp(24px, 4vw, 40px)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <span className="eyebrow"><Sparkles style={{ width: '11px', height: '11px' }} /> Trip overview</span>
              <h1 className="font-display" style={{
                fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: '800', color: '#111827',
                marginTop: '8px', letterSpacing: '-0.03em', lineHeight: 1.1,
              }}>
                {trip.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px', fontWeight: 500 }}>
                  <Calendar style={{ width: '14px', height: '14px', color: '#2563EB' }} />
                  {formatDateRange(trip.startDate, trip.endDate)}
                </span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#CBD5E1' }} />
                <span style={{ color: '#475569', fontSize: '13px', fontWeight: 500 }}>
                  {dayCount} {dayCount === 1 ? 'day' : 'days'}
                </span>
                {trip.destinations?.length > 0 && (
                  <>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#CBD5E1' }} />
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px', fontWeight: 500 }}>
                      <MapPin style={{ width: '14px', height: '14px', color: '#7C3AED' }} />
                      {trip.destinations.join(' · ')}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Link to={`/trips/${id}/build`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '10px 18px', borderRadius: '12px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#374151', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}>
                <Edit style={{ width: '14px', height: '14px' }} /> Edit
              </Link>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={async () => {
                  try {
                    const updated = await tripService.togglePublic(id);
                    setTrip({ ...trip, isPublic: updated.isPublic });
                    toast.success(updated.isPublic ? 'Trip is now public!' : 'Trip is now private');
                  } catch (err) {
                    toast.error('Failed to change visibility');
                  }
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '10px 18px', borderRadius: '12px',
                  background: trip.isPublic ? 'rgba(5, 150, 105, 0.08)' : '#FFFFFF',
                  border: `1px solid ${trip.isPublic ? 'rgba(5, 150, 105, 0.2)' : '#E2E8F0'}`,
                  color: trip.isPublic ? '#059669' : '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}>
                <Globe style={{ width: '14px', height: '14px' }} /> {trip.isPublic ? 'Public' : 'Private'}
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={handleShare}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '10px 18px', borderRadius: '12px',
                  background: '#2563EB',
                  border: '1px solid transparent',
                  color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.20)',
                }}>
                <Share2 style={{ width: '14px', height: '14px' }} /> Share
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {overBudget && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 18px', borderRadius: '14px',
            background: 'rgba(186, 26, 26, 0.08)',
            border: '1px solid rgba(186, 26, 26, 0.2)',
            color: '#BA1A1A', fontSize: '13px', fontWeight: 600,
          }}
        >
          <AlertTriangle style={{ width: '16px', height: '16px' }} />
          Over budget by ₹{(budget.totalSpent - budget.totalBudget).toFixed(2)}
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '24px' }} className="grid-cols-1 lg:grid-cols-[2fr_1.1fr]">
        {/* Itinerary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {itinerary?.sections?.length > 0 ? itinerary.sections.map((section, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
              style={{ padding: '22px', position: 'relative', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}
            >
              <div style={{
                position: 'absolute', top: '20px', bottom: '20px', left: 0, width: '3px',
                borderRadius: '0 4px 4px 0',
                background: 'linear-gradient(180deg, #2563EB, #7C3AED)',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: 'rgba(37, 99, 235, 0.08)',
                    color: '#2563EB', fontWeight: 700, fontSize: '11px',
                    border: '1px solid rgba(37, 99, 235, 0.15)',
                  }}>{idx + 1}</span>
                  <h3 className="font-display" style={{ fontSize: '18px', fontWeight: '700', color: '#111827', letterSpacing: '-0.01em' }}>{section.title}</h3>
                </div>
                <span style={{
                  fontSize: '11px', color: '#2563EB', fontWeight: 700,
                  background: 'rgba(37, 99, 235, 0.06)',
                  border: '1px solid rgba(37, 99, 235, 0.15)',
                  padding: '5px 12px', borderRadius: '999px',
                }}>
                  ₹{section.activities?.reduce((s, a) => s + (a.cost || 0), 0)} total
                </span>
              </div>
              {section.description && <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px', lineHeight: 1.55 }}>{section.description}</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                {section.activities?.map((act, aIdx) => (
                  <motion.div key={aIdx}
                    whileHover={{ x: 4 }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 16px', borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      transition: 'all 0.2s',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: actDotColors[act.type] || '#2563EB',
                      }} />
                      <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{act.name}</span>
                      <span style={{
                        fontSize: '10px', color: actDotColors[act.type] || '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em',
                        background: 'rgba(37, 99, 235, 0.06)', padding: '2px 7px', borderRadius: '5px', fontWeight: 600,
                      }}>{act.type}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>₹{act.cost || 0}</span>
                  </motion.div>
                ))}
                {(!section.activities || section.activities.length === 0) && (
                  <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', padding: '6px 0' }}>No activities yet</p>
                )}
              </div>
            </motion.div>
          )) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <FileText style={{ width: '40px', height: '40px', color: '#94A3B8', margin: '0 auto 14px' }} />
              <p style={{ color: '#64748B', marginBottom: '8px' }}>No itinerary yet.</p>
              <Link to={`/trips/${id}/build`} style={{ color: '#2563EB', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>Build one now →</Link>
            </div>
          )}
        </div>

        {/* Budget Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Wallet style={{ width: '16px', height: '16px', color: '#2563EB' }} /> Budget Summary
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { l: 'Total', v: `₹${budget?.totalBudget || 0}`, c: '#111827' },
                { l: 'Spent', v: `₹${budget?.totalSpent || 0}`, c: overBudget ? '#BA1A1A' : '#2563EB' },
                { l: 'Remaining', v: `₹${budget?.remaining || 0}`, c: '#059669' },
                { l: 'Avg/Day', v: `₹${dayCount > 0 ? ((budget?.totalSpent || 0) / dayCount).toFixed(0) : 0}`, c: '#7C3AED' },
              ].map(s => (
                <div key={s.l} style={{
                  padding: '12px', borderRadius: '12px',
                  background: '#F8FAFC', border: '1px solid #F1F5F9',
                }}>
                  <p style={{ fontSize: '10px', color: '#64748B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.l}</p>
                  <p className="font-display" style={{ fontSize: '20px', fontWeight: '800', color: s.c, marginTop: '4px', letterSpacing: '-0.01em' }}>{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>By Category</h3>
            <BudgetPieChart breakdown={budget?.breakdown} />
          </div>

          <div style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
            <h3 className="font-display" style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>By Day</h3>
            <BudgetBarChart sections={budget?.sections} />
          </div>

          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            {[
              { to: `/trips/${id}/checklist`, icon: CheckSquare, label: 'Packing Checklist', color: '#059669' },
              { to: `/trips/${id}/notes`, icon: FileText, label: 'Trip Notes', color: '#7C3AED' },
              { to: `/trips/${id}/expense`, icon: Receipt, label: 'Expense Invoice', color: '#EC4899' },
            ].map(l => {
              const Icon = l.icon;
              return (
                <Link key={l.to} to={l.to} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '12px',
                  fontSize: '13px', color: '#374151', fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.18s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                  <span style={{
                    width: '30px', height: '30px', borderRadius: '9px',
                    background: `${l.color}1a`, border: `1px solid ${l.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon style={{ width: '14px', height: '14px', color: l.color }} />
                  </span>
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ItineraryViewPage;
