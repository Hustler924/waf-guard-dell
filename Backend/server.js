const express = require("express");
const cors = require("cors"); 
const interceptor = require("./Middleware/Interceptor");
const sqlFilter = require("./Middleware/sqlFilter");
const xssFilter = require("./Middleware/xssFilter");
const pathGuard = require("./Middleware/pathGuard");
const fs = require("fs");
const path = require("path");
  


const app = express();
app.use(cors());
app.use(express.json());

app.use(interceptor); // 👈 IMPORTANT
app.use(xssFilter);
app.use(sqlFilter);  
app.use(pathGuard);


//Routes

app.post("/simulate", (req, res) => {
    res.send("Simulation request sent");
});

app.post("/login", (req, res) => {
    res.send("Login endpoint reached");
});

app.get("/", (req, res) => {
    res.send("WAF Guard Running...");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.get("/logs", (req, res) => {
    const logFile = path.join(__dirname, "Utils", "logs.json");

    const logs = JSON.parse(fs.readFileSync(logFile));

     // 🔥 BONUS: show latest logs first
    const sortedLogs = logs.slice().reverse();

//👇 Pretty format
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(logs.reverse(), null, 2));

   // res.json(logs);
});

/*app.get("/stats", (req, res) => {
    const logFile = path.join(__dirname, "Utils", "logs.json");
    const logs = JSON.parse(fs.readFileSync(logFile));

    //Pretty Print Was Not Available In This Code
    

    const stats = {
        total: logs.length,
        sql: logs.filter(l => l.attack === "SQL Injection").length,
        xss: logs.filter(l => l.attack === "XSS").length,
        path: logs.filter(l => l.attack === "Path Traversal").length
    };

    res.json(stats);
});*/



app.get("/stats", (req, res) => {
    const logFile = path.join(__dirname, "Utils", "logs.json");
    const logs = JSON.parse(fs.readFileSync(logFile));

    let total = logs.length;
    let sql = 0;
    let xss = 0;
    let pathAttack = 0;

    for (let log of logs) {
        if (log.attack === "SQL Injection") sql++;
        if (log.attack === "XSS") xss++;
        if (log.attack === "Path Traversal") pathAttack++;
    }

    const stats = { total, sql, xss, path: pathAttack };

    // ✅ Pretty print
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(stats, null, 2));
});