const express = require('express');
const router = express.Router();

const TIMELINE_EVENTS = [
  {
    id: 1,
    title: 'Voter Registration Opens',
    date: 'January 15, 2026',
    description:
      'Registration portals open for all eligible voters. Online, mail, and in-person registration options are available. Check your state\'s specific deadlines.',
    status: 'completed',
    order: 1,
    category: 'registration',
  },
  {
    id: 2,
    title: 'Voter Registration Deadline',
    date: 'April 30, 2026',
    description:
      'Last day to register to vote in the upcoming election. Some states allow same-day registration — verify your state\'s rules.',
    status: 'active',
    order: 2,
    category: 'registration',
  },
  {
    id: 3,
    title: 'Early Voting Begins',
    date: 'May 10, 2026',
    description:
      'Early voting locations open across the country. Cast your ballot before Election Day to avoid long lines.',
    status: 'upcoming',
    order: 3,
    category: 'voting',
  },
  {
    id: 4,
    title: 'Mail-In Ballot Request Deadline',
    date: 'May 15, 2026',
    description:
      'Deadline to request an absentee or mail-in ballot. Requests submitted after this date may not be processed in time.',
    status: 'upcoming',
    order: 4,
    category: 'registration',
  },
  {
    id: 5,
    title: 'Election Day — Voting Day',
    date: 'May 20, 2026',
    description:
      'The primary Election Day. Polls are open from 7:00 AM to 8:00 PM in most locations. Bring your voter ID and know your polling place.',
    status: 'upcoming',
    order: 5,
    category: 'voting',
  },
  {
    id: 6,
    title: 'Official Results Announced',
    date: 'May 27, 2026',
    description:
      'Preliminary and then certified results are released by official election authorities. Final certification may take several days.',
    status: 'upcoming',
    order: 6,
    category: 'results',
  },
];

// GET /api/timeline
router.get('/', (req, res) => {
  const { status } = req.query;
  let events = [...TIMELINE_EVENTS];
  if (status) {
    events = events.filter(e => e.status === status);
  }
  res.json({ events });
});

module.exports = router;
