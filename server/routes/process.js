const express = require('express');
const router = express.Router();

const PROCESS_STEPS = [
  {
    stepNumber: 1,
    title: 'Register to Vote',
    icon: 'user-check',
    description:
      'Voter registration is the first and most important step. You must be registered before you can cast a ballot. Registration deadlines vary by location — some states allow same-day registration, while others require registration weeks in advance.',
    whatYouShouldDo:
      'Check your state\'s registration deadline, gather required documents (ID, proof of address), and complete the registration form online or in person.',
    actions: [
      'Visit your state\'s official election website',
      'Complete the voter registration form',
      'Verify your registration status online',
      'Update your address if you\'ve moved recently',
    ],
  },
  {
    stepNumber: 2,
    title: 'Get Your Voter ID',
    icon: 'id-card',
    description:
      'Many states require voters to present a valid ID at the polls. Accepted forms of ID vary by state. Some states offer free voter IDs to eligible citizens. Check your local requirements well in advance of Election Day.',
    whatYouShouldDo:
      'Find out what forms of ID are accepted in your state and obtain the necessary identification before Election Day.',
    actions: [
      'Check your state\'s ID requirements',
      'Visit your local DMV or election office',
      'Apply for a free state voter ID if eligible',
      'Bring required documents (birth certificate, proof of address)',
    ],
  },
  {
    stepNumber: 3,
    title: 'Campaign Period',
    icon: 'megaphone',
    description:
      'During the campaign period, candidates actively seek your vote. This is your time to research candidates, attend town halls, review policy platforms, and make an informed decision about who you\'ll support.',
    whatYouShouldDo:
      'Research all candidates on your ballot, understand their platforms, and decide who best represents your values and interests.',
    actions: [
      'Review candidate websites and platforms',
      'Watch debates and town hall meetings',
      'Read non-partisan voter guides',
      'Discuss issues with family and community',
      'Fact-check claims using trusted sources',
    ],
  },
  {
    stepNumber: 4,
    title: 'Voting Day',
    icon: 'vote',
    description:
      'Election Day is when your voice counts! Know your polling location, what to bring, and your voting hours. You may also have options to vote early or by mail — check your local election authority for details.',
    whatYouShouldDo:
      'Go to your polling place with your ID, cast your ballot for your chosen candidates, and encourage others to vote.',
    actions: [
      'Confirm your polling place at vote.gov',
      'Bring your ID and any required documents',
      'Allow extra time — lines can be long',
      'Know your rights: you cannot be turned away if in line before closing',
      'Consider early voting or absentee/mail-in options',
    ],
  },
  {
    stepNumber: 5,
    title: 'Results & Certification',
    icon: 'bar-chart',
    description:
      'After polls close, votes are counted and verified. Results may take hours or days to finalize. Official results are then certified by election authorities. This process ensures accuracy and integrity of the election.',
    whatYouShouldDo:
      'Follow credible news sources for results, understand that final certification takes time, and trust the official certification process.',
    actions: [
      'Follow official election authority websites',
      'Wait for official results — not just early projections',
      'Understand that all votes must be counted',
      'Report any suspected irregularities to election officials',
    ],
  },
];

// GET /api/process
router.get('/', (req, res) => {
  res.json({ steps: PROCESS_STEPS });
});

// GET /api/process/:stepNumber
router.get('/:stepNumber', (req, res) => {
  const step = PROCESS_STEPS.find(s => s.stepNumber === parseInt(req.params.stepNumber));
  if (!step) return res.status(404).json({ error: 'Step not found.' });
  res.json(step);
});

module.exports = router;
