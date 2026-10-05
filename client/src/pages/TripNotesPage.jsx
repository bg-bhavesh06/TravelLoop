import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit, Trash2, Calendar, MapPin, Sparkles } from 'lucide-react';
import { notesService } from '../services/notesService';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { timeAgo } from '../utils/formatDate';
import toast from 'react-hot-toast';

const TripNotesPage = () => {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', day: '', stop: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => { notesService.getNotes(id).then(setNotes).finally(() => setLoading(false)); }, [id]);

  const openAdd = () => { setEditing(null); setForm({ title: '', content: '', day: '', stop: '' }); setModalOpen(true); };
  const openEdit = (note) => { setEditing(note); setForm({ title: note.title, content: note.content, day: note.day, stop: note.stop }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required');
    try {
      if (editing) {
        const updated = await notesService.updateNote(editing._id, form);
        setNotes(p => p.map(n => n._id === editing._id ? updated : n)); toast.success('Updated');
      } else {
        const note = await notesService.addNote(id, form);
        setNotes(p => [note, ...p]); toast.success('Added');
      }
      setModalOpen(false);
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try { await notesService.deleteNote(noteId); setNotes(p => p.filter(n => n._id !== noteId)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const filtered = filter === 'all' ? notes : notes.filter(n => (filter === 'day' ? n.day : n.stop));

  if (loading) return <LoadingSpinner />;

  const filterPill = (active) => ({
    padding: '7px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    background: active ? 'rgba(37, 99, 235, 0.08)' : '#F8FAFC',
    color: active ? '#2563EB' : '#64748B',
    border: `1px solid ${active ? 'rgba(37, 99, 235, 0.20)' : '#E2E8F0'}`,
    transition: 'all 0.2s', textTransform: 'capitalize',
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <span className="eyebrow"><FileText style={{ width: '11px', height: '11px' }} /> Journal</span>
          <h1 className="font-display" style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginTop: '6px', letterSpacing: '-0.03em' }}>
            Trip <span className="text-gradient">Notes</span>
          </h1>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={openAdd}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '11px 20px', borderRadius: '12px',
            background: '#2563EB',
            color: 'white', fontSize: '13px', fontWeight: '700',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
          }}>
          <Plus style={{ width: '15px', height: '15px' }} /> New Note
        </motion.button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {['all', 'day', 'stop'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={filterPill(filter === f)}>
            {f === 'all' ? 'All notes' : `By ${f}`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AnimatePresence>
          {filtered.map((note, i) => (
            <motion.div key={note._id} layout
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              style={{ padding: '20px', position: 'relative', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}
              className="card-hover"
            >
              <div style={{
                position: 'absolute', top: '20px', bottom: '20px', left: 0, width: '3px',
                borderRadius: '0 4px 4px 0',
                background: 'linear-gradient(180deg, #7C3AED, #2563EB)',
              }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="font-display" style={{ fontSize: '16px', fontWeight: '700', color: '#111827', letterSpacing: '-0.01em' }}>{note.title}</h3>
                  <p style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>{timeAgo(note.createdAt)}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => openEdit(note)}
                    style={{ padding: '7px', borderRadius: '9px', background: '#F1F5F9', border: '1px solid #E2E8F0', cursor: 'pointer', color: '#64748B' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#2563EB'} onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
                    <Edit style={{ width: '13px', height: '13px' }} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleDelete(note._id)}
                    style={{ padding: '7px', borderRadius: '9px', background: 'rgba(186, 26, 26, 0.04)', border: '1px solid rgba(186, 26, 26, 0.10)', cursor: 'pointer', color: '#94A3B8' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#BA1A1A'} onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                  </motion.button>
                </div>
              </div>
              <p style={{
                fontSize: '13px', color: '#475569', lineHeight: 1.6, marginTop: '10px',
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {note.content}
              </p>
              {(note.day || note.stop) && (
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  {note.day && (
                    <span style={{
                      padding: '4px 10px', borderRadius: '999px',
                      background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.15)',
                      color: '#2563EB', fontSize: '11px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <Calendar style={{ width: '11px', height: '11px' }} /> {note.day}
                    </span>
                  )}
                  {note.stop && (
                    <span style={{
                      padding: '4px 10px', borderRadius: '999px',
                      background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.15)',
                      color: '#7C3AED', fontSize: '11px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <MapPin style={{ width: '11px', height: '11px' }} /> {note.stop}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <Sparkles style={{ width: '32px', height: '32px', color: '#94A3B8', margin: '0 auto 14px' }} />
            <h3 className="font-display" style={{ fontSize: '17px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>No notes yet</h3>
            <p style={{ color: '#64748B', fontSize: '13px' }}>Start capturing your travel memories</p>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Note' : 'Add Note'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            className="input-field" placeholder="Note title..." />
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
            rows={5} className="input-field" style={{ resize: 'none' }} placeholder="Write your note..." />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <input value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))}
              className="input-field" placeholder="e.g. Day 1" />
            <input value={form.stop} onChange={e => setForm(p => ({ ...p, stop: e.target.value }))}
              className="input-field" placeholder="e.g. Paris" />
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={handleSave} className="btn-primary"
          >
            {editing ? 'Update Note' : 'Add Note'}
          </motion.button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default TripNotesPage;
