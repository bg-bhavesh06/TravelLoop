const ChecklistItem = require('../models/ChecklistItem');

// GET /api/checklists/trip/:tripId
exports.getChecklist = async (req, res) => {
  try {
    const items = await ChecklistItem.find({ trip: req.params.tripId, user: req.user._id }).sort({ category: 1, createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/checklists/trip/:tripId
exports.addItem = async (req, res) => {
  try {
    const item = await ChecklistItem.create({
      ...req.body,
      trip: req.params.tripId,
      user: req.user._id,
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/checklists/:itemId
exports.toggleItem = async (req, res) => {
  try {
    const item = await ChecklistItem.findOne({ _id: req.params.itemId, user: req.user._id });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (req.body.label !== undefined) item.label = req.body.label;
    if (req.body.isPacked !== undefined) item.isPacked = req.body.isPacked;
    else item.isPacked = !item.isPacked;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/checklists/:itemId
exports.deleteItem = async (req, res) => {
  try {
    await ChecklistItem.findOneAndDelete({ _id: req.params.itemId, user: req.user._id });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/checklists/trip/:tripId/reset
exports.resetChecklist = async (req, res) => {
  try {
    await ChecklistItem.updateMany({ trip: req.params.tripId, user: req.user._id }, { isPacked: false });
    const items = await ChecklistItem.find({ trip: req.params.tripId, user: req.user._id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
