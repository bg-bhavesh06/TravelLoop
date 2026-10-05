const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['sightseeing', 'food', 'adventure', 'culture', 'relaxation'], required: true },
  description: { type: String, default: '' },
  images: [String],
  averageCost: { type: Number, default: 0 },
  duration: { type: Number, default: 1 }, // in hours
  rating: { type: Number, min: 0, max: 5, default: 4 },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
