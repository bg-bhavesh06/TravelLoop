const express = require('express');
const router = express.Router();
const { generateItinerary, saveAiItinerary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-itinerary', protect, generateItinerary);
router.post('/save-itinerary', protect, saveAiItinerary);

module.exports = router;
