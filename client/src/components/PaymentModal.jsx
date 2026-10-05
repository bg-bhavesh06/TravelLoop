import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield, Sparkles, MessageCircle } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const PaymentModal = ({ isOpen, onClose, trip }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!user || !trip) return;
    setProcessing(true);
    try {
      const order = await paymentService.createOrder(
        trip.user._id || trip.user,
        trip._id
      );

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: 'INR',
        name: 'Traveloop Premium Chat',
        description: `Chat with ${trip.user.firstName || 'Traveler'} about "${trip.title}"`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              creatorId: trip.user._id || trip.user,
              tripId: trip._id,
            });
            toast.success('Payment successful! Chat unlocked for 24 hours.');
            onClose();
            navigate('/chat');
          } catch { toast.error('Payment verification failed'); }
        },
        prefill: { name: `${user.firstName} ${user.lastName}`, email: user.email },
        theme: { color: '#2563EB' },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      if (err.response?.data?.chatId) {
        toast.success('Chat already active!');
        onClose();
        navigate('/chat');
      } else {
        toast.error('Failed to initiate payment');
      }
    } finally { setProcessing(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(17, 24, 39, 0.35)',
            backdropFilter: 'blur(8px)',
            padding: '24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '420px',
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 60px rgba(17, 24, 39, 0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Hero */}
            <div style={{
              padding: '32px 28px 24px',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.04), rgba(124, 58, 237, 0.04))',
              textAlign: 'center',
              borderBottom: '1px solid #F1F5F9',
              position: 'relative',
            }}>
              <button onClick={onClose} style={{
                position: 'absolute', top: '14px', right: '14px',
                padding: '6px', borderRadius: '10px', background: '#F1F5F9',
                border: '1px solid #E2E8F0', cursor: 'pointer', color: '#64748B',
              }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>

              <div style={{
                width: '56px', height: '56px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.30)',
              }}>
                <MessageCircle style={{ width: '26px', height: '26px', color: 'white' }} />
              </div>

              <h3 className="font-display" style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                Premium Traveler Chat
              </h3>
              <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.5 }}>
                Connect with <strong style={{ color: '#111827' }}>{trip?.user?.firstName || 'the traveler'}</strong> for 24 hours
              </p>
            </div>

            {/* Details */}
            <div style={{ padding: '24px 28px' }}>
              <div style={{
                padding: '16px', borderRadius: '14px',
                background: '#F8FAFC', border: '1px solid #F1F5F9',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Trip</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>{trip?.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '13px' }}>
                  <span style={{ color: '#64748B' }}>Access</span>
                  <span style={{ color: '#111827', fontWeight: 600 }}>24-hour window</span>
                </div>
                <div style={{ height: '1px', background: '#E2E8F0', margin: '10px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                  <span style={{ color: '#374151', fontWeight: 600 }}>Total</span>
                  <span className="font-display" style={{ fontWeight: '800', color: '#2563EB', fontSize: '18px' }}>₹20</span>
                </div>
              </div>

              {/* Trust */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
                marginBottom: '20px', fontSize: '12px', color: '#94A3B8',
              }}>
                <Shield style={{ width: '13px', height: '13px', color: '#059669' }} />
                Secured by Razorpay · Safe & Encrypted
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={handlePayment}
                disabled={processing}
                style={{
                  width: '100%', padding: '14px',
                  borderRadius: '14px',
                  background: '#2563EB',
                  color: 'white', fontWeight: '700', fontSize: '14px',
                  border: 'none', cursor: processing ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.30)',
                  opacity: processing ? 0.7 : 1,
                }}
              >
                <CreditCard style={{ width: '16px', height: '16px' }} />
                {processing ? 'Processing...' : 'Pay ₹20 & Start Chatting'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
