const mongoose = require('mongoose');

const voterApplicationSchema = new mongoose.Schema({
  userId:             { type: String, required: true, unique: true },
  country:            { type: String, default: 'India' },
  state:              { type: String, default: '' },
  voterIdStatus:      { type: String, enum: ['Not Applied', 'Applied', 'Under Verification', 'Approved'], default: 'Not Applied' },
  referenceId:        { type: String, default: '' },
  documentsUploaded:  { type: Boolean, default: false },
  createdAt:          { type: Date, default: Date.now },
  updatedAt:          { type: Date, default: Date.now },
});

module.exports = mongoose.model('VoterApplication', voterApplicationSchema);
