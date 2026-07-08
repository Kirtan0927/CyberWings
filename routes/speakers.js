const express = require('express');
const router = express.Router();
const {
  submitSpeakerApplication,
  getAllApplications,
  updateApplicationStatus,
} = require('../controllers/speakerController');
const { speakerValidation } = require('../middleware/validation');

// POST /api/speakers        - Submit speaker application
router.post('/', speakerValidation, submitSpeakerApplication);

// GET /api/speakers         - Get all applications (admin, supports ?status=pending)
router.get('/', getAllApplications);

// PATCH /api/speakers/:id/status - Update application status (admin)
router.patch('/:id/status', updateApplicationStatus);

module.exports = router;
