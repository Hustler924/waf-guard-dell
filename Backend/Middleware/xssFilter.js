const logAttack = require("../Utils/logger");
module.exports = (req, res, next) => {
    const data = JSON.stringify(req.body) + req.url;

    const patterns = [
        /<script.*?>.*?<\/script>/i,     // script tags
        /javascript:/i,                // JS protocol
        /on\w+\s*=/i,                  // onclick=, onerror=
        /<.*?on\w+.*?>/i               // inline JS in tags
    ];

    for (let pattern of patterns) {
       if (pattern.test(data)) {
    console.log("🚨 XSS Attack Detected!");
    console.log("Blocked XSS Payload:", data); // 👈 BONUS

    logAttack({
    time: new Date().toLocaleString(),
    ip: req.ip,
    method: req.method,
    url: req.url,
    attack: "XSS",
    payload: data
});

            return res.status(403).json({
                error: "Blocked by WAF (XSS Attack)"
            });
        }
    }

    next();
};