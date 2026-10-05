import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

export const paymentService = {
  createOrder: async (creatorId, tripId) => {
    const { data } = await axios.post(`${API}/payment/create-order`, { creatorId, tripId });
    return data;
  },
  verifyPayment: async (paymentData) => {
    const { data } = await axios.post(`${API}/payment/verify`, paymentData);
    return data;
  },
};
