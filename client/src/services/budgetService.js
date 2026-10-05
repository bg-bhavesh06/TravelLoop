import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const budgetService = {
  getBudget: async (tripId) => {
    const { data } = await axios.get(`${API}/budget/trip/${tripId}`);
    return data;
  },
};
