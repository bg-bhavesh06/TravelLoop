const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  country: { type: String, required: true },
  region: { type: String, default: '' },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  costIndex: { type: Number, min: 1, max: 10, default: 5 },
  popularity: { type: Number, min: 1, max: 10, default: 5 },
  tags: [String],
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);
