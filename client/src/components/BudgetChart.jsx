import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const PIE_COLORS = ['#2563EB', '#7C3AED', '#06B6D4', '#D97706', '#059669', '#EC4899', '#F97316', '#6366F1'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: '10px 14px',
      boxShadow: '0 12px 40px rgba(17, 24, 39, 0.12)',
      fontSize: '13px',
    }}>
      <p style={{ color: '#111827', fontWeight: 600 }}>{payload[0].name}</p>
      <p style={{ color: '#2563EB', fontWeight: 700 }}>₹{payload[0].value?.toLocaleString()}</p>
    </div>
  );
};

export const BudgetPieChart = ({ breakdown }) => {
  const data = Object.entries(breakdown || {})
    .filter(([_, total]) => total > 0)
    .map(([category, total]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: total,
    }));

  if (data.length === 0) {
    return <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '30px' }}>No category data available.</p>;
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="50%"
            innerRadius={55} outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', paddingTop: '8px' }}>
        {data.map((item, i) => (
          <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '3px',
              background: PIE_COLORS[i % PIE_COLORS.length],
            }} />
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export const BudgetBarChart = ({ sections }) => {
  if (!sections || sections.length === 0) {
    return <p style={{ color: '#94A3B8', fontSize: '13px', textAlign: 'center', padding: '30px' }}>No section data available.</p>;
  }

  const data = sections.map(s => ({
    name: s.title,
    budget: s.budget || 0,
    spent: s.spent || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <defs>
          <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" stopOpacity={0.80} />
            <stop offset="100%" stopColor="#2563EB" stopOpacity={0.30} />
          </linearGradient>
          <linearGradient id="spentGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.80} />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.30} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis
          dataKey="name"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={{ stroke: '#E2E8F0' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(37, 99, 235, 0.04)' }} />
        <Bar dataKey="budget" fill="url(#budgetGrad)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="spent" fill="url(#spentGrad)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
