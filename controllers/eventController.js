const db = require('../config/db');

// GET all events (optional filter by category/status)
const getAllEvents = async (req, res) => {
  try {
    const { category, status, featured, limit = 20, offset = 0 } = req.query;
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];

    if (category) { query += ' AND category = ?'; params.push(category); }
    if (status)   { query += ' AND status = ?';   params.push(status); }
    if (featured === 'true') { query += ' AND is_featured = 1'; }

    query += ' ORDER BY event_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);

    // Attach gallery photos for completed events
    for (const ev of rows) {
      if (ev.status === 'completed') {
        const [photos] = await db.query(
          'SELECT id, photo, caption FROM event_photos WHERE event_id = ? ORDER BY sort_order ASC, created_at ASC',
          [ev.id]
        );
        ev.photos = photos;
      } else {
        ev.photos = [];
      }
    }

    res.json({ success: true, count: rows.length, events: rows });
  } catch (err) {
    console.error('getAllEvents error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
};

// GET single event
const getEventById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
    const ev = rows[0];
    if (ev.status === 'completed') {
      const [photos] = await db.query(
        'SELECT id, photo, caption FROM event_photos WHERE event_id = ? ORDER BY sort_order ASC, created_at ASC',
        [ev.id]
      );
      ev.photos = photos;
    } else {
      ev.photos = [];
    }
    res.json({ success: true, event: ev });
  } catch (err) {
    console.error('getEventById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch event.' });
  }
};

// POST create new event (admin use)
const createEvent = async (req, res) => {
  try {
    const { title, category, description, location, event_date, is_featured, status } = req.body;
    const image = req.file ? `/images/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO events (title, category, description, location, event_date, image, is_featured, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category || 'other', description || null, location || null, event_date, image, is_featured ? 1 : 0, status || 'upcoming']
    );

    res.status(201).json({ success: true, message: 'Event created successfully.', event_id: result.insertId });
  } catch (err) {
    console.error('createEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  }
};

// PUT update event
const updateEvent = async (req, res) => {
  try {
    const { title, category, description, location, event_date, is_featured, status } = req.body;
    const [result] = await db.query(
      `UPDATE events SET title=?, category=?, description=?, location=?, event_date=?, is_featured=?, status=? WHERE id=?`,
      [title, category, description, location, event_date, is_featured ? 1 : 0, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, message: 'Event updated successfully.' });
  } catch (err) {
    console.error('updateEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  }
};

// DELETE event
const deleteEvent = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Event not found.' });
    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) {
    console.error('deleteEvent error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
};

// GET event stats for homepage
const getEventStats = async (req, res) => {
  try {
    const [[{ total }]]     = await db.query('SELECT COUNT(*) as total FROM events');
    const [[{ upcoming }]]  = await db.query('SELECT COUNT(*) as upcoming FROM events WHERE status = "upcoming"');
    const [[{ completed }]] = await db.query('SELECT COUNT(*) as completed FROM events WHERE status = "completed"');
    res.json({ success: true, stats: { total_events: total, upcoming, completed } });
  } catch (err) {
    console.error('getEventStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch event stats.' });
  }
};

module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent, getEventStats };
