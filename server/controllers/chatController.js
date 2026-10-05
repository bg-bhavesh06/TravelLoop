const Chat = require('../models/Chat');
const Message = require('../models/Message');

// One-time backfill: set expiresAt for old chats that don't have it
(async () => {
  try {
    const result = await Chat.updateMany(
      { expiresAt: { $exists: false } },
      [{ $set: { expiresAt: { $add: ['$createdAt', 24 * 60 * 60 * 1000] } } }]
    );
    if (result.modifiedCount > 0) {
      console.log(`[Migration] Backfilled expiresAt on ${result.modifiedCount} old chat(s)`);
    }
  } catch (err) {
    // Silently ignore if collection doesn't exist yet
  }
})();

// Check if user has access to a chat for a specific trip and creator
exports.checkChatAccess = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { creatorId } = req.query;

    if (!creatorId) {
      return res.status(400).json({ message: 'Creator ID is required' });
    }

    // Only consider non-expired chats as "having access"
    const chat = await Chat.findOne({
      participants: { $all: [req.user._id, creatorId] },
      tripId,
      expiresAt: { $gt: new Date() }
    });

    if (chat) {
      return res.json({ hasAccess: true, chatId: chat._id, expiresAt: chat.expiresAt });
    }

    res.json({ hasAccess: false });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error checking chat access' });
  }
};

// Get all chats for the current user (only active ones)
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      expiresAt: { $gt: new Date() }
    })
      .populate('participants', 'firstName lastName profilePhoto')
      .populate('tripId', 'title')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error getting chats' });
  }
};

// Get single chat and its messages
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'firstName lastName profilePhoto')
      .populate('tripId', 'title');

    if (!chat || !chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if chat has expired
    if (new Date() > new Date(chat.expiresAt)) {
      return res.status(403).json({ message: 'This chat has expired. Please pay again to unlock.' });
    }

    const messages = await Message.find({ chatId: chat._id })
      .populate('senderId', 'firstName lastName profilePhoto')
      .sort({ createdAt: 1 });

    res.json({ chat, messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error getting chat details' });
  }
};
