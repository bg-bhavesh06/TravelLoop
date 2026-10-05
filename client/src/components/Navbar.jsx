import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Map, Users, Search, Bell, Menu, X, LogOut, User, Shield, Sparkles, MessageCircle, Plus } from 'lucide-react';
import logoSvg from '../assets/plane logo.png';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/trips', label: 'My Trips', icon: Map },
    { path: '/search', label: 'Discover', icon: Search },
    { path: '/community', label: 'Community', icon: Users },
    { path: '/chat', label: 'Chats', icon: MessageCircle },
    { path: '/ai-planner', label: 'AI Planner', icon: Sparkles },
  ];

  const isActiveLink = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 80,
        background: scrolled ? 'rgba(255, 255, 255, 0.90)' : 'rgba(244, 246, 248, 0.65)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        borderBottom: scrolled ? '1px solid #E2E8F0' : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
          
          {/* Logo Branding */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <motion.div
              whileHover={{ rotate: 6, scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                overflow: 'hidden', border: '1px solid rgba(10, 34, 64, 0.08)',
                boxShadow: '0 4px 14px rgba(255, 90, 31, 0.15)',
              }}
            >
              <img src={logoSvg} alt="Traveloop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }} className="hidden sm:flex">
              <span className="font-display" style={{
                fontSize: '18px', fontWeight: '700', letterSpacing: '-0.02em',
                color: '#0A2240',
              }}>
                Traveloop
              </span>
              <span style={{ fontSize: '8px', color: '#64748B', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                Plan · Explore · Share
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="hidden md:flex">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = isActiveLink(link.path);
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', borderRadius: '12px',
                    fontSize: '13px', fontWeight: '600',
                    textDecoration: 'none', transition: 'all 0.25s ease',
                    color: isActive ? '#FF5A1F' : '#475569',
                    background: isActive ? 'rgba(255, 90, 31, 0.08)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(255, 90, 31, 0.15)' : 'transparent'}`,
                  }}
                  onMouseEnter={e => { 
                    if (!isActive) {
                      e.currentTarget.style.color = '#0A2240'; 
                      e.currentTarget.style.background = 'rgba(10, 34, 64, 0.04)'; 
                    }
                  }}
                  onMouseLeave={e => { 
                    if (!isActive) {
                      e.currentTarget.style.color = '#475569'; 
                      e.currentTarget.style.background = 'transparent'; 
                    }
                  }}
                >
                  <Icon style={{ width: '14px', height: '14px' }} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop/Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Quick action: Create Trip */}
            {!location.pathname.startsWith('/trips/new') && (
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/trips/new')}
                className="hidden sm:flex"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 16px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FF5A1F 0%, #E04812 100%)',
                  color: 'white', fontSize: '13px', fontWeight: '600',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 90, 31, 0.25)',
                }}
              >
                <Plus style={{ width: '14px', height: '14px' }} /> New Trip
              </motion.button>
            )}

            {/* Notification Bell */}
            <button style={{
              position: 'relative', padding: '10px', borderRadius: '12px',
              background: 'white', border: '1px solid #E2E8F0',
              cursor: 'pointer', color: '#64748B', transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(10, 34, 64, 0.02)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0A2240'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
              <Bell style={{ width: '16px', height: '16px' }} />
              <span style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#FF5A1F',
                boxShadow: '0 0 6px rgba(255, 90, 31, 0.6)',
              }} />
            </button>

            {/* Profile Dropdown Trigger */}
            <div ref={profileRef} style={{ position: 'relative' }} className="hidden md:block">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 12px 5px 5px', borderRadius: '999px',
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(10, 34, 64, 0.04)',
                }}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0A2240, #FF5A1F)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: '700', color: 'white',
                }}>
                  {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#0A2240' }}>
                  {user.firstName}
                </span>
              </motion.button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', right: 0, top: '100%', marginTop: '8px',
                      width: '230px', borderRadius: '16px', overflow: 'hidden',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 12px 40px rgba(10, 34, 64, 0.08), 0 4px 12px rgba(10, 34, 64, 0.04)',
                    }}
                  >
                    <div style={{
                      padding: '16px',
                      background: '#F8FAFC',
                      borderBottom: '1px solid #E2E8F0',
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#0A2240' }}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                    </div>
                    <div style={{ padding: '6px' }}>
                      <Link to="/profile" style={menuItemStyle} className="hover:bg-gray-50">
                        <User style={{ width: '15px', height: '15px', color: '#64748B' }} /> My Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" style={menuItemStyle} className="hover:bg-gray-50">
                          <Shield style={{ width: '15px', height: '15px', color: '#64748B' }} /> Admin Panel
                        </Link>
                      )}
                      <div className="divider" style={{ margin: '6px 0' }} />
                      <button onClick={handleLogout} style={{ ...menuItemStyle, color: '#DC2626', width: '100%', background: 'transparent', border: 'none', textAlign: 'left' }} className="hover:bg-red-50">
                        <LogOut style={{ width: '15px', height: '15px' }} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile burger toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden"
              style={{
                padding: '10px', borderRadius: '12px',
                background: 'white',
                border: '1px solid #E2E8F0',
                cursor: 'pointer', color: '#0A2240',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(10, 34, 64, 0.04)',
              }}
            >
              {mobileOpen ? <X style={{ width: '18px', height: '18px' }} /> : <Menu style={{ width: '18px', height: '18px' }} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Dark overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0, top: '70px',
                background: 'rgba(6, 18, 33, 0.40)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 70,
              }}
              className="md:hidden"
            />
            {/* Slide down drawer */}
            <motion.div
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed', top: '70px', left: 0, right: 0,
                background: '#FFFFFF',
                borderBottom: '1px solid #E2E8F0',
                padding: '20px 24px 28px',
                display: 'flex', flexDirection: 'column', gap: '20px',
                zIndex: 80,
                boxShadow: '0 10px 30px rgba(10, 34, 64, 0.08)',
              }}
              className="md:hidden"
            >
              {/* Navigation Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActiveLink(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 16px', borderRadius: '12px',
                        fontSize: '14px', fontWeight: '600',
                        textDecoration: 'none',
                        color: isActive ? '#FF5A1F' : '#374151',
                        background: isActive ? 'rgba(255, 90, 31, 0.08)' : 'transparent',
                        border: `1px solid ${isActive ? 'rgba(255, 90, 31, 0.15)' : 'transparent'}`,
                      }}
                    >
                      <Icon style={{ width: '16px', height: '16px' }} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Divider */}
              <div className="divider" style={{ background: '#E2E8F0', height: '1px' }} />

              {/* Profile card and Logout */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0A2240, #FF5A1F)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '700', color: 'white',
                  }}>
                    {(user.firstName?.[0] || '').toUpperCase()}{(user.lastName?.[0] || '').toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '700', color: '#0A2240' }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p style={{ fontSize: '11px', color: '#64748B' }}>{user.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link to="/profile" style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px', borderRadius: '10px',
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    color: '#475569', fontSize: '12px', fontWeight: '600', textDecoration: 'none',
                  }}>
                    <User style={{ width: '14px', height: '14px' }} /> Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      padding: '10px', borderRadius: '10px',
                      background: '#F8FAFC', border: '1px solid #E2E8F0',
                      color: '#475569', fontSize: '12px', fontWeight: '600', textDecoration: 'none',
                    }}>
                      <Shield style={{ width: '14px', height: '14px' }} /> Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    padding: '10px', borderRadius: '10px',
                    background: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.15)',
                    color: '#DC2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                  }}>
                    <LogOut style={{ width: '14px', height: '14px' }} /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const menuItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#374151',
  textDecoration: 'none',
  borderRadius: '10px',
  cursor: 'pointer',
  transition: 'background 0.18s ease, color 0.18s ease',
};

export default Navbar;
