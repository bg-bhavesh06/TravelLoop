import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Plus, Trash2, RotateCcw, Printer, Sparkles } from 'lucide-react';
import { checklistService } from '../services/checklistService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const categories = ['clothing', 'documents', 'electronics', 'toiletries', 'other'];
const catIcons = { clothing: '👕', documents: '📄', electronics: '📱', toiletries: '🧴', other: '📦' };

const PackingChecklistPage = () => {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newCat, setNewCat] = useState('other');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { checklistService.getChecklist(id).then(setItems).finally(() => setLoading(false)); }, [id]);

  const addItem = async () => {
    if (!newLabel.trim()) return;
    try {
      const item = await checklistService.addItem(id, { label: newLabel, category: newCat });
      setItems(p => [...p, item]); setNewLabel(''); toast.success('Added');
    } catch { toast.error('Failed'); }
  };
  const toggleItem = async (item) => {
    setItems(p => p.map(i => i._id === item._id ? { ...i, isPacked: !i.isPacked } : i));
    try { await checklistService.toggleItem(item._id); } catch { setItems(p => p.map(i => i._id === item._id ? { ...i, isPacked: !i.isPacked } : i)); }
  };
  const deleteItem = async (itemId) => {
    setItems(p => p.filter(i => i._id !== itemId));
    try { await checklistService.deleteItem(itemId); } catch { toast.error('Failed'); }
  };
  const resetAll = async () => {
    if (!window.confirm('Reset all?')) return;
    try { const u = await checklistService.resetChecklist(id); setItems(u); toast.success('Reset'); } catch { toast.error('Failed'); }
  };

  const filtered = activeTab === 'all' ? items : items.filter(i => i.category === activeTab);
  const packed = items.filter(i => i.isPacked).length;
  const total = items.length;
  const progress = total > 0 ? (packed / total) * 100 : 0;
  const tabStyle = (active) => ({
    padding: '8px 16px', borderRadius: '11px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap',
    background: active ? 'rgba(37, 99, 235, 0.08)' : '#F8FAFC',
    color: active ? '#2563EB' : '#64748B',
    border: `1px solid ${active ? 'rgba(37, 99, 235, 0.20)' : '#E2E8F0'}`,
    transition: 'all 0.2s',
  });

  if (loading) return <LoadingSpinner />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '60px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <span className="eyebrow"><CheckSquare style={{ width: '11px', height: '11px' }} /> Packing</span>
          <h1 className="font-display" style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginTop: '6px', letterSpacing: '-0.03em' }}>
            <span className="text-gradient">Don't forget</span> a thing
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <motion.button whileTap={{ scale: 0.95 }} onClick={resetAll} title="Reset all"
            style={{ padding: '10px', borderRadius: '11px', background: '#FFFFFF', border: '1px solid #E2E8F0', cursor: 'pointer', color: '#64748B', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <RotateCcw style={{ width: '15px', height: '15px' }} />
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => window.print()} title="Print"
            style={{ padding: '10px', borderRadius: '11px', background: '#FFFFFF', border: '1px solid #E2E8F0', cursor: 'pointer', color: '#64748B', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <Printer style={{ width: '15px', height: '15px' }} />
          </motion.button>
        </div>
      </div>

      {/* Progress card */}
      <div style={{ padding: '20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
            {packed} of {total} packed
          </span>
          <span className="font-display" style={{ fontSize: '22px', fontWeight: '800', color: progress === 100 ? '#059669' : '#2563EB', letterSpacing: '-0.02em' }}>
            {progress.toFixed(0)}%
          </span>
        </div>
        <div style={{ height: '10px', borderRadius: '999px', background: '#F1F5F9', overflow: 'hidden', position: 'relative' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              height: '100%', borderRadius: '999px',
              background: progress === 100
                ? 'linear-gradient(90deg, #059669, #10B981)'
                : 'linear-gradient(90deg, #2563EB, #7C3AED)',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }} className="scrollbar-hide">
        <button onClick={() => setActiveTab('all')} style={tabStyle(activeTab === 'all')}>All · {items.length}</button>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveTab(c)} style={tabStyle(activeTab === c)}>
            {catIcons[c]} {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} onKeyDown={e => e.key === 'Enter' && addItem()}
          className="input-field" style={{ flex: 1 }} placeholder="Add a new item..." />
        <select value={newCat} onChange={e => setNewCat(e.target.value)} className="input-field" style={{ width: '150px' }}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={addItem}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '10px 18px', borderRadius: '12px',
            background: '#2563EB',
            color: 'white', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.20)',
          }}>
          <Plus style={{ width: '17px', height: '17px' }} />
        </motion.button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <AnimatePresence>
          {filtered.map(item => (
            <motion.div key={item._id} layout
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }}
              whileHover={{ x: 4 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 18px', borderRadius: '13px',
                background: item.isPacked ? '#F8FAFC' : '#FFFFFF',
                border: `1px solid ${item.isPacked ? '#E2E8F0' : '#E2E8F0'}`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
              }}>
              <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleItem(item)}
                style={{
                  width: '22px', height: '22px', borderRadius: '7px',
                  border: `2px solid ${item.isPacked ? 'transparent' : '#CBD5E1'}`,
                  background: item.isPacked ? '#2563EB' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}>
                {item.isPacked && <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>✓</span>}
              </motion.button>
              <span style={{ fontSize: '14px' }}>{catIcons[item.category]}</span>
              <span style={{
                flex: 1, fontSize: '13px', fontWeight: 500,
                color: item.isPacked ? '#94A3B8' : '#111827',
                textDecoration: item.isPacked ? 'line-through' : 'none',
                transition: 'color 0.2s',
              }}>
                {item.label}
              </span>
              <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.1 }} onClick={() => deleteItem(item._id)}
                style={{ padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <Trash2 style={{ width: '14px', height: '14px' }} />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <Sparkles style={{ width: '32px', height: '32px', color: '#94A3B8', margin: '0 auto 12px' }} />
            <p style={{ color: '#64748B', fontSize: '13px' }}>No items yet. Add some above!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PackingChecklistPage;
