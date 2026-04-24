const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// In-memory store as fallback when no DB
const memStore = {};
let memId = 1;

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

// Lazy require so it doesn't crash when mongoose isn't connected
function getUser() {
  return require('../models/User');
}

// POST /api/user — save user profile
router.post('/', async (req, res) => {
  try {
    const { name, age, location, hasVoterId } = req.body;
    if (!name || age === undefined || !location) {
      return res.status(400).json({ error: 'name, age, and location are required.' });
    }

    let user;
    if (isDbConnected()) {
      user = new (getUser())({ name, age, location, hasVoterId: !!hasVoterId });
      await user.save();
    } else {
      user = { _id: String(memId++), name, age, location, hasVoterId: !!hasVoterId, createdAt: new Date() };
      memStore[user._id] = user;
    }

    // Build personalised recommendation
    const recommendation = buildRecommendation(user);
    res.status(201).json({ user, recommendation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user/:id — fetch user profile
router.get('/:id', async (req, res) => {
  try {
    let user;
    if (isDbConnected()) {
      user = await getUser().findById(req.params.id);
    } else {
      user = memStore[req.params.id];
    }
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const recommendation = buildRecommendation(user);
    res.json({ user, recommendation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function buildRecommendation(user) {
  if (user.age < 18) {
    return `Hi ${user.name}! You need to be 18 years old to vote. Check back when you're eligible!`;
  }
  if (!user.hasVoterId) {
    return `Hi ${user.name}! You need to register to vote and obtain your Voter ID first. Start with Step 1 in the Election Process module.`;
  }
  return `Hi ${user.name}! Great news — you already have a Voter ID. Make sure you check the Timeline for upcoming election dates in ${user.location}.`;
}

module.exports = router;
