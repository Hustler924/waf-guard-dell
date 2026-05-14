import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Login from "./login";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";


function App() {
  const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
};

const cardStyle = {
  background: "#132238",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
  textAlign: "center",
  color: "white"
};

const cardValueStyle = {
  fontSize: "2rem",
  fontWeight: "bold",
  marginTop: "10px"
};

  const [logs, setLogs] = useState([]);
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("adminToken"));
const [lastAttack, setLastAttack] = useState("-");
const [selectedAttackType, setSelectedAttackType] = useState("All");
  const [stats, setStats] = useState({
  total: 0,
  sql: 0,
  xss: 0,
  path: 0,
   command: 0,
  failedLogins: 0
});
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
   const handleScroll = () => {
    if (window.scrollY > 50) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
} , []);

useEffect(() => {
  if (isAdmin) {
    fetchLogs();
    fetchStats();
  }
  // eslint-disable-next-line
}, [isAdmin]);

  // ✅ Fetch logs from backend
 async function fetchLogs() {
    try {
      const res = await fetch("http://localhost:3000/logs", {
        headers: getAuthHeaders()
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("adminToken");
        setIsAdmin(false);
        return;
      }

      const data = await res.json();
      setLogs(data);
      if (data.length > 0) {
        setLastAttack(data[0].time);
      } else {
        setLastAttack("-");
      }

     const sql = data.filter((log) => log.attack === "SQL Injection").length;
const xss = data.filter((log) => log.attack === "XSS").length;
const path = data.filter((log) => log.attack === "Path Traversal").length;
const command = data.filter((log) => log.attack === "Command Injection").length;
const failedLogins = data.filter(
  (log) =>
    log.attack === "Failed Admin Login" ||
    log.attack === "Brute Force Lockout" ||
    log.attack === "Blocked Admin Login Attempt"
).length;

setStats({
  total: data.length,
  sql,
  xss,
  path,
  command,
  failedLogins
});
    } catch (err) {
      console.error(err);
    }
  }

const fetchStats = async () => {
  try {
    const res = await fetch("http://localhost:3000/stats", {
      headers: getAuthHeaders()
    });

    if (!res.ok) return;

    const data = await res.json();
    setStats(data);
  } catch (err) {
    console.error(err);
  }
};

ChartJS.register(ArcElement, Tooltip, Legend);
const chartData = {
  labels: [
    "SQL Injection",
    "XSS",
    "Path Traversal",
    "Command Injection",
    "Failed Attempts"
  ],
  datasets: [
    {
      data: [
        stats.sql,
        stats.xss,
        stats.path,
        stats.command,
        stats.failedLogins
      ],
    backgroundColor: [
  "#ff4d4f",
  "#fadb14",
  "#1677ff",
  "#52c41a",
  "#722ed1"
],
      borderWidth: 2,
borderColor: "#0b1a2f"
    }
  ]
};

  // ✅ Attack Simulator

 
  const simulateAttack = async (type, payload) => {
  try {
    const res = await fetch("http://localhost:3000/simulate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, payload })
    });

    const data = await res.json();
    
if (!res.ok) {
      toast.warn(`${type} blocked and logged by WAF`);
    } else {
      toast.success(`${type} simulation completed`);
    }

    if (isAdmin) {
      fetchLogs();
      fetchStats();
    }
  

      // 🚨 SHOW ALERT
      if (!res.ok) {
        showAlert(type, payload);
        fetchLogs(); // refresh logs
      }

   } catch (err) {
    
  }
};



  // ✅ Alert UI
  const showAlert = (type, payload) => {
    if (type === "sql") {
      toast.error(`🚨 SQL Injection\n${payload}`);
    } else if (type === "xss") {
      toast.warn(`⚠️ XSS Attack\n${payload}`);
    } else if (type === "path") {
      toast.info(`📁 Path Traversal\n${payload}`);
    }
  };

if (!isAdmin) {
  return <Login onLogin={setIsAdmin} />;
}

