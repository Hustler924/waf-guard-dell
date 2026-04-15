const logAttack = require("../Utils/logger");
const { collectRequestData, getClientIp } = require("../Utils/requestUtils");

module.exports = (req, res, next) => {
  const data = collectRequestData(req);

  const patterns = [
    /<script.*?>.*?<\/script>/i,
    /javascript:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /<iframe/i,
    /<img/i
  ];

  for (const pattern of patterns) {
    if (pattern.test(data)) {
      logAttack({
        time: new Date().toLocaleString(),
        ip: getClientIp(req),
        method: req.method,
        url: req.originalUrl,
        attack: "XSS",
        payload: data,
        severity: "High"
      });

      return res.status(403).json({
        error: "Blocked by WAF",
        type: "XSS",
      });
    }
  }

  next();
};