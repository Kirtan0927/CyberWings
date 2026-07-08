const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

// ── Auth (no session required) ────────────────────────────────────────────────
router.post('/api/admin/login',   ctrl.login);
router.post('/api/admin/logout',  ctrl.logout);
router.get('/api/admin/session',  ctrl.checkSession);

// ── Serve Admin Login Page ────────────────────────────────────────────────────
router.get('/admin/login', (req, res) => {
  if (req.session?.isAdmin) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

// ── Serve Admin Dashboard (protected) ────────────────────────────────────────
router.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});
router.get('/admin/', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});

// ── Protected API ─────────────────────────────────────────────────────────────
router.get('/api/admin/stats',                requireAdmin, ctrl.getDashboardStats);

// Members
router.get('/api/admin/members',              requireAdmin, ctrl.getMembers);
router.post('/api/admin/members',             requireAdmin, upload.single('photo'), ctrl.createAdminMember);
router.put('/api/admin/members/:id',          requireAdmin, ctrl.updateMember);
router.delete('/api/admin/members/:id',       requireAdmin, ctrl.deleteMember);

// Events
router.get('/api/admin/events',               requireAdmin, ctrl.getAdminEvents);
router.post('/api/admin/events',              requireAdmin, upload.single('image'), ctrl.createAdminEvent);
router.put('/api/admin/events/:id',           requireAdmin, upload.single('image'), ctrl.updateAdminEvent);
router.delete('/api/admin/events/:id',        requireAdmin, ctrl.deleteAdminEvent);

// Event Gallery Photos (completed events only)
router.get('/api/admin/events/:id/photos',        requireAdmin, ctrl.getEventPhotos);
router.post('/api/admin/events/:id/photos',       requireAdmin, upload.array('photos', 20), ctrl.addEventPhotos);
router.delete('/api/admin/events/:id/photos/:photoId', requireAdmin, ctrl.deleteEventPhoto);

// Messages
router.get('/api/admin/messages',             requireAdmin, ctrl.getAdminMessages);
router.patch('/api/admin/messages/:id/read',  requireAdmin, ctrl.markMessageRead);
router.delete('/api/admin/messages/:id',      requireAdmin, ctrl.deleteMessage);

// Speaker Applications
router.get('/api/admin/speakers',             requireAdmin, ctrl.getAdminSpeakers);
router.patch('/api/admin/speakers/:id/status',requireAdmin, ctrl.updateSpeakerStatus);
router.delete('/api/admin/speakers/:id',      requireAdmin, ctrl.deleteSpeaker);

// Registrations (Membership form submissions - all members with full form data)
router.get('/api/admin/registrations', requireAdmin, ctrl.getRegistrations);

module.exports = router;
