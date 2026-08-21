// Ensure only OWNER role can access a route
const ownerOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'OWNER') {
    return res.status(403).json({ error: 'Access denied. Owner privileges required.' });
  }
  next();
};

module.exports = ownerOnly;
