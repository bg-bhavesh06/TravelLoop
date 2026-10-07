const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');

// GET /api/budget/trip/:tripId
exports.getBudget = async (req, res) => {
  try {
    const [trip, itinerary] = await Promise.all([
      Trip.findById(req.params.tripId),
      Itinerary.findOne({ trip: req.params.tripId }),
    ]);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    let totalSpent = 0;
    const breakdown = {};
    const sections = (itinerary?.sections || []).map(s => {
      let spent = 0;
      (s.activities || []).forEach(a => {
        const cost = Number(a.cost) || 0;
        spent += cost;
        const cat = a.type || 'other';
        breakdown[cat] = (breakdown[cat] || 0) + cost;
      });
      totalSpent += spent;
      return {
        title: s.title,
        budget: s.budget || 0,
        spent,
        overBudget: s.budget > 0 && spent > s.budget,
      };
    });

    const totalBudget = trip.totalBudget > 0 ? trip.totalBudget : totalSpent;

    res.json({
      totalBudget,
      totalSpent,
      remaining: trip.totalBudget > 0 ? Math.max(0, trip.totalBudget - totalSpent) : 0,
      sections,
      breakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
