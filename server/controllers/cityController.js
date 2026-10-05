const City = require('../models/City');

// @desc    Get cities by query/region
// @route   GET /api/cities
// @access  Public
exports.getCities = async (req, res) => {
  try {
    const { q, region } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (region) filter.region = { $regex: region, $options: 'i' };
    const cities = await City.find(filter).sort({ popularity: -1 });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get city by ID
// @route   GET /api/cities/:id
// @access  Public
exports.getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) return res.status(404).json({ message: 'City not found' });
    res.json(city);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
