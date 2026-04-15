const logAttack = require("../Utils/logger");
const { collectRequestData, getClientIp } = require("../Utils/requestUtils");

module.exports = (req, res, next) => {
  const data = collectRequestData(req);

  const patterns = [
    /\.\.\//i,
    /\.\.\\/i,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,
    /\/etc\/passwd/i,
    /boot\.ini/i
  ];

  for (const pattern of patterns) {
    if (pattern.test(data)) {
      logAttack({
        time: new Date().toLocaleString(),
        ip: getClientIp(req),
        method: req.method,
        url: req.originalUrl,
        attack: "Path Traversal",
        payload: data,
        severity: "High"
      });

      return res.status(403).json({
        error: "Blocked by WAF",
        type: "Path Traversal",
      });
    }
  }

  next();
};