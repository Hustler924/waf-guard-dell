const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "logs.json");

function shortenPayload(payload, maxLength = 180) {
  const text = typeof payload === "string" ? payload : JSON.stringify(payload);
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function logAttack(entry) {
  let logs = [];

  if (fs.existsSync(logFile)) {
    try {
      logs = JSON.parse(fs.readFileSync(logFile, "utf-8"));
      if (!Array.isArray(logs)) logs = [];
    } catch (err) {
      logs = [];
    }
  }

  const cleanEntry = {
    id: Date.now(),
    time: entry.time || new Date().toLocaleString(),
    ip: entry.ip || "Unknown",
    method: entry.method || "Unknown",
    url: entry.url || "Unknown",
    attack: entry.attack || "Unknown",
    payload: shortenPayload(entry.payload || ""),
    severity: entry.severity || "High"
  };

  logs.push(cleanEntry);

  if (logs.length > 200) {
    logs = logs.slice(-200);
  }

  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
}

module.exports = logAttack;