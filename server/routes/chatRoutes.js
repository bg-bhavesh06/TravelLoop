const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const chatController = require('../controllers/chatController');

router.get('/access/:tripId', protect, chatController.checkChatAccess);
router.get('/', protect, chatController.getUserChats);
router.get('/:chatId', protect, chatController.getChat);

module.exports = router;
