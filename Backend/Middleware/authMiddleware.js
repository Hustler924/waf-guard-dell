module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ error: "Invalid authorization format." });
  }

  const token = parts[1];

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }

  next();
};