const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Chat = require('../models/Chat');
const Trip = require('../models/Trip');

// Create Order
exports.createOrder = async (req, res) => {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret1234567890';
    
    console.log(`[DEBUG] Initializing Razorpay with Key ID: ${key_id}`);

    const razorpay = new Razorpay({
      key_id,
      key_secret
    });

    const { tripId, creatorId } = req.body;
    const amount = 20; // ₹20

    // Check if an active (non-expired) chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [req.user._id, creatorId] },
      tripId,
      expiresAt: { $gt: new Date() }
    });

    if (existingChat) {
      return res.status(400).json({ message: 'Chat is still active for this trip.' });
    }

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    // Save initial payment record
    const payment = await Payment.create({
      buyer: req.user._id,
      creator: creatorId,
      trip: tripId,
      razorpayOrderId: order.id,
      amount: amount,
      status: 'created'
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummykeyid123'
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    if (error.statusCode === 401) {
      return res.status(400).json({ message: 'Invalid Razorpay API Keys. Please add your real RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.' });
    }
    res.status(500).json({ message: error.error?.description || 'Server error creating order' });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, tripId, creatorId } = req.body;

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummysecret1234567890';
    const expectedSignature = crypto.createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Find the payment and mark as failed
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: 'failed' }
      );
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // Update payment status to successful
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { 
        status: 'successful',
        razorpayPaymentId: razorpay_payment_id 
      },
      { new: true }
    );

    // Create Chat Room — expires in 24 hours
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const chat = await Chat.create({
      participants: [req.user._id, creatorId],
      tripId: tripId,
      unlockedByPayment: payment._id,
      expiresAt
    });

    res.json({ 
      success: true, 
      message: 'Payment verified successfully',
      chatId: chat._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error verifying payment' });
  }
};
