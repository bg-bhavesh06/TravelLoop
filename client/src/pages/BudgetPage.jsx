import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Wallet, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { tripService } from '../services/tripService';
import { BudgetPieChart, BudgetBarChart } from '../components/BudgetChart';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDayCount } from '../utils/formatDate';

const BudgetPage = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try { const [t, b] = await Promise.all([tripService.getTrip(id), budgetService.getBudget(id)]); setTrip(t); setBudget(b); } catch {} finally { setLoading(false); }
    };
    load();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  const days = getDayCount(trip?.startDate, trip?.endDate);
  const over = budget && budget.totalSpent > budget.totalBudget && budget.totalBudget > 0;

  const stats = [
    { label: 'Total Budget', val: `₹${(budget?.totalBudget || 0).toLocaleString()}`, icon: Wallet, color: '#2563EB', bg: 'rgba(37, 99, 235, 0.06)', border: 'rgba(37, 99, 235, 0.15)' },
    { label: 'Spent', val: `₹${(budget?.totalSpent || 0).toLocaleString()}`, icon: TrendingDown, color: over ? '#BA1A1A' : '#7C3AED', bg: over ? 'rgba(186, 26, 26, 0.06)' : 'rgba(124, 58, 237, 0.06)', border: over ? 'rgba(186, 26, 26, 0.15)' : 'rgba(124, 58, 237, 0.15)' },
    { label: 'Remaining', val: `₹${(budget?.remaining || 0).toLocaleString()}`, icon: TrendingUp, color: '#059669', bg: 'rgba(5, 150, 105, 0.06)', border: 'rgba(5, 150, 105, 0.15)' },
    { label: 'Avg / Day', val: `₹${days ? ((budget?.totalSpent || 0) / days).toFixed(0) : 0}`, icon: DollarSign, color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.06)', border: 'rgba(6, 182, 212, 0.15)' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}
    >
      <div>
        <span className="eyebrow"><Wallet style={{ width: '11px', height: '11px' }} /> Finances</span>
        <h1 className="font-display" style={{ fontSize: '34px', fontWeight: '800', color: '#111827', marginTop: '6px', letterSpacing: '-0.03em' }}>
          Budget <span className="text-gradient">Overview</span>
        </h1>
      </div>

      {over && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '14px 18px', borderRadius: '14px',
            background: 'rgba(186, 26, 26, 0.08)',
            border: '1px solid rgba(186, 26, 26, 0.20)',
            color: '#BA1A1A', fontSize: '13px', fontWeight: 600,
          }}>
          <AlertCircle style={{ width: '17px', height: '17px' }} />
          You've exceeded your budget by <strong style={{ color: '#BA1A1A' }}>₹{(budget.totalSpent - budget.totalBudget).toFixed(2)}</strong>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              style={{
                padding: '22px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(17,24,39,0.04)',
              }}
              className="card-hover"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</p>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '11px',
                  background: s.bg, border: `1px solid ${s.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: '17px', height: '17px', color: s.color }} />
                </div>
              </div>
              <p className="font-display" style={{ fontSize: '26px', fontWeight: '800', color: '#111827', letterSpacing: '-0.02em' }}>{s.val}</p>
            </motion.div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
          <h3 className="font-display" style={{ fontWeight: '700', color: '#111827', marginBottom: '16px', fontSize: '16px' }}>Spending by Category</h3>
          <BudgetPieChart breakdown={budget?.breakdown} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
          <h3 className="font-display" style={{ fontWeight: '700', color: '#111827', marginBottom: '16px', fontSize: '16px' }}>Budget vs Spent by Section</h3>
          <BudgetBarChart sections={budget?.sections} />
        </motion.div>
      </div>

      {budget?.sections?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ padding: '24px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
          <h3 className="font-display" style={{ fontWeight: '700', color: '#111827', marginBottom: '16px', fontSize: '16px' }}>Section Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {budget.sections.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', borderRadius: '12px',
                  background: s.overBudget ? 'rgba(186, 26, 26, 0.04)' : '#F8FAFC',
                  border: `1px solid ${s.overBudget ? 'rgba(186, 26, 26, 0.15)' : '#F1F5F9'}`,
                  transition: 'all 0.2s',
                }}>
                <span style={{ fontSize: '13px', color: '#111827', fontWeight: 600 }}>{s.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Budget: <strong style={{ color: '#374151' }}>₹{s.budget}</strong></span>
                  <span style={{ color: s.overBudget ? '#BA1A1A' : '#2563EB', fontWeight: 600 }}>Spent: ₹{s.spent}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BudgetPage;
