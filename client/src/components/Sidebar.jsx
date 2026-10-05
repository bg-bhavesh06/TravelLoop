import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Map, Search, Users, Sparkles, MessageCircle, User, LogOut, X } from 'lucide-react';
import logoSvg from '../assets/plane logo.png';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trips', label: 'My Trips', icon: Map },
  { to: '/search', label: 'Discover', icon: Search },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/chat', label: 'Chats', icon: MessageCircle },
  { to: '/ai-planner', label: 'AI Planner', icon: Sparkles },
  { to: '/profile', label: 'Profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onClose) onClose();
  };

  const sidebarContent = (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '260px',
      background: 'linear-gradient(180deg, #0A1E35 0%, #061221 100%)',
      borderRight: '1px solid rgba(255, 255, 255, 0.06)',
      padding: '24px 18px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 100,
      boxShadow: '8px 0 32px rgba(6, 18, 33, 0.15)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Branding Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(255, 90, 31, 0.25)'
            }}>
              <img src={logoSvg} alt="Traveloop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span className="font-display" style={{
                fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}>
                Traveloop
              </span>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Plan · Explore
              </span>
            </div>
          </div>

          {/* Close button (Mobile only) */}
          <button
            onClick={onClose}
            style={{
              padding: '6px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.06)',
              border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.7)',
            }}
            className="md:hidden"
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Navigation links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => { if (onClose) onClose(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.65)',
                  background: isActive ? 'linear-gradient(90deg, #FF5A1F 0%, #E04812 100%)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isActive ? '0 4px 14px rgba(255, 90, 31, 0.35)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#FFFFFF';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile section */}
      <div style={{
        paddingTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        {/* User stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF5A1F, #FF8A50)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '700', color: 'white',
            boxShadow: '0 2px 8px rgba(255, 90, 31, 0.2)',
            flexShrink: 0,
          }}>
            {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.firstName} {user.lastName}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* Logout action */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(220, 38, 38, 0.15)',
            color: '#F87171', fontSize: '13px', fontWeight: '600',
            cursor: 'pointer', transition: 'all 0.2s', width: '100%',
            textAlign: 'left',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.15)';
            e.currentTarget.style.color = '#EF4444';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(220, 38, 38, 0.08)';
            e.currentTarget.style.color = '#F87171';
          }}
        >
          <LogOut style={{ width: '15px', height: '15px' }} />
          Logout
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop View Sidebar */}
      <div className="hidden md:block">
        {sidebarContent}
      </div>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(6, 18, 33, 0.45)',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                zIndex: 90,
              }}
              className="md:hidden"
            />
            {/* Sidebar Slide-in */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{ position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 100 }}
              className="md:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
