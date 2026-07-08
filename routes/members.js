const express = require('express');
const router = express.Router();
const { getAllMembers, getMemberById, registerMember, getMemberStats } = require('../controllers/memberController');
const { memberValidation } = require('../middleware/validation');
const upload = require('../middleware/upload');

// GET /api/members          - Get all active members (supports ?leadership=true&role=X)
router.get('/', getAllMembers);

// GET /api/members/stats    - Get member count stats
router.get('/stats', getMemberStats);

// GET /api/members/:id      - Get single member
router.get('/:id', getMemberById);

// POST /api/members/register - Register new member (membership form)
router.post('/register', upload.single('photo'), memberValidation, registerMember);

module.exports = router;
