const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  day: { type: String, default: '' },
  stop: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