const filteredLogs =
  selectedAttackType === "All"
    ? logs
    : selectedAttackType === "Failed Login Events"
    ? logs.filter(
        (log) =>
          log.attack === "Failed Admin Login" ||
          log.attack === "Brute Force Lockout" ||
          log.attack === "Blocked Admin Login Attempt"
      )
    : logs.filter((log) => log.attack === selectedAttackType);

    const exportLogs = () => {
  const dataStr = JSON.stringify(logs, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "waf-logs.json";
  a.click();

  window.URL.revokeObjectURL(url);
  toast.success("Logs exported successfully");
};


  return (
    
    <>
<div
  style={{
    position: isScrolled ? "fixed" : "relative",
    top: 0,
    left: 0,
    width: "100%",
    background: "#061a3a",
    padding: isScrolled ? "10px 20px" : "10px",
    transition: "all 0.3s ease",
    zIndex: 1000
  }}
>
  <div
    style={{
      maxWidth: "1100px",
      margin: "0 auto",
      display: "flex",
      justifyContent: isScrolled ? "space-between" : "center",
      alignItems: "center",
      textAlign: isScrolled ? "left" : "center"
    }}
  >
    {/* LEFT SIDE */}
    <div>
      <h1
        style={{
          margin: 0,
          fontSize: isScrolled ? "22px" : "42px",
          fontWeight: "800",
          color: "white",
          transition: "all 0.3s ease"
        }}
      >
        WAF Guard
      </h1>

      {!isScrolled && (
        <p
          style={{
            color: "#b8c7e0",
            fontSize: "15px",
            marginTop: "8px"
          }}
        >
          Real-time Web Application Firewall Monitoring System
        </p>
      )}
    </div>

    {/* RIGHT SIDE */}
    {isScrolled && (
      <button
        onClick={() => {
          localStorage.removeItem("adminToken");
          setIsAdmin(false);
        }}
        style={{
          padding: "8px 14px",
          backgroundColor: "#ff4d4f",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    )}
  </div>
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "15px",
   marginTop: isScrolled ? "80px" : "20px",
    marginBottom: "30px"
  }}
>

 <div
 
  onClick={() => setSelectedAttackType("All")}
  style={{
    ...cardStyle,
    cursor: "pointer",
    border:
      selectedAttackType === "All"
        ? "2px solid #00c853"
        : "2px solid transparent"
  }}
>
  <h3>Total Attacks</h3>
  <p style={cardValueStyle}>{stats.total}</p>
</div>

  <div
  onClick={() => setSelectedAttackType("SQL Injection")}
  style={{
    ...cardStyle,
    cursor: "pointer",
    border:
      selectedAttackType === "SQL Injection"
        ? "2px solid #ff4d4f"
        : "2px solid transparent"
  }}
>

  <h3>SQL Injection</h3>
  <p style={cardValueStyle}>{stats.sql}</p>

</div>

 <div
  onClick={() => setSelectedAttackType("XSS")}
  style={{
    ...cardStyle,
    cursor: "pointer",
    border:
      selectedAttackType === "XSS"
        ? "2px solid #faad14"
        : "2px solid transparent"
  }}
>
  <h3>XSS Attacks</h3>
  <p style={cardValueStyle}>{stats.xss}</p>
</div>

 <div
  onClick={() => setSelectedAttackType("Path Traversal")}
  style={{
    ...cardStyle,
    cursor: "pointer",
    border:
      selectedAttackType === "Path Traversal"
        ? "2px solid #1677ff"
        : "2px solid transparent"
  }}
>
  <h3>Path Traversal</h3>
  <p style={cardValueStyle}>{stats.path}</p>
</div>

<div
  onClick={() => setSelectedAttackType("Command Injection")}
  style={{
    ...cardStyle,
    cursor: "pointer",
    border:
      selectedAttackType === "Command Injection"
        ? "2px solid #13c2c2"
        : "2px solid transparent"
  }}
>
  <h3>Command Injection</h3>
  <p style={cardValueStyle}>{stats.command}</p>
</div>

<div
  onClick={() => setSelectedAttackType("Failed Login Events")}
  style={{
    ...cardStyle,
    cursor: "pointer",
    border:
      selectedAttackType === "Failed Login Events"
        ? "2px solid #ff9f1a"
        : "2px solid transparent"
  }}
>
  <h3>Failed Attempts</h3>
  <p style={cardValueStyle}>{stats.failedLogins}</p>
</div>

<p style={{ color: "#b8c7e0", marginTop: "10px", marginBottom: "20px" }}>
  Last detected attack: {lastAttack}
</p>
</div>

<div
  style={{
    background: "#132238",
    padding: "25px",
    borderRadius: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    marginBottom: "30px"
  }}
>
  <h2 style={{ color: "white", marginBottom: "20px" }}>
    Attack Trends Overview
  </h2>
  

 <div style={{ maxWidth: "420px", margin: "0 auto" }}>
  <Pie
    data={chartData}
    options={{
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "white"
          }
        }
      }
    }}
  />
</div>
</div>

