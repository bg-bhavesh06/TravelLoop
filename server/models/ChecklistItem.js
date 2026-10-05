const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  label: { type: String, required: true, trim: true },
  category: { type: String, enum: ['clothing', 'documents', 'electronics', 'toiletries', 'other'], default: 'other' },
  isPacked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('ChecklistItem', checklistItemSchema);
