const mongoose = require('mongoose');

const processStepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  whatYouShouldDo: { type: String, required: true },
  actions: [{ type: String }],
  icon: { type: String, default: 'circle' },
});

module.exports = mongoose.model('ProcessStep', processStepSchema);
