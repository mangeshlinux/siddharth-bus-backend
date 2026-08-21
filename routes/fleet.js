const express = require('express');
const Fleet = require('../models/Fleet');

const router = express.Router();

// ─── GET /api/fleet ───
// Public: List all buses with routes and status
router.get('/', async (req, res) => {
  try {
    const fleet = await Fleet.find().lean();
    const result = fleet.map(f => ({ ...f, id: f._id.toString() }));
    res.json(result);
  } catch (error) {
    console.error('Get fleet error:', error);
    res.status(500).json({ error: 'Failed to fetch fleet.' });
  }
});

module.exports = router;
