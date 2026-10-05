import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const checklistService = {
  getChecklist: async (tripId) => {
    const { data } = await axios.get(`${API}/checklists/trip/${tripId}`);
    return data;
  },
  addItem: async (tripId, item) => {
    const { data } = await axios.post(`${API}/checklists/trip/${tripId}`, item);
    return data;
  },
  toggleItem: async (itemId, updates) => {
    const { data } = await axios.patch(`${API}/checklists/${itemId}`, updates);
    return data;
  },
  deleteItem: async (itemId) => {
    const { data } = await axios.delete(`${API}/checklists/${itemId}`);
    return data;
  },
  resetChecklist: async (tripId) => {
    const { data } = await axios.delete(`${API}/checklists/trip/${tripId}/reset`);
    return data;
  },
};
