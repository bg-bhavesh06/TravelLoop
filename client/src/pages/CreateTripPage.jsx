import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Calendar, FileText, Image, Plus, ArrowRight } from 'lucide-react';
import { tripService } from '../services/tripService';
import toast from 'react-hot-toast';

const CreateTripPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', startDate: '', endDate: '',
    destinations: '', coverPhoto: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        destinations: form.destinations.split(',').map(d => d.trim()).filter(Boolean),
      };
      const trip = await tripService.createTrip(payload);
      toast.success('Trip created!');
      navigate(`/trips/${trip._id}/build`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create trip');
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}
    >
      {/* Header */}
      <div>
        <span className="eyebrow">
          <Plus style={{ width: '12px', height: '12px' }} /> Create
        </span>
        <h1 className="font-display" style={{
          fontSize: '30px', fontWeight: '700', color: '#111827',
          marginTop: '8px', letterSpacing: '-0.02em',
        }}>
          Plan a <span className="text-gradient">new trip</span>
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px', marginTop: '6px' }}>
          Fill in the details to get started with your itinerary
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title & Description */}
        <div style={sectionCard}>
          <h3 className="font-display" style={sectionTitle}>Trip Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <FileText style={{ width: '14px', height: '14px', color: '#2563EB' }} /> Trip Title *
              </label>
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="input-field"
                placeholder="e.g. Summer Europe Backpacking"
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="input-field"
                rows={3}
                style={{ resize: 'none' }}
                placeholder="Brief description of your trip..."
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div style={sectionCard}>
          <h3 className="font-display" style={sectionTitle}>Travel Dates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <Calendar style={{ width: '14px', height: '14px', color: '#2563EB' }} /> Start Date *
              </label>
              <input
                type="date" required
                value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label style={labelStyle}>
                <Calendar style={{ width: '14px', height: '14px', color: '#7C3AED' }} /> End Date *
              </label>
              <input
                type="date" required
                value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Destinations & Cover */}
        <div style={sectionCard}>
          <h3 className="font-display" style={sectionTitle}>More Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                <MapPin style={{ width: '14px', height: '14px', color: '#059669' }} /> Destinations
              </label>
              <input
                value={form.destinations}
                onChange={e => setForm(p => ({ ...p, destinations: e.target.value }))}
                className="input-field"
                placeholder="Paris, London, Rome (comma-separated)"
              />
            </div>
            <div>
              <label style={labelStyle}>
                <Image style={{ width: '14px', height: '14px', color: '#D97706' }} /> Cover Photo URL
              </label>
              <input
                value={form.coverPhoto}
                onChange={e => setForm(p => ({ ...p, coverPhoto: e.target.value }))}
                className="input-field"
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <motion.button
          type="submit" disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading ? 'Creating...' : <>Create Trip <ArrowRight style={{ width: '16px', height: '16px' }} /></>}
        </motion.button>
      </form>
    </motion.div>
  );
};

const sectionCard = {
  background: '#FFFFFF',
  borderRadius: '16px',
  padding: '24px',
  border: '1px solid #E2E8F0',
  boxShadow: '0 1px 3px rgba(17, 24, 39, 0.04)',
};

const sectionTitle = {
  fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '20px',
};

const labelStyle = {
  display: 'flex', alignItems: 'center', gap: '6px',
  fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px',
};

export default CreateTripPage;
