import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const chatService = {
  getChats: async () => {
    const { data } = await axios.get(`${API}/chat`);
    return data;
  },
  getChat: async (chatId) => {
    const { data } = await axios.get(`${API}/chat/${chatId}`);
    return data;
  },
  checkChatAccess: async (tripId) => {
    const { data } = await axios.get(`${API}/chat/access/${tripId}`);
    return data;
  },
};
