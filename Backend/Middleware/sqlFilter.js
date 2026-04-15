const logAttack = require("../Utils/logger");
const { collectRequestData, getClientIp } = require("../Utils/requestUtils");

module.exports = (req, res, next) => {
  const data = collectRequestData(req);

  const patterns = [
    /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/i,
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+\w+\s+set/i,
    /--/i
  ];

  for (const pattern of patterns) {
    if (pattern.test(data)) {
      logAttack({
        time: new Date().toLocaleString(),
        ip: getClientIp(req),
        method: req.method,
        url: req.originalUrl,
        attack: "SQL Injection",
        payload: data,
        severity: "Critical"
      });

      return res.status(403).json({
        error: "Blocked by WAF",
        type: "SQL Injection",
      });
    }
  }

  next();
};