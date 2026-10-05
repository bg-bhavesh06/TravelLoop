const express = require('express');
const router = express.Router();
const { getChecklist, addItem, toggleItem, deleteItem, resetChecklist } = require('../controllers/checklistController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.route('/trip/:tripId').get(getChecklist).post(addItem);
router.delete('/trip/:tripId/reset', resetChecklist);
router.route('/:itemId').patch(toggleItem).delete(deleteItem);

module.exports = router;
