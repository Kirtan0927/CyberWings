const db = require('../config/db');

// GET all active members (optionally filter leadership)
const getAllMembers = async (req, res) => {
  try {
    const { leadership, role, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT id, fullname, email, student_id, academic_year, major, experience, interests, role, is_leadership, photo, joined_at FROM members WHERE status = "active"';
    const params = [];

    if (leadership === 'true') {
      query += ' AND is_leadership = 1';
    }
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY is_leadership DESC, joined_at ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await db.query(query, params);
    res.json({ success: true, count: rows.length, members: rows });
  } catch (err) {
    console.error('getAllMembers error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch members.' });
  }
};

// GET single member by ID
const getMemberById = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, fullname, email, student_id, academic_year, major, experience, interests, role, is_leadership, photo, joined_at FROM members WHERE id = ? AND status = "active"',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Member not found.' });
    res.json({ success: true, member: rows[0] });
  } catch (err) {
    console.error('getMemberById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch member.' });
  }
};

// POST register new member (membership form)
const registerMember = async (req, res) => {
  try {
    const { fullname, email, student_id, academic_year, major, experience, interests, motivation } = req.body;

    // Check for duplicate email or student ID
    const [existing] = await db.query(
      'SELECT id FROM members WHERE email = ? OR student_id = ?',
      [email, student_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'A member with this email or student ID already exists.' });
    }

    const photo = req.file ? `/images/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO members (fullname, email, student_id, academic_year, major, experience, interests, motivation, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fullname, email, student_id, academic_year, major, experience || 'Beginner', interests || null, motivation || null, photo]
    );

    res.status(201).json({
      success: true,
      message: '🎉 Welcome to The Cyber Wings! Your registration was successful.',
      member_id: result.insertId,
    });
  } catch (err) {
    console.error('registerMember error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// GET member count stats for homepage
const getMemberStats = async (req, res) => {
  try {
    const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM members WHERE status = "active"');
    const [[{ leadership }]] = await db.query('SELECT COUNT(*) as leadership FROM members WHERE is_leadership = 1 AND status = "active"');
    res.json({ success: true, stats: { total_members: total, leadership_count: leadership } });
  } catch (err) {
    console.error('getMemberStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

module.exports = { getAllMembers, getMemberById, registerMember, getMemberStats };
