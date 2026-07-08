const db = require('../config/db');

// POST - submit contact message
const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    await db.query(
      'INSERT INTO contact_messages (name, email, subject, message, ip_address) VALUES (?, ?, ?, ?, ?)',
      [name, email, subject || null, message, ip]
    );

    res.status(201).json({
      success: true,
      message: "✅ Thank you! We've received your message and will get back to you soon.",
    });
  } catch (err) {
    console.error('submitContact error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
};

// GET all contact messages (admin use)
const getAllMessages = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json({ success: true, count: rows.length, messages: rows });
  } catch (err) {
    console.error('getAllMessages error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
};

// PATCH - mark message as read
const markAsRead = async (req, res) => {
  try {
    await db.query('UPDATE contact_messages SET is_read = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update.' });
  }
};

module.exports = { submitContact, getAllMessages, markAsRead };
