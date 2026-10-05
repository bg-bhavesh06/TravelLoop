import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  }}>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      {/* Spinner ring */}
      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
        {/* Track */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '3px solid #E2E8F0',
        }} />
        {/* Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: 'var(--color-primary)',
            borderRightColor: 'var(--color-secondary)',
          }}
        />
        {/* Inner dot */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-tertiary))',
        }} />
      </div>
      {/* Label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}
      >
        Loading…
      </motion.p>
    </div>
  </div>
);

export default LoadingSpinner;
