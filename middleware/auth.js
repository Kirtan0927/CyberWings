// Middleware: require admin session to access protected routes
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin === true) {
    return next();
  }
  // API requests get JSON error
  if (req.path.startsWith('/api/') || req.headers['content-type'] === 'application/json') {
    return res.status(401).json({ success: false, message: 'Unauthorized. Please log in.' });
  }
  // Browser requests get redirect
  res.redirect('/admin/login');
};

module.exports = { requireAdmin };
