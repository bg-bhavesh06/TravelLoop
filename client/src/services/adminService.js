import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const adminService = {
  getStats: async () => {
    const { data } = await axios.get(`${API}/admin/stats`);
    return data;
  },
  getUsers: async () => {
    const { data } = await axios.get(`${API}/admin/users`);
    return data;
  },
  deleteUser: async (id) => {
    const { data } = await axios.delete(`${API}/admin/users/${id}`);
    return data;
  },
  getAllTrips: async () => {
    const { data } = await axios.get(`${API}/admin/trips`);
    return data;
  },
};
