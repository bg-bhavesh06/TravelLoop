const express = require('express');
const router = express.Router();
const { getCities, getCityById } = require('../controllers/cityController');

// GET /api/cities
router.get('/', getCities);

// GET /api/cities/:id
router.get('/:id', getCityById);

module.exports = router;
