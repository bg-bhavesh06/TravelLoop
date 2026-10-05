const mongoose = require('mongoose');

const activitySubSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'activity' },
  date: Date,
  time: String,
  cost: { type: Number, default: 0 },
  notes: String,
}, { _id: true });

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  dateRange: {
    start: Date,
    end: Date,
  },
  budget: { type: Number, default: 0 },
  activities: [activitySubSchema],
}, { _id: true });

const itinerarySchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  sections: [sectionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Itinerary', itinerarySchema);
