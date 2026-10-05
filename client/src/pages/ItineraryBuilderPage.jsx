import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, GripVertical, Save, Sparkles, Calendar, DollarSign, ListChecks } from 'lucide-react';
import { tripService } from '../services/tripService';
import { itineraryService } from '../services/itineraryService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const emptySection = (idx = 1) => ({ title: `Day ${idx}`, description: '', budget: 0, activities: [] });
const emptyActivity = () => ({ name: '', type: 'activity', date: '', time: '', cost: 0, notes: '' });

const ItineraryBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [sections, setSections] = useState([emptySection()]);
  const [itineraryId, setItineraryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const t = await tripService.getTrip(id); setTrip(t);
        try {
          const itin = await itineraryService.getItinerary(id);
          if (itin?.sections?.length) { setSections(itin.sections); setItineraryId(itin._id); }
        } catch {}
      } catch { toast.error('Trip not found'); navigate('/trips'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const updateSection = (idx, field, value) => setSections(p => p.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  const addActivity = (sIdx) => setSections(p => p.map((s, i) => i === sIdx ? { ...s, activities: [...s.activities, emptyActivity()] } : s));
  const updateActivity = (sIdx, aIdx, field, value) => setSections(p => p.map((s, i) => i === sIdx ? { ...s, activities: s.activities.map((a, j) => j === aIdx ? { ...a, [field]: value } : a) } : s));
  const removeActivity = (sIdx, aIdx) => setSections(p => p.map((s, i) => i === sIdx ? { ...s, activities: s.activities.filter((_, j) => j !== aIdx) } : s));
  
  const maxDays = trip ? Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1 : 1;
  const addSection = () => {
    if (sections.length >= maxDays) {
      toast.error(`This trip is only ${maxDays} day(s) long!`);
      return;
    }
    setSections(p => [...p, emptySection(p.length + 1)]);
  };
  const removeSection = (idx) => setSections(p => p.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try { const res = await itineraryService.createOrUpdate(id, sections); setItineraryId(res._id); toast.success('Itinerary saved!'); }
    catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="eyebrow"><ListChecks style={{ width: '12px', height: '12px' }} /> Builder</span>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginTop: '8px', letterSpacing: '-0.02em' }}>
            {trip?.title || 'Itinerary Builder'}
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
            Design each day of your trip with activities
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={handleSave} disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 22px', borderRadius: '14px',
            background: '#2563EB', color: 'white',
            fontWeight: '600', fontSize: '14px',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(37, 99, 235, 0.25)',
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Save style={{ width: '15px', height: '15px' }} /> {saving ? 'Saving...' : 'Save Itinerary'}
        </motion.button>
      </div>

      {/* Sections */}
      <AnimatePresence mode="popLayout">
        {sections.map((section, sIdx) => (
          <motion.div
            key={sIdx} layout
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: sIdx * 0.06 }}
            style={{
              padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '18px',
              position: 'relative',
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              boxShadow: '0 1px 3px rgba(17, 24, 39, 0.04)',
            }}
          >
            {/* Side accent */}
            <div style={{
              position: 'absolute', top: '20px', bottom: '20px', left: 0, width: '3px',
              borderRadius: '0 4px 4px 0',
              background: 'linear-gradient(180deg, #2563EB, #7C3AED)',
            }} />

            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '6px', borderRadius: '8px',
                  background: '#F1F5F9', border: '1px solid #E2E8F0',
                  color: '#94A3B8', cursor: 'grab',
                }}>
                  <GripVertical style={{ width: '14px', height: '14px' }} />
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '28px', height: '28px', borderRadius: '10px',
                  background: 'rgba(37, 99, 235, 0.08)',
                  color: '#2563EB', fontWeight: 700, fontSize: '12px',
                  border: '1px solid rgba(37, 99, 235, 0.15)',
                  flexShrink: 0,
                }}>{sIdx + 1}</span>
                <input value={section.title} onChange={e => updateSection(sIdx, 'title', e.target.value)}
                  className="font-display"
                  style={{
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#111827', fontSize: '18px', fontWeight: '600',
                    width: '100%', letterSpacing: '-0.01em',
                  }}
                  placeholder="Day Title (e.g. Day 1 - Arrival)"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => removeSection(sIdx)}
                style={{
                  padding: '8px', borderRadius: '10px',
                  background: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.12)',
                  cursor: 'pointer', color: '#94A3B8',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                <Trash2 style={{ width: '14px', height: '14px' }} />
              </motion.button>
            </div>

            <textarea value={section.description} onChange={e => updateSection(sIdx, 'description', e.target.value)} rows={2}
              className="input-field" style={{ resize: 'none' }} placeholder="Brief description of this day..." />

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ maxWidth: '200px' }}>
                <label style={miniLabel}><DollarSign style={{ width: '12px', height: '12px', display: 'inline', marginRight: '5px', color: '#059669' }} />Daily Budget (₹)</label>
                <input type="number" value={section.budget} onChange={e => updateSection(sIdx, 'budget', Number(e.target.value))} className="input-field" placeholder="0" />
              </div>
            </div>

            {/* Activities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Activities ({section.activities.length})
              </h4>
              <AnimatePresence>
                {section.activities.map((act, aIdx) => (
                  <motion.div key={aIdx} layout
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}
                    style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                  >
                    <input value={act.name} onChange={e => updateActivity(sIdx, aIdx, 'name', e.target.value)}
                      className="input-field" style={{ flex: 1 }} placeholder="Activity name" />
                    <select value={act.type} onChange={e => updateActivity(sIdx, aIdx, 'type', e.target.value)}
                      className="input-field" style={{ width: '130px' }}>
                      <option value="hotel">Hotel</option>
                      <option value="flight">Flight</option>
                      <option value="activity">Activity</option>
                      <option value="food">Food</option>
                      <option value="transport">Transport</option>
                      <option value="sightseeing">Sightseeing</option>
                    </select>
                    <input type="number" value={act.cost} onChange={e => updateActivity(sIdx, aIdx, 'cost', Number(e.target.value))}
                      className="input-field" style={{ width: '100px' }} placeholder="₹" />
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => removeActivity(sIdx, aIdx)}
                      style={{ padding: '8px', borderRadius: '10px', background: 'rgba(220, 38, 38, 0.04)', border: '1px solid rgba(220, 38, 38, 0.10)', cursor: 'pointer', color: '#94A3B8' }}>
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <motion.button whileHover={{ x: 3 }}
                onClick={() => addActivity(sIdx)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '13px', color: '#2563EB', fontWeight: 600,
                  background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0',
                  width: 'fit-content',
                }}>
                <Plus style={{ width: '14px', height: '14px' }} /> Add Activity
              </motion.button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
        onClick={addSection}
        style={{
          width: '100%', padding: '18px', borderRadius: '16px',
          border: '2px dashed #E2E8F0', background: '#FAFBFC',
          color: '#94A3B8', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.30)';
          e.currentTarget.style.background = 'rgba(37, 99, 235, 0.02)';
          e.currentTarget.style.color = '#2563EB';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#E2E8F0';
          e.currentTarget.style.background = '#FAFBFC';
          e.currentTarget.style.color = '#94A3B8';
        }}
      >
        <Sparkles style={{ width: '15px', height: '15px' }} /> Add another day
      </motion.button>
    </motion.div>
  );
};

const miniLabel = { fontSize: '12px', color: '#64748B', marginBottom: '6px', display: 'block', fontWeight: 600 };

export default ItineraryBuilderPage;
