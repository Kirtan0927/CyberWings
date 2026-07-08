const bcrypt = require('bcrypt');
const db = require('../config/db');

// ── Auth ──────────────────────────────────────────────────────────────────────

const login = async (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'CyberWings@2024';

  if (username === adminUser && password === adminPass) {
    req.session.isAdmin = true;
    req.session.adminUser = username;
    return res.json({ success: true, message: 'Login successful.' });
  }
  res.status(401).json({ success: false, message: 'Invalid username or password.' });
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: 'Logged out.' });
  });
};

const checkSession = (req, res) => {
  res.json({ success: true, isAdmin: req.session?.isAdmin === true });
};

// ── Dashboard Stats ───────────────────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
  try {
    const [[{ totalMembers }]]       = await db.query('SELECT COUNT(*) AS totalMembers FROM members WHERE status = "active"');
    const [[{ totalEvents }]]        = await db.query('SELECT COUNT(*) AS totalEvents FROM events');
    const [[{ upcomingEvents }]]     = await db.query('SELECT COUNT(*) AS upcomingEvents FROM events WHERE status = "upcoming"');
    const [[{ unreadMessages }]]     = await db.query('SELECT COUNT(*) AS unreadMessages FROM contact_messages WHERE is_read = 0');
    const [[{ totalSpeakers }]]      = await db.query('SELECT COUNT(*) AS totalSpeakers FROM speaker_applications');
    const [[{ pendingSpeakers }]]    = await db.query('SELECT COUNT(*) AS pendingSpeakers FROM speaker_applications WHERE status = "pending"');
    const [[{ totalRegistrations }]] = await db.query('SELECT COUNT(*) AS totalRegistrations FROM members');
    const [recentMembers]            = await db.query('SELECT fullname, email, role, joined_at FROM members ORDER BY joined_at DESC LIMIT 5');

    res.json({
      success: true,
      stats: { totalMembers, totalEvents, upcomingEvents, unreadMessages, totalSpeakers, pendingSpeakers, totalRegistrations },
      recentMembers,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats.' });
  }
};

// ── Members ───────────────────────────────────────────────────────────────────

const getMembers = async (req, res) => {
  try {
    const { search, status, leadership } = req.query;
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (fullname LIKE ? OR email LIKE ? OR student_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (status)     { query += ' AND status = ?';       params.push(status); }
    if (leadership) { query += ' AND is_leadership = ?'; params.push(leadership === 'true' ? 1 : 0); }

    query += ' ORDER BY joined_at DESC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, count: rows.length, members: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch members.' });
  }
};

