const express = require('express');
const router = express.Router();
const { getActivities, getActivity } = require('../controllers/activityController');

router.get('/', getActivities);
router.get('/:id', getActivity);

module.exports = router;
