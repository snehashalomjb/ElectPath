const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// In-memory fallback store
const memStore = {};

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

function getModel() {
  try { return require('../models/VoterApplication'); } catch { return null; }
}

// POST /api/voter/eligibility-check
router.post('/eligibility-check', (req, res) => {
  const { age, isCitizen, isResident } = req.body;
  if (age === undefined || isCitizen === undefined) {
    return res.status(400).json({ error: 'age and isCitizen are required.' });
  }
  const eligible = parseInt(age) >= 18 && isCitizen === true && isResident !== false;
  let reason = '';
  if (parseInt(age) < 18) reason = `You must be at least 18 years old. You need ${18 - parseInt(age)} more year(s).`;
  else if (!isCitizen) reason = 'Only Indian citizens can apply for a Voter ID (EPIC).';
  else reason = 'You are eligible to apply for a Voter ID!';
  res.json({ eligible, reason });
});

// POST /api/voter/apply-status
router.post('/apply-status', async (req, res) => {
  try {
    const { userId, referenceId, voterIdStatus, documentsUploaded, state } = req.body;
    const data = {
      userId: userId || `guest_${Date.now()}`,
      referenceId: referenceId || '',
      voterIdStatus: voterIdStatus || 'Applied',
      documentsUploaded: !!documentsUploaded,
      country: 'India',
      state: state || '',
      updatedAt: new Date(),
    };

    let record;
    if (isDbConnected() && getModel()) {
      record = await getModel().findOneAndUpdate(
        { userId: data.userId },
        data,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      memStore[data.userId] = data;
      record = data;
    }
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/voter/status?userId=xxx
router.get('/status', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required.' });

    let record;
    if (isDbConnected() && getModel()) {
      record = await getModel().findOne({ userId });
    } else {
      record = memStore[userId] || null;
    }

    if (!record) return res.json({ found: false, voterIdStatus: 'Not Applied' });
    res.json({ found: true, record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
