const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const ChecklistItem = require('../models/ChecklistItem');
const Note = require('../models/Note');

// GET /api/trips
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/trips
exports.createTrip = async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, user: req.user._id });
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/trips/:id
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/trips/:id
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/trips/:id
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    // Clean up related data
    await Itinerary.deleteMany({ trip: trip._id });
    await ChecklistItem.deleteMany({ trip: trip._id });
    await Note.deleteMany({ trip: trip._id });
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/trips/public
exports.getPublicTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ isPublic: true })
      .populate('user', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/trips/public/:id
exports.getPublicTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, isPublic: true }).populate('user', 'firstName lastName profilePhoto');
    if (!trip) return res.status(404).json({ message: 'Trip not found or not public' });
    const itinerary = await Itinerary.findOne({ trip: trip._id });
    res.json({ trip, itinerary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/trips/:id/toggle-public
exports.togglePublic = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user._id });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    trip.isPublic = !trip.isPublic;
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/trips/:id/copy
exports.copyTrip = async (req, res) => {
  try {
    const originalTrip = await Trip.findOne({ _id: req.params.id, isPublic: true });
    if (!originalTrip) return res.status(404).json({ message: 'Trip not found or not public' });

    // 1. Copy Trip
    const newTrip = new Trip({
      user: req.user._id,
      title: `Copy of ${originalTrip.title}`,
      description: originalTrip.description,
      coverPhoto: originalTrip.coverPhoto,
      startDate: originalTrip.startDate,
      endDate: originalTrip.endDate,
      destinations: originalTrip.destinations,
      status: 'upcoming',
      isPublic: false,
      totalBudget: originalTrip.totalBudget,
    });
    await newTrip.save();

    // 2. Copy Itinerary
    const originalItinerary = await Itinerary.findOne({ trip: originalTrip._id });
    if (originalItinerary) {
      const sections = originalItinerary.sections.map(section => ({
        title: section.title,
        description: section.description,
        dateRange: section.dateRange,
        budget: section.budget,
        activities: section.activities.map(act => ({
          name: act.name,
          type: act.type,
          date: act.date,
          time: act.time,
          cost: act.cost,
          notes: act.notes,
        })),
      }));

      await Itinerary.create({ trip: newTrip._id, sections });
    }

    // 3. Copy Checklist Items
    const originalChecklists = await ChecklistItem.find({ trip: originalTrip._id });
    if (originalChecklists.length > 0) {
      const newChecklists = originalChecklists.map(item => ({
        trip: newTrip._id,
        user: req.user._id,
        label: item.label,
        category: item.category,
        isPacked: false, // Reset packed status
      }));
      await ChecklistItem.insertMany(newChecklists);
    }

    res.status(201).json(newTrip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/trips/:id/like
exports.toggleTripLike = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const userId = req.user._id;
    const isLiked = trip.likes.includes(userId);

    if (isLiked) {
      trip.likes = trip.likes.filter(id => id.toString() !== userId.toString());
    } else {
      trip.likes.push(userId);
    }

    await trip.save();
    
    // Return the updated likes array
    res.json({ likes: trip.likes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
