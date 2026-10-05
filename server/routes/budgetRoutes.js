const express = require('express');
const router = express.Router();
const { getBudget } = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/trip/:tripId', getBudget);

module.exports = router;
