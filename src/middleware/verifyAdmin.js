const verifyToken = require('../config/jwt');

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super admin')) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Access denied: Admins only' });
    }
  });
};

module.exports = verifyAdmin;
