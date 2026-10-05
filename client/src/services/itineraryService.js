import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const itineraryService = {
  getItinerary: async (tripId) => {
    const { data } = await axios.get(`${API}/itineraries/trip/${tripId}`);
    return data;
  },
  createOrUpdate: async (tripId, sections) => {
    const { data } = await axios.post(`${API}/itineraries/trip/${tripId}`, { sections });
    return data;
  },
  updateItinerary: async (id, updates) => {
    const { data } = await axios.put(`${API}/itineraries/${id}`, updates);
    return data;
  },
  addSection: async (id, section) => {
    const { data } = await axios.post(`${API}/itineraries/${id}/sections`, section);
    return data;
  },
  removeSection: async (id, sectionId) => {
    const { data } = await axios.delete(`${API}/itineraries/${id}/sections/${sectionId}`);
    return data;
  },
};
