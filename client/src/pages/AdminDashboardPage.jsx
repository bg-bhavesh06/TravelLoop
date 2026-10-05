import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users as UsersIcon, Map, TrendingUp, Trash2, Sparkles } from 'lucide-react';
import { adminService } from '../services/adminService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'admin') { toast.error('Access Denied'); navigate('/dashboard'); return; }
    const load = async () => {
      try {
        const [s, u, t] = await Promise.all([adminService.getStats(), adminService.getUsers(), adminService.getAllTrips()]);
        setStats(s); setUsers(u); setTrips(t);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try { await adminService.deleteUser(id); setUsers(p => p.filter(u => u._id !== id)); toast.success('Deleted'); } catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: UsersIcon, color: '#2563EB', bg: 'rgba(37, 99, 235, 0.06)', border: 'rgba(37, 99, 235, 0.15)' },
    { label: 'Total Trips', value: stats?.totalTrips || 0, icon: Map, color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.06)', border: 'rgba(124, 58, 237, 0.15)' },
    { label: 'Popular City', value: stats?.popularCity || 'N/A', icon: TrendingUp, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.06)', border: 'rgba(236, 72, 153, 0.15)' },
    { label: 'Public Trips', value: stats?.publicTrips || 0, icon: Shield, color: '#D97706', bg: 'rgba(217, 119, 6, 0.06)', border: 'rgba(217, 119, 6, 0.15)' },
  ];

  const tabStyle = (active) => ({
    padding: '9px 18px', borderRadius: '11px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textTransform: 'capitalize',
    background: active ? 'rgba(37, 99, 235, 0.08)' : '#F8FAFC',
    color: active ? '#2563EB' : '#64748B',
    border: `1px solid ${active ? 'rgba(37, 99, 235, 0.20)' : '#E2E8F0'}`,
    transition: 'all 0.2s',
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '60px' }}>

      <div>
        <span className="eyebrow"><Shield style={{ width: '11px', height: '11px' }} /> Admin Panel</span>
        <h1 className="font-display" style={{ fontSize: '34px', fontWeight: '800', color: '#111827', marginTop: '6px', letterSpacing: '-0.03em' }}>
          Admin <span className="text-gradient-warm">Dashboard</span>
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}
              className="card-hover"
            >
              <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: s.bg, border: `1px solid ${s.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon style={{ width: '22px', height: '22px', color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.label}</p>
                <p className="font-display" style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginTop: '2px', letterSpacing: '-0.02em' }}>{s.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '22px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
          <h3 className="font-display" style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>Trips Over Time</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={stats?.tripsByMonth || []}>
              <defs>
                <linearGradient id="lineColor" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#7C3AED" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="_id" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
              <Line type="monotone" dataKey="count" stroke="url(#lineColor)" strokeWidth={3} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ padding: '22px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
          <h3 className="font-display" style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '14px' }}>Top Cities</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats?.topCities || []}>
              <defs>
                <linearGradient id="adminBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="_id" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: '#E2E8F0' }} tickLine={false} />
              <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} cursor={{ fill: '#F8FAFC' }} />
              <Bar dataKey="count" fill="url(#adminBar)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['overview', 'users', 'trips'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div style={{ overflow: 'hidden', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <th style={thStyle}>Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...tdStyle, color: '#111827', fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{u.email}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                        background: u.role === 'admin' ? 'rgba(217, 119, 6, 0.08)' : 'rgba(37, 99, 235, 0.08)',
                        color: u.role === 'admin' ? '#D97706' : '#2563EB',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(217, 119, 6, 0.15)' : 'rgba(37, 99, 235, 0.15)'}`,
                      }}>{u.role}</span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <button onClick={() => deleteUser(u._id)}
                        style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#BA1A1A'; e.currentTarget.style.background = 'rgba(186, 26, 26, 0.06)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}>
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'trips' && (
        <div style={{ overflow: 'hidden', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(17,24,39,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <th style={thStyle}>Title</th>
                  <th style={thStyle}>User</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Public</th>
                </tr>
              </thead>
              <tbody>
                {trips.map(t => (
                  <tr key={t._id} style={{ borderBottom: '1px solid #F1F5F9' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...tdStyle, color: '#111827', fontWeight: 500 }}>{t.title}</td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{t.user?.firstName} {t.user?.lastName}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                        background: t.status === 'ongoing' ? 'rgba(5, 150, 105, 0.08)' : t.status === 'upcoming' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(100, 116, 139, 0.08)',
                        color: t.status === 'ongoing' ? '#059669' : t.status === 'upcoming' ? '#2563EB' : '#64748B',
                        border: `1px solid ${t.status === 'ongoing' ? 'rgba(5, 150, 105, 0.15)' : t.status === 'upcoming' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(100, 116, 139, 0.15)'}`,
                        textTransform: 'capitalize',
                      }}>{t.status}</span>
                    </td>
                    <td style={{ ...tdStyle, color: t.isPublic ? '#059669' : '#64748B', fontWeight: 500 }}>{t.isPublic ? '✓ Yes' : '— No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'overview' && (
        <div style={{ padding: '32px', textAlign: 'center', background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
          <Sparkles style={{ width: '36px', height: '36px', color: '#94A3B8', margin: '0 auto 14px' }} />
          <p style={{ color: '#64748B', fontSize: '14px' }}>Use the tabs above to manage users and trips.</p>
        </div>
      )}
    </motion.div>
  );
};

const thStyle = { textAlign: 'left', padding: '14px 18px', color: '#64748B', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' };
const tdStyle = { padding: '14px 18px' };

export default AdminDashboardPage;
