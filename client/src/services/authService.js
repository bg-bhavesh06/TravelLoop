import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const authService = {
  login: async (email, password, deviceInfo = {}, location = 'Normal') => {
    const { data } = await axios.post(`${API}/auth/login`, { email, password, deviceInfo, location });
    return data;
  },
  verifyOtp: async ({ pendingToken, otp, deviceInfo }) => {
    const { data } = await axios.post(`${API}/auth/verify-otp`, { pendingToken, otp, deviceInfo });
    return data;
  },
  verifyPattern: async ({ pendingToken, selectedPattern, deviceInfo }) => {
    const { data } = await axios.post(`${API}/auth/verify-pattern`, { pendingToken, selectedPattern, deviceInfo });
    return data;
  },
  submitHoneypot: async ({ email, fakeOtp, deviceInfo }) => {
    const { data } = await axios.post(`${API}/auth/honeypot`, { email, fakeOtp, deviceInfo });
    return data;
  },
  register: async (formData) => {
    const { data } = await axios.post(`${API}/auth/register`, formData);
    return data;
  },
  getMe: async () => {
    const { data } = await axios.get(`${API}/auth/me`);
    return data;
  },
  updateMe: async (updates) => {
    const { data } = await axios.put(`${API}/auth/me`, updates);
    return data;
  },
  deleteMe: async () => {
    const { data } = await axios.delete(`${API}/auth/me`);
    return data;
  },
  getSecurityOverview: async () => {
    const { data } = await axios.get(`${API}/auth/security-overview`);
    return data;
  },
  forgotPassword: async (email) => {
    const { data } = await axios.post(`${API}/auth/forgot-password`, { email });
    return data;
  },
  resetPassword: async (email, code, newPassword) => {
    const { data } = await axios.post(`${API}/auth/reset-password`, { email, code, newPassword });
    return data;
  },
  clearTrustedDevices: async (email) => {
    const { data } = await axios.post(`${API}/auth/clear-trusted-devices`, { email });
    return data;
  },
};
