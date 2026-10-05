const Note = require('../models/Note');

// GET /api/notes/trip/:tripId
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ trip: req.params.tripId, user: req.user._id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/notes/trip/:tripId
exports.addNote = async (req, res) => {
  try {
    const note = await Note.create({
      ...req.body,
      trip: req.params.tripId,
      user: req.user._id,
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/notes/:noteId
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/notes/:noteId
exports.deleteNote = async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.noteId, user: req.user._id });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
