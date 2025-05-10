// middleware/auth.js
exports.isAdmin = (req, res, next) => {
    if (req.session.user.userType === 'admin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Admin access required' });
    }
  };