import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('traveloop_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
      } catch {
        localStorage.removeItem('traveloop_user');
      }
    }
    setLoading(false);
  }, []);

  const setUserSession = (userData) => {
    setUser(userData);
    localStorage.setItem('traveloop_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  };

  const login = async (email, password, deviceInfo, location) => {
    const data = await authService.login(email, password, deviceInfo, location);
    if (!data.requiresChallenge && data.token) {
      setUserSession(data);
    }
    return data;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    if (data.token) {
      setUserSession(data);
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('traveloop_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('traveloop_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, setUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
