const express = require('express');
const router = express.Router();
const { submitContact, getAllMessages, markAsRead } = require('../controllers/contactController');
const { contactValidation } = require('../middleware/validation');

// POST /api/contact         - Submit contact message
router.post('/', contactValidation, submitContact);

// GET /api/contact          - Get all messages (admin)
router.get('/', getAllMessages);

// PATCH /api/contact/:id/read - Mark message as read (admin)
router.patch('/:id/read', markAsRead);

module.exports = router;
