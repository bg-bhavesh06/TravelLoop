import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const notesService = {
  getNotes: async (tripId) => {
    const { data } = await axios.get(`${API}/notes/trip/${tripId}`);
    return data;
  },
  addNote: async (tripId, note) => {
    const { data } = await axios.post(`${API}/notes/trip/${tripId}`, note);
    return data;
  },
  updateNote: async (noteId, updates) => {
    const { data } = await axios.put(`${API}/notes/${noteId}`, updates);
    return data;
  },
  deleteNote: async (noteId) => {
    const { data } = await axios.delete(`${API}/notes/${noteId}`);
    return data;
  },
};
