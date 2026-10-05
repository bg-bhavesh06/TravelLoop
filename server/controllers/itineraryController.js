const Itinerary = require('../models/Itinerary');

// GET /api/itineraries/trip/:tripId
exports.getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ trip: req.params.tripId });
    if (!itinerary) return res.status(404).json({ message: 'No itinerary found' });
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/itineraries/trip/:tripId
exports.createItinerary = async (req, res) => {
  try {
    let itinerary = await Itinerary.findOne({ trip: req.params.tripId });
    if (itinerary) {
      itinerary.sections = req.body.sections || [];
      await itinerary.save();
      return res.json(itinerary);
    }
    itinerary = await Itinerary.create({ trip: req.params.tripId, sections: req.body.sections || [] });
    res.status(201).json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/itineraries/:id
exports.updateItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/itineraries/:id/sections
exports.addSection = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    itinerary.sections.push(req.body);
    await itinerary.save();
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/itineraries/:id/sections/:sectionId
exports.removeSection = async (req, res) => {
  try {
    const itinerary = await Itinerary.findById(req.params.id);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    itinerary.sections = itinerary.sections.filter(s => s._id.toString() !== req.params.sectionId);
    await itinerary.save();
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
