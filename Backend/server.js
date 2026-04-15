const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const interceptor = require("./Middleware/Interceptor");
const sqlFilter = require("./Middleware/sqlFilter");
const xssFilter = require("./Middleware/xssFilter");
const pathGuard = require("./Middleware/pathGuard");
const authMiddleware = require("./Middleware/authMiddleware");

const app = express();

const PORT = 3000;
const LOG_FILE = path.join(__dirname, "Utils", "logs.json");

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

// Real backend login
app.post("/login-admin", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      success: true,
      token: process.env.ADMIN_TOKEN,
      message: "Admin login successful",
    });
  }

  return res.status(401).json({
    success: false,
    error: "Invalid credentials",
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
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate stats" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});