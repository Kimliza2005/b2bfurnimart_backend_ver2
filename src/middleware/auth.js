// middleware/auth.js
const jwt = require('jsonwebtoken');

function attachUser(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // e.g., { id, role, email, ... }
  } catch (e) {
    req.user = null;
  }
  return next();
}

module.exports = attachUser; // <-- default export (a function)
