const jwt = require('jsonwebtoken');

// Verify JWT token from Authorization header
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No valid token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'siddharth-bus-jwt-secret-2026-nashik-secure';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded; // { role, phone, parentName } or { role, name }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
};

module.exports = authMiddleware;
