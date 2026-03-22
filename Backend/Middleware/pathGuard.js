const logAttack = require("../Utils/logger");
module.exports = (req, res, next) => {
    const data = JSON.stringify(req.body) + req.url;

    const patterns = [
        /\.\.\//g,          // ../
        /\.\.\\/g,          // ..\
        /%2e%2e%2f/i,       // encoded ../
        /%2e%2e%5c/i        // encoded ..\
    ];

    for (let pattern of patterns) {
        if (pattern.test(data)) {
            console.log("🚨 Path Traversal Attempt Detected!");
            console.log("Blocked Payload:", data); // BONUS
            
            logAttack({
   time: new Date().toLocaleString(),
    ip: req.ip,
    method: req.method,
    url: req.url,
    attack: "Path Traversal",
    payload: data
});

            return res.status(403).json({
                error: "Blocked by WAF (Path Traversal)"
            });
        }
    }

    next();
};