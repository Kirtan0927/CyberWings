const db = require('../config/db');

// POST - submit speaker application
const submitSpeakerApplication = async (req, res) => {
  try {
    const { fullname, email, organization, topic, bio, experience, proposed_date } = req.body;

    await db.query(
      `INSERT INTO speaker_applications (fullname, email, organization, topic, bio, experience, proposed_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullname, email, organization || null, topic, bio || null, experience || null, proposed_date || null]
    );

    res.status(201).json({
      success: true,
      message: "✅ Thank you for your application! We'll review it and get back to you shortly.",
    });
  } catch (err) {
    console.error('submitSpeakerApplication error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit application. Please try again.' });
  }
};

// GET all speaker applications (admin)
const getAllApplications = async (req, res) => {
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

// PATCH - update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }
    await db.query('UPDATE speaker_applications SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true, message: `Application ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
};

module.exports = { submitSpeakerApplication, getAllApplications, updateApplicationStatus };
