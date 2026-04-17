const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const logAttack = require("./Utils/logger");

const interceptor = require("./Middleware/Interceptor");
const sqlFilter = require("./Middleware/sqlFilter");
const xssFilter = require("./Middleware/xssFilter");
const pathGuard = require("./Middleware/pathGuard");
const authMiddleware = require("./Middleware/authMiddleware");
const commandInjectionFilter = require("./Middleware/commandInjectionFilter");

const app = express();

const PORT = 3000;
const LOG_FILE = path.join(__dirname, "Utils", "logs.json");

const loginAttempts = {};
const MAX_LOGIN_ATTEMPTS = 3;
const LOCK_TIME_MS = 2 * 60 * 1000; // 2 minutes

// Simple admin config
process.env.ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
process.env.ADMIN_TOKEN = process.env.ADMIN_TOKEN || "securetoken123";

app.use(cors());
app.use(express.json());

// Request logging
app.use(interceptor);

// Security filters
app.use(xssFilter);
app.use(sqlFilter);
app.use(pathGuard);
app.use(commandInjectionFilter);

// Public health route
app.get("/", (req, res) => {
  res.send("WAF Guard Running...");
});

// Public test route
app.post("/simulate", (req, res) => {
  const { type, payload } = req.body;

  return res.json({
    success: true,
    message: "Simulation request processed by WAF test endpoint",
    simulationType: type || "Unknown",
    receivedPayload: payload || req.body,
    timestamp: new Date().toLocaleString()
  });
});


app.delete("/clear-logs", authMiddleware, (req, res) => {
  try {
    fs.writeFileSync(LOG_FILE, "[]");
    res.json({ message: "Logs cleared successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear logs" });
  }
});

// Real backend login
app.post("/login-admin", (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const currentTime = Date.now();

  if (!loginAttempts[ip]) {
    loginAttempts[ip] = {
      count: 0,
      lockUntil: null
    };
  }

  const attemptData = loginAttempts[ip];

  if (attemptData.lockUntil && currentTime < attemptData.lockUntil) {
    const remainingSeconds = Math.ceil((attemptData.lockUntil - currentTime) / 1000);

    logAttack({
  time: new Date().toLocaleString(),
  ip,
  method: req.method,
  url: req.originalUrl,
  attack: "Blocked Admin Login Attempt",
  payload: JSON.stringify({ username,
     passwordLength: password ? password.length : 0
   }),
  severity: "High"
});

    return res.status(429).json({
      success: false,
      error: `Too many failed attempts. Try again in ${remainingSeconds} seconds.`
    });
  }

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    loginAttempts[ip] = {
      count: 0,
      lockUntil: null
    };

    return res.json({
      success: true,
      token: process.env.ADMIN_TOKEN,
      message: "Admin login successful"
    });
  }

  attemptData.count += 1;

  if (attemptData.count >= MAX_LOGIN_ATTEMPTS) {
    attemptData.lockUntil = currentTime + LOCK_TIME_MS;
    attemptData.count = 0;

    logAttack({
  time: new Date().toLocaleString(),
  ip,
  method: req.method,
  url: req.originalUrl,
  attack: "Brute Force Lockout",
  payload: JSON.stringify({ username }),
  severity: "High"
});

    return res.status(429).json({
      success: false,
      error: "Too many failed attempts. You are temporarily blocked for 2 minutes."
    });
  }
  logAttack({
  time: new Date().toLocaleString(),
  ip,
  method: req.method,
  url: req.originalUrl,
  attack: "Failed Admin Login",
  payload: JSON.stringify({ username }),
  severity: "Medium"
});

  return res.status(401).json({
    success: false,
    error: `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - attemptData.count} attempt(s) remaining.`
  });
});

// Protected logs route
app.get("/logs", authMiddleware, (req, res) => {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, "[]");
    }

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
    const sortedLogs = logs.slice().reverse();

    res.json(sortedLogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to read logs" });
  }
});

// Protected stats route
app.get("/stats", authMiddleware, (req, res) => {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, "[]");
    }

    const logs = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));

   const stats = {
  total: logs.length,
  sql: logs.filter((log) => log.attack === "SQL Injection").length,
  xss: logs.filter((log) => log.attack === "XSS").length,
  path: logs.filter((log) => log.attack === "Path Traversal").length,
  command: logs.filter((log) => log.attack === "Command Injection").length,
  failedLogins: logs.filter(
    (log) =>
      log.attack === "Failed Admin Login" ||
      log.attack === "Brute Force Lockout" ||
      log.attack === "Blocked Admin Login Attempt"
  ).length
};

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate stats" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});