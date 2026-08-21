const express = require('express');
const School = require('../models/School');

const router = express.Router();

// ─── GET /api/schools ───
// Public: List all partner schools
router.get('/', async (req, res) => {
  try {
    const schools = await School.find().lean();
    const result = schools.map(s => ({ ...s, id: s._id.toString() }));
    res.json(result);
  } catch (error) {
    console.error('Get schools error:', error);
    res.status(500).json({ error: 'Failed to fetch schools.' });
  }
});

module.exports = router;