<div>
          {/* 🧪 ATTACK SIMULATOR */}
        <h2>🧪 Attack Simulator</h2>
        <div style={{ marginTop: "10px" }}>
  <button
    onClick={() => simulateAttack("SQL Injection", "' OR 1=1 --")}
    style={{
      padding: "14px 22px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "bold",
      marginRight: "12px",
      marginBottom: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      backgroundColor: "#ff4d4f",
      color: "white"
    }}
  >
    SQL Injection
  </button>

  <button
    onClick={() => simulateAttack("XSS", "<script>alert('xss')</script>")}
    style={{
      padding: "14px 22px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "bold",
      marginRight: "12px",
      marginBottom: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      backgroundColor: "#faad14",
      color: "white"
    }}
  >
    XSS Attack
  </button>

  <button
    onClick={() => simulateAttack("Path Traversal", "../../../etc/passwd")}
    style={{
      padding: "14px 22px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "bold",
      marginRight: "12px",
      marginBottom: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      backgroundColor: "#1677ff",
      color: "white"
    }}
  >
    Path Traversal
  </button>

  <button
  onClick={() => simulateAttack("Command Injection", "; ls")}
  style={{
      padding: "14px 22px",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "1rem",
      fontWeight: "bold",
      marginRight: "12px",
      marginBottom: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
      backgroundColor: "#1677ff",
      color: "white"
    }}
>
  Simulate Command Injection
</button>

</div>

<button
  onClick={async () => {
    if (!window.confirm("Are you sure you want to clear all logs?")) return;
    try {
      await fetch("http://localhost:3000/clear-logs", {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      fetchLogs();
      fetchStats();
      toast.success("Logs cleared successfully");
    } catch (err) {
      console.error(err);
    }
  }}
  style={{
    padding: "10px 16px",
    backgroundColor: "#ff4d4f",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "15px"
  }}
>
  Clear Logs
</button>

<space>   </space>

<button
  onClick={() => exportLogs()}
  style={{
    padding: "10px 16px",
    backgroundColor: "#1677ff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "15px",
    marginRight: "10px"
  }}
>
  Export Logs
</button>
  


        {/* 📜 LOGS TABLE */}
        <h2>📜 Attack Logs</h2>
        
        <p style={{ color: "#b8c7e0", marginBottom: "15px" }}>
  Showing logs for: <strong>{selectedAttackType}</strong>
</p>
        <table>
         <thead>
  <tr>
    <th style={{ padding: "12px", textAlign: "left" }}>Time</th>
    <th style={{ padding: "12px", textAlign: "left" }}>IP</th>
    <th style={{ padding: "12px", textAlign: "left" }}>Method</th>
    <th style={{ padding: "12px", textAlign: "left" }}>URL</th>
    <th style={{ padding: "12px", textAlign: "left" }}>Attack</th>
    <th style={{ padding: "12px", textAlign: "left" }}>Severity</th>
    <th style={{ padding: "12px", textAlign: "left" }}>Payload</th>
  </tr>
</thead>

          <tbody>
          {filteredLogs.map((log, index) => (
             <tr key={log.id || index}>
  <td style={{ padding: "10px" }}>{log.time}</td>
  <td style={{ padding: "10px" }}>{log.ip.replace("::1", "127.0.0.1")}</td>
  <td style={{ padding: "10px" }}>{log.method}</td>
  <td style={{ padding: "10px" }}>{log.url}</td>
  

  <td
    style={{
      padding: "10px",
      fontWeight: "bold",
      color:
  log.attack === "SQL Injection"
    ? "#ff4d4f"
    : log.attack === "XSS"
    ? "#faad14"
    : log.attack === "Path Traversal"
    ? "#1677ff"
    : log.attack === "Failed Admin Login"
    ? "#ff9f1a"
    : log.attack === "Command Injection"
    ? "#13c2c2"
    : log.attack === "Brute Force Lockout"
    ? "#d9363e"
    : log.attack === "Blocked Admin Login Attempt"
    ? "#722ed1"
    : "white"
    }}
  >
    {log.attack}
  </td>

  <td style={{ padding: "10px" }}>
  <span
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      fontSize: "0.8rem",
      fontWeight: "bold",
      color: "white",
      backgroundColor:
        log.severity?.toLowerCase().trim() === "critical"
          ? "#ff4d4f"
          : log.severity?.toLowerCase().trim() === "high"
          ? "#faad14"
          : "#1677ff"
    }}
  >
  {log.severity}
  </span>
</td>

  <td style={{ padding: "10px", maxWidth: "320px", wordBreak: "break-word" }}>
    {log.payload}
  </td>
</tr>
            ))}
          </tbody>
        </table>
        <ToastContainer position="top-right" autoClose={2500} />
      </div>
    </>
  );
}

export default App;
