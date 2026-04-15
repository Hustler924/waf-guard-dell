const logAttack = require("../Utils/logger");
module.exports = (req, res, next) => {
    const data = JSON.stringify(req.body) + req.url;

   const patterns = [
    /('|--|#)/i,
    /(or\s+1=1)/i,
    /(union\s+select)/i
];

    for (let pattern of patterns) {
      if (pattern.test(data)) {
    console.log("🚨 SQL Injection Detected!");
    console.log("Blocked Payload:", data); // 👈 BONUS

    logAttack({
      time: new Date().toLocaleString(),
        ip: req.ip,
        method: req.method,
        url: req.url,
        attack: "SQL Injection",
        payload: data
    });

    return res.status(403).json({
        error: "Blocked by WAF (SQL Injection)"
    });
}
    }

    next();
};