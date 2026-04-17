const logAttack = require("../Utils/logger");
const { collectRequestData, getClientIp } = require("../Utils/requestUtils");

module.exports = (req, res, next) => {
  const data = collectRequestData(req);

  const patterns = [
    /;\s*\w+/i,
    /\|\s*\w+/i,
    /&&\s*\w+/i,
    /`.*?`/i,
    /\$\((.*?)\)/i,
    /\bwhoami\b/i,
    /\bls\b/i,
    /\bcat\s+\/etc\/passwd\b/i,
    /\bpwd\b/i,
    /\buname\b/i
  ];

  for (const pattern of patterns) {
    if (pattern.test(data)) {
      logAttack({
        time: new Date().toLocaleString(),
        ip: getClientIp(req),
        method: req.method,
        url: req.originalUrl,
        attack: "Command Injection",
        payload: data,
        severity: "Critical"
      });

      return res.status(403).json({
        error: "Blocked by WAF",
        type: "Command Injection"
      });
    }
  }

  next();
};