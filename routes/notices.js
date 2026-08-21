const express = require('express');
const Notice = require('../models/Notice');
const authMiddleware = require('../middleware/authMiddleware');
const ownerOnly = require('../middleware/ownerOnly');

const router = express.Router();

// ─── GET /api/notices ───
// Public (any authenticated user): Get all notices, newest first
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 }).lean();
    const result = notices.map(n => ({ ...n, id: n._id.toString() }));
    res.json(result);
  } catch (error) {
    console.error('Get notices error:', error);
    res.status(500).json({ error: 'Failed to fetch notices.' });
  }
});

// ─── POST /api/notices ───
// Owner only: Broadcast a new notice
router.post('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const data = req.body;
    const notice = new Notice({
      title: data.title,
      content: data.content,
      target: data.target || 'All Parents',
      type: data.type || 'INFO',
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgent: data.urgent || false,
      sentVia: data.sentVia || ['In-App Broadcast']
    });

    await notice.save();

    const result = notice.toObject();
    result.id = result._id.toString();
    res.status(201).json(result);
  } catch (error) {
    console.error('Broadcast notice error:', error);
    res.status(500).json({ error: 'Failed to broadcast notice.' });
  }
});

// ─── DELETE /api/notices/:id ───
// Owner only: Delete a single notice
router.delete('/:id', authMiddleware, ownerOnly, async (req, res) => {
  try {
    const deleted = await Notice.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Notice not found.' });
    }
    res.json({ success: true, message: 'Notice deleted.' });
  } catch (error) {
    console.error('Delete notice error:', error);
    res.status(500).json({ error: 'Failed to delete notice.' });
  }
});

// ─── DELETE /api/notices ───
// Owner only: Clear all notices
router.delete('/', authMiddleware, ownerOnly, async (req, res) => {
  try {
    await Notice.deleteMany({});
    res.json({ success: true, message: 'All notices cleared.' });
  } catch (error) {
    console.error('Clear notices error:', error);
    res.status(500).json({ error: 'Failed to clear notices.' });
  }
});

module.exports = router;
