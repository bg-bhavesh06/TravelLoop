const express = require('express');
const router = express.Router();
const { getItinerary, createItinerary, updateItinerary, addSection, removeSection } = require('../controllers/itineraryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/trip/:tripId').get(getItinerary).post(createItinerary);
router.route('/:id').put(updateItinerary);
router.post('/:id/sections', addSection);
router.delete('/:id/sections/:sectionId', removeSection);

module.exports = router;
