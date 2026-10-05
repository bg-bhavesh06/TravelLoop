import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, DollarSign, Sparkles, Loader2, Compass, ArrowRight, ArrowLeft, Check, ListFilter, ClipboardEdit } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const INTERESTS = [
  { label: 'Food & Cuisine', icon: '🍜' },
  { label: 'Culture & History', icon: '🏛️' },
  { label: 'Adventure & Sports', icon: '🏄' },
  { label: 'Shopping', icon: '🛍️' },
  { label: 'Nature & Hiking', icon: '🌿' },
  { label: 'Art & Museums', icon: '🎨' },
  { label: 'Nightlife', icon: '🌙' },
  { label: 'Wellness & Relaxation', icon: '🧘' },
  { label: 'Photography Spots', icon: '📸' },
];

const TRAVEL_STYLES = [
  { id: 'budget', icon: '🎒', title: 'Budget', desc: 'Hostels, public transit, local eats' },
  { id: 'mid', icon: '🏨', title: 'Mid-Range', desc: 'Hotels, mixed transit, nice dinners' },
  { id: 'luxury', icon: '✨', title: 'Luxury', desc: '5-star resorts, private transfers, fine dining' },
];

const AIForm = ({ loading, setLoading, setItinerary, streamText, setStreamText }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    currency: 'INR',
    travelers: 1,
    travelStyle: 'mid',
    additionalNotes: '',
  });
  const [selectedInterests, setSelectedInterests] = useState([]);

  const toggleInterest = (label) => {
    setSelectedInterests(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Validates current step before moving forward
  const handleNextStep = () => {
    if (step === 1) {
      if (!form.destination.trim()) {
        toast.error('Please specify a destination');
        return;
      }
      if (!form.startDate || !form.endDate) {
        toast.error('Please enter start and end dates');
        return;
      }
      if (new Date(form.startDate) > new Date(form.endDate)) {
        toast.error('Start date cannot be after end date');
        return;
      }
    }

    if (step === 2) {
      if (!form.budget || Number(form.budget) <= 0) {
        toast.error('Please specify a valid total budget');
        return;
      }
      if (!form.travelers || Number(form.travelers) < 1) {
        toast.error('Travelers count must be 1 or more');
        return;
      }
    }

    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination || !form.startDate || !form.endDate || !form.budget) {
      toast.error('Missing required fields. Please review steps.');
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('traveloop_user') || '{}');
    const token = user?.token || storedUser?.token;

    if (!token) {
      toast.error('Please log in to your account first to generate and save AI trips!');
      return;
    }

    setLoading(true);
    setStreamText('');

    try {
      const result = await aiService.generateItinerary({
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget),
        currency: form.currency,
        travelers: Number(form.travelers),
        travelStyle: form.travelStyle,
        interests: selectedInterests,
        additionalNotes: form.additionalNotes,
      }, (partial) => {
        setStreamText(partial);
      }, token);

      // Auto-save generated trip directly to user's MongoDB library while component is mounted
      try {
        const saveRes = await aiService.saveItinerary(result, token);
        if (saveRes && saveRes.success && saveRes.tripId) {
          result.savedTripId = saveRes.tripId;
        }
      } catch (saveErr) {
        console.error('Auto-save error:', saveErr);
      }

      setItinerary(result);
      toast.success('Trip generated & saved to My Trips!');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'AI generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Styled helper values
  const cardStyle = {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 20px rgba(10, 34, 64, 0.02)',
  };

  const labelStyle = {
    fontSize: '13px', fontWeight: '700', color: '#0A2240', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px',
  };

  // Progress Stepper Component
  const renderStepper = () => {
    const stepsData = [
      { num: 1, name: 'Where & When', icon: MapPin },
      { num: 2, name: 'Budget & Travelers', icon: DollarSign },
      { num: 3, name: 'Preferences', icon: ListFilter },
      { num: 4, name: 'Review Plan', icon: ClipboardEdit },
    ];

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', position: 'relative' }}>
        {/* Progress bar background */}
        <div style={{ position: 'absolute', top: '20px', left: '8%', right: '8%', height: '2px', background: '#E2E8F0', zIndex: 0 }} />
        {/* Progress bar active fill */}
        <div style={{ 
          position: 'absolute', top: '20px', left: '8%', height: '2px', 
          background: '#FF5A1F', zIndex: 0, 
          width: `${((step - 1) / 3) * 84}%`,
          transition: 'width 0.3s ease'
        }} />

        {stepsData.map((s) => {
          const StepIcon = s.icon;
          const isCompleted = step > s.num;
          const isActive = step === s.num;

          return (
            <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, width: '22%' }}>
              <button
                type="button"
                onClick={() => !loading && s.num < step && setStep(s.num)}
                disabled={loading || s.num > step}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: isCompleted ? '#FF5A1F' : (isActive ? '#0A2240' : '#FFFFFF'),
                  border: `2px solid ${isCompleted || isActive ? 'transparent' : '#CBD5E1'}`,
                  color: isCompleted || isActive ? 'white' : '#64748B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '13px', cursor: (s.num < step && !loading) ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 0 0 4px rgba(10, 34, 64, 0.1)' : (isCompleted ? '0 0 0 4px rgba(255, 90, 31, 0.1)' : 'none'),
                }}
              >
                {isCompleted ? <Check style={{ width: '16px', height: '16px' }} /> : <StepIcon style={{ width: '15px', height: '15px' }} />}
              </button>
              <span style={{ 
                fontSize: '11px', fontWeight: isActive ? '700' : '600', 
                color: isActive ? '#0A2240' : '#64748B', marginTop: '8px', 
                textAlign: 'center', whiteSpace: 'nowrap',
                display: 'none',
              }} className="sm:block">
                {s.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Wizard stepper indicators */}
      {renderStepper()}

      <form onSubmit={handleSubmit}>
        <AnimatePresence mode="wait">
          
          {/* STEP 1: DESTINATION & DATES */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              style={cardStyle}
            >
              <h3 className="font-display" style={{ fontSize: '19px', fontWeight: '700', color: '#0A2240', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass style={{ color: '#FF5A1F', width: '20px', height: '20px' }} />
                Where & When are you traveling?
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>
                    <MapPin style={{ width: '14px', height: '14px', color: '#FF5A1F' }} /> Target Destination
                  </label>
                  <input
                    required
                    value={form.destination}
                    onChange={e => handleChange('destination', e.target.value)}
                    className="input-field"
                    style={{ background: 'var(--color-surface)', border: '1px solid #E2E8F0', padding: '14px 16px' }}
                    placeholder="e.g. Rome, Italy or Kyoto, Japan"
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>
                      <Calendar style={{ width: '14px', height: '14px', color: '#FF5A1F' }} /> Start Date
                    </label>
                    <input
                      required
                      type="date"
                      value={form.startDate}
                      onChange={e => handleChange('startDate', e.target.value)}
                      className="input-field"
                      style={{ background: 'var(--color-surface)', border: '1px solid #E2E8F0', padding: '13px 16px' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>
                      <Calendar style={{ width: '14px', height: '14px', color: '#FF5A1F' }} /> End Date
                    </label>
                    <input
                      required
                      type="date"
                      value={form.endDate}
                      onChange={e => handleChange('endDate', e.target.value)}
                      className="input-field"
                      style={{ background: 'var(--color-surface)', border: '1px solid #E2E8F0', padding: '13px 16px' }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: BUDGET & TRAVELERS */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              style={cardStyle}
            >
              <h3 className="font-display" style={{ fontSize: '19px', fontWeight: '700', color: '#0A2240', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign style={{ color: '#0D9488', width: '20px', height: '20px' }} />
                Budget & Group Size
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>
                    <DollarSign style={{ width: '14px', height: '14px', color: '#0D9488' }} /> Total Budget Limit
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={e => handleChange('budget', e.target.value)}
                    className="input-field"
                    style={{ background: 'var(--color-surface)', border: '1px solid #E2E8F0', padding: '14px 16px' }}
                    placeholder="e.g. 75000"
                  />
                </div>
                <div>
                  <label style={labelStyle}>
                    Preferred Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={e => handleChange('currency', e.target.value)}
                    className="input-field"
                    style={{ background: 'var(--color-surface)', border: '1px solid #E2E8F0', padding: '14px 16px' }}
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>
                    <Users style={{ width: '14px', height: '14px', color: '#0A2240' }} /> Number of Travelers
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={form.travelers}
                    onChange={e => handleChange('travelers', e.target.value)}
                    className="input-field"
                    style={{ background: 'var(--color-surface)', border: '1px solid #E2E8F0', padding: '14px 16px' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: TRAVEL STYLE & INTERESTS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Style options */}
              <div style={cardStyle}>
                <h3 className="font-display" style={{ fontSize: '17px', fontWeight: '700', color: '#0A2240', marginBottom: '18px' }}>
                  What's your travel style?
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  {TRAVEL_STYLES.map(style => {
                    const isSelected = form.travelStyle === style.id;
                    return (
                      <div
                        key={style.id}
                        onClick={() => handleChange('travelStyle', style.id)}
                        style={{
                          padding: '18px 14px',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.25s ease',
                          border: `2px solid ${isSelected ? '#FF5A1F' : 'transparent'}`,
                          background: isSelected ? '#FFF3EE' : 'var(--color-surface)',
                          boxShadow: isSelected ? '0 4px 12px rgba(255, 90, 31, 0.08)' : 'none',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>{style.icon}</div>
                        <div style={{ color: isSelected ? '#E04812' : '#0A2240', fontWeight: '700', fontSize: '14px' }}>{style.title}</div>
                        <div style={{ color: '#64748B', fontSize: '11px', marginTop: '4px', lineHeight: '1.4' }}>{style.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interests tag cloud */}
              <div style={cardStyle}>
                <h3 className="font-display" style={{ fontSize: '17px', fontWeight: '700', color: '#0A2240', marginBottom: '14px' }}>
                  What do you like to explore?
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {INTERESTS.map(interest => {
                    const isSelected = selectedInterests.includes(interest.label);
                    return (
                      <button
                        type="button"
                        key={interest.label}
                        onClick={() => toggleInterest(interest.label)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '999px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          background: isSelected ? '#0A2240' : '#F8FAFC',
                          color: isSelected ? '#FFFFFF' : '#475569',
                          border: `1px solid ${isSelected ? '#0A2240' : '#CBD5E1'}`,
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#94A3B8'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = '#CBD5E1'; }}
                      >
                        <span style={{ marginRight: '6px' }}>{interest.icon}</span>
                        {interest.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: REVIEW & SUBMIT */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Optional note block */}
              <div style={cardStyle}>
                <h3 className="font-display" style={{ fontSize: '17px', fontWeight: '700', color: '#0A2240', marginBottom: '12px' }}>
                  Additional Notes (Optional)
                </h3>
                <textarea
                  value={form.additionalNotes}
                  onChange={e => handleChange('additionalNotes', e.target.value)}
                  className="input-field"
                  rows={3}
                  style={{ resize: 'none', background: 'var(--color-surface)', border: '1px solid #E2E8F0', padding: '12px 16px' }}
                  placeholder="e.g. Dietary preferences, specific historic sights you want to visit, or keeping a relaxed pace..."
                />
              </div>

              {/* Selections review card */}
              <div style={{ ...cardStyle, borderLeft: '4px solid #FF5A1F', background: '#FAFBFD' }}>
                <h4 className="font-display" style={{ fontSize: '15px', fontWeight: '700', color: '#0A2240', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Review Selections
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600' }}>DESTINATION</span>
                      <p style={{ fontWeight: '700', color: '#0A2240', marginTop: '2px' }}>{form.destination}</p>
                    </div>
                    <div style={{ flex: '1 1 200px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600' }}>DATES</span>
                      <p style={{ fontWeight: '700', color: '#0A2240', marginTop: '2px' }}>{form.startDate} to {form.endDate}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', paddingTop: '10px', borderTop: '1px solid #ECEFF4' }}>
                    <div style={{ flex: '1 1 120px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600' }}>BUDGET</span>
                      <p style={{ fontWeight: '700', color: '#0A2240', marginTop: '2px' }}>{Number(form.budget).toLocaleString()} {form.currency}</p>
                    </div>
                    <div style={{ flex: '1 1 120px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600' }}>TRAVELERS</span>
                      <p style={{ fontWeight: '700', color: '#0A2240', marginTop: '2px' }}>{form.travelers} Traveler(s)</p>
                    </div>
                    <div style={{ flex: '1 1 120px' }}>
                      <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600' }}>STYLE</span>
                      <p style={{ fontWeight: '700', color: '#0A2240', marginTop: '2px', textTransform: 'capitalize' }}>{form.travelStyle}</p>
                    </div>
                  </div>

                  {selectedInterests.length > 0 && (
                    <div style={{ paddingTop: '10px', borderTop: '1px solid #ECEFF4' }}>
                      <span style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>INTERESTS</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedInterests.map(i => (
                          <span key={i} style={{ fontSize: '11px', fontWeight: '600', color: '#0A2240', background: 'white', border: '1px solid #E2E8F0', padding: '3px 10px', borderRadius: '6px' }}>
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '24px' }}>
          {step > 1 ? (
            <motion.button
              type="button"
              disabled={loading}
              onClick={handlePrevStep}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px',
                background: '#FFFFFF', color: '#475569',
                fontSize: '14px', fontWeight: '700',
                border: '1px solid #E2E8F0', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(10, 34, 64, 0.02)',
              }}
            >
              <ArrowLeft style={{ width: '15px', height: '15px' }} /> Back
            </motion.button>
          ) : (
            <div /> // Spacer to keep Next pushed to the right
          )}

          {step < 4 ? (
            <motion.button
              type="button"
              onClick={handleNextStep}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '12px',
                background: '#0A2240', color: 'white',
                fontSize: '14px', fontWeight: '700',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(10, 34, 64, 0.15)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#07172C'}
              onMouseLeave={e => e.currentTarget.style.background = '#0A2240'}
            >
              Next Step <ArrowRight style={{ width: '15px', height: '15px' }} />
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.01 } : {}}
              whileTap={!loading ? { scale: 0.99 } : {}}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #FF5A1F 0%, #E04812 100%)',
                color: 'white', fontSize: '14px', fontWeight: '700',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 14px rgba(255, 90, 31, 0.3)',
                opacity: loading ? 0.75 : 1,
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" style={{ width: '16px', height: '16px' }} />
                  Crafting itinerary...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '15px', height: '15px' }} />
                  Generate Itinerary ✨
                </>
              )}
            </motion.button>
          )}
        </div>
      </form>

      {/* Streaming Loader Console */}
      <AnimatePresence>
        {loading && streamText && (
          <motion.div
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            style={{
              background: '#071220',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '22px',
              maxHeight: '220px', overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(6, 18, 33, 0.35)',
              marginTop: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#FF5A1F', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Loader2 className="animate-spin" style={{ width: '12px', height: '12px' }} />
                Groq Llama AI Streaming Engine
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}>
                Building days...
              </span>
            </div>
            <pre style={{
              fontFamily: 'monospace, Courier New, Courier',
              fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6,
              margin: 0,
            }}>
              {streamText}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIForm;
