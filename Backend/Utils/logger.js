const fs = require("fs");
const path = require("path");

// Create path to logs.json
const logFile = path.join(__dirname, "logs.json");

// If file doesn't exist → create it
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, "[]");
}

// Function to add log
function logAttack(entry) {
    // Read existing logs
    const logs = JSON.parse(fs.readFileSync(logFile));

    // Add new log
    logs.push(entry);

       // ✅ THEN limit size
    if (logs.length > 200) {
        logs.shift(); // remove oldest
    }

    // Save back to file
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    
}

module.exports = logAttack;