// Admin directly creates a member (with optional photo upload)
const createAdminMember = async (req, res) => {
  try {
    const { fullname, email, student_id, academic_year, major, experience, interests, motivation, role, is_leadership, status } = req.body;
    if (!fullname || !email || !student_id || !academic_year || !major) {
      return res.status(400).json({ success: false, message: 'Required fields: fullname, email, student_id, academic_year, major.' });
    }
    const [existing] = await db.query('SELECT id FROM members WHERE email = ? OR student_id = ?', [email, student_id]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A member with this email or student ID already exists.' });
    }
    const photo = req.file ? `/images/uploads/${req.file.filename}` : null;
    const [result] = await db.query(
      `INSERT INTO members (fullname, email, student_id, academic_year, major, experience, interests, motivation, role, is_leadership, status, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullname, email, student_id, academic_year, major,
       experience || 'Beginner', interests || null, motivation || null,
       role || 'Member', is_leadership ? 1 : 0, status || 'active', photo]
    );
    res.status(201).json({ success: true, message: 'Member added successfully.', member_id: result.insertId });
  } catch (err) {
    console.error('createAdminMember error:', err);
    res.status(500).json({ success: false, message: 'Failed to add member.' });
  }
};

const updateMember = async (req, res) => {
  try {
    const { fullname, email, role, is_leadership, status, academic_year, major, experience } = req.body;
    await db.query(
      'UPDATE members SET fullname=?, email=?, role=?, is_leadership=?, status=?, academic_year=?, major=?, experience=? WHERE id=?',
      [fullname, email, role, is_leadership ? 1 : 0, status, academic_year, major, experience, req.params.id]
    );
    res.json({ success: true, message: 'Member updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update member.' });
  }
};

const deleteMember = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM members WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, message: 'Member deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete member.' });
  }
};

// ── Events ────────────────────────────────────────────────────────────────────

const getAdminEvents = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_date DESC');
    res.json({ success: true, count: rows.length, events: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
};

const createAdminEvent = async (req, res) => {
  try {
    const { title, category, description, location, event_date, is_featured, status } = req.body;
    const image = req.file ? `/images/uploads/${req.file.filename}` : null;
    const [result] = await db.query(
      'INSERT INTO events (title, category, description, location, event_date, image, is_featured, status) VALUES (?,?,?,?,?,?,?,?)',
      [title, category || 'other', description || null, location || null, event_date, image, is_featured ? 1 : 0, status || 'upcoming']
    );
    res.status(201).json({ success: true, message: 'Event created.', event_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
};

const updateAdminEvent = async (req, res) => {
  try {
    const { title, category, description, location, event_date, is_featured, status } = req.body;
    if (req.file) {
      // New image uploaded — update image too
      const image = `/images/uploads/${req.file.filename}`;
      await db.query(
        'UPDATE events SET title=?, category=?, description=?, location=?, event_date=?, is_featured=?, status=?, image=? WHERE id=?',
        [title, category, description, location, event_date, is_featured ? 1 : 0, status, image, req.params.id]
      );
    } else {
      // No new image — keep existing image unchanged
      await db.query(
        'UPDATE events SET title=?, category=?, description=?, location=?, event_date=?, is_featured=?, status=? WHERE id=?',
        [title, category, description, location, event_date, is_featured ? 1 : 0, status, req.params.id]
      );
    }
    res.json({ success: true, message: 'Event updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
};

const deleteAdminEvent = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
};

// ── Contact Messages ──────────────────────────────────────────────────────────

const getAdminMessages = async (req, res) => {
  try {
    const { is_read } = req.query;
    let query = 'SELECT * FROM contact_messages';
    const params = [];
    if (is_read !== undefined) { query += ' WHERE is_read = ?'; params.push(is_read === 'true' ? 1 : 0); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, count: rows.length, messages: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

const markMessageRead = async (req, res) => {
  try {
    await db.query('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update.' });
  }
};

const deleteMessage = async (req, res) => {
  try {
    await db.query('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
};

// ── Speaker Applications ──────────────────────────────────────────────────────

const getAdminSpeakers = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM speaker_applications';
    const params = [];
    if (status) { query += ' WHERE status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, count: rows.length, applications: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch applications.' });
  }
};

const updateSpeakerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }
    await db.query('UPDATE speaker_applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Application ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update.' });
  }
};

const deleteSpeaker = async (req, res) => {
  try {
    await db.query('DELETE FROM speaker_applications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Application deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete.' });
  }
};
// ── Registrations (Membership Form Submissions) ────────────────────────────────
// Shows all members who registered via the membership form, with full form data.
const getRegistrations = async (req, res) => {
  try {
    const { academic_year, experience, search } = req.query;
    let query = `SELECT id, fullname, email, student_id, academic_year, major,
                        experience, interests, motivation, role, is_leadership,
                        status, photo, joined_at
                 FROM members WHERE 1=1`;
    const params = [];

    if (academic_year) { query += ' AND academic_year = ?'; params.push(academic_year); }
    if (experience)    { query += ' AND experience = ?';    params.push(experience); }
    if (search) {
      query += ' AND (fullname LIKE ? OR email LIKE ? OR student_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    query += ' ORDER BY joined_at DESC';

    const [rows] = await db.query(query, params);
    res.json({ success: true, count: rows.length, registrations: rows });
  } catch (err) {
    console.error('getRegistrations error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations.' });
  }
};

// ── Event Gallery Photos ──────────────────────────────────────────────────────

// GET all photos for an event
const getEventPhotos = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM event_photos WHERE event_id = ? ORDER BY sort_order ASC, created_at ASC',
      [req.params.id]
    );
    res.json({ success: true, photos: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch photos.' });
  }
};

// POST upload multiple photos for a completed event
const addEventPhotos = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No photos uploaded.' });
    }
    const eventId = req.params.id;
    // Verify event exists and is completed
    const [evRows] = await db.query('SELECT status FROM events WHERE id = ?', [eventId]);
    if (evRows.length === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (evRows[0].status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Gallery photos can only be added to completed events.' });
    }
    // Get current max sort_order
    const [[{ maxOrder }]] = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM event_photos WHERE event_id = ?',
      [eventId]
    );
    const inserts = req.files.map((file, i) => [
      eventId,
      `/images/uploads/${file.filename}`,
      null,
      maxOrder + 1 + i,
    ]);
    await db.query(
      'INSERT INTO event_photos (event_id, photo, caption, sort_order) VALUES ?',
      [inserts]
    );
    // Also update the main event image to the first uploaded photo if none set
    const [[ev]] = await db.query('SELECT image FROM events WHERE id = ?', [eventId]);
    if (!ev.image) {
      await db.query('UPDATE events SET image = ? WHERE id = ?', [`/images/uploads/${req.files[0].filename}`, eventId]);
    }
    res.status(201).json({ success: true, message: `${req.files.length} photo(s) added.`, count: req.files.length });
  } catch (err) {
    console.error('addEventPhotos error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload photos.' });
  }
};

// DELETE a single gallery photo
const deleteEventPhoto = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM event_photos WHERE id = ? AND event_id = ?', [req.params.photoId, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Photo not found.' });
    res.json({ success: true, message: 'Photo deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete photo.' });
  }
};

module.exports = {
  login, logout, checkSession,
  getDashboardStats,
  getMembers, createAdminMember, updateMember, deleteMember,
  getAdminEvents, createAdminEvent, updateAdminEvent, deleteAdminEvent,
  getAdminMessages, markMessageRead, deleteMessage,
  getAdminSpeakers, updateSpeakerStatus, deleteSpeaker,
  getRegistrations,
  getEventPhotos, addEventPhotos, deleteEventPhoto,
};



