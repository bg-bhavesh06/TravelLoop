const express = require('express');
const router = express.Router();
const { getStats, getUsers, deleteUser, getAllTrips } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.get('/trips', getAllTrips);

module.exports = router;
