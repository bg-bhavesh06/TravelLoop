const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');

// GET /api/budget/trip/:tripId
exports.getBudget = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const itinerary = await Itinerary.findOne({ trip: req.params.tripId });
    if (!itinerary) return res.json({ totalBudget: trip.totalBudget, totalSpent: 0, sections: [], breakdown: {} });

    let totalSpent = 0;
    const breakdown = {};
    const sections = itinerary.sections.map(section => {
      let sectionSpent = 0;
      section.activities.forEach(act => {
        sectionSpent += act.cost || 0;
        const cat = act.type || 'other';
        breakdown[cat] = (breakdown[cat] || 0) + (act.cost || 0);
      });
      totalSpent += sectionSpent;
      return {
        title: section.title,
        budget: section.budget,
        spent: sectionSpent,
        overBudget: sectionSpent > section.budget,
      };
    });

    res.json({
      totalBudget: trip.totalBudget,
      totalSpent,
      remaining: trip.totalBudget - totalSpent,
      sections,
      breakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
