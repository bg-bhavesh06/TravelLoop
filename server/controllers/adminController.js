const User = require('../models/User');
const Trip = require('../models/Trip');
const City = require('../models/City');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const publicTrips = await Trip.countDocuments({ isPublic: true });

    // Most popular city
    const topCity = await Trip.aggregate([
      { $unwind: '$destinations' },
      { $group: { _id: '$destinations', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    // Trips by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const tripsByMonth = await Trip.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Top cities by trip count
    const topCities = await Trip.aggregate([
      { $unwind: '$destinations' },
      { $group: { _id: '$destinations', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalUsers,
      totalTrips,
      publicTrips,
      popularCity: topCity[0]?._id || 'N/A',
      tripsByMonth,
      topCities,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Trip.deleteMany({ user: req.params.id });
    res.json({ message: 'User and their data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/trips
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate('user', 'firstName lastName email').sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
