import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const cityService = {
  getCities: async (params) => {
    const { data } = await axios.get(`${API}/cities`, { params });
    return data;
  },
  getCity: async (id) => {
    const { data } = await axios.get(`${API}/cities/${id}`);
    return data;
  },
};
