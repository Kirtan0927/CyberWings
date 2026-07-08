const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventStats,
} = require('../controllers/eventController');
const { eventValidation } = require('../middleware/validation');
const upload = require('../middleware/upload');

// GET /api/events           - Get all events (supports ?category=workshops&status=upcoming&featured=true)
router.get('/', getAllEvents);

// GET /api/events/stats     - Get event stats for homepage
router.get('/stats', getEventStats);

// GET /api/events/:id       - Get single event
router.get('/:id', getEventById);

// POST /api/events          - Create new event (admin)
router.post('/', upload.single('image'), eventValidation, createEvent);

// PUT /api/events/:id       - Update event (admin)
router.put('/:id', eventValidation, updateEvent);

// DELETE /api/events/:id    - Delete event (admin)
router.delete('/:id', deleteEvent);

module.exports = router;
