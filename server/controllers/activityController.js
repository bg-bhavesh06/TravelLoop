const Activity = require('../models/Activity');

// GET /api/activities
exports.getActivities = async (req, res) => {
  try {
    const { city, type, maxCost, q } = req.query;
    const filter = {};
    if (city) filter.city = city;
    if (type) filter.type = type;
    if (maxCost) filter.averageCost = { $lte: Number(maxCost) };
    if (q) filter.name = { $regex: q, $options: 'i' };
    const activities = await Activity.find(filter).populate('city', 'name country');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/activities/:id
exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id).populate('city', 'name country');
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
