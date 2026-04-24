const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'completed'], default: 'upcoming' },
  order: { type: Number, default: 0 },
});

module.exports = mongoose.model('Timeline', timelineSchema);
