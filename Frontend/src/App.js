import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Login from "./login";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
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

  const [stats, setStats] = useState({
  total: 0,
  sql: 0,
  xss: 0,
  path: 0,
});


useEffect(() => {
  if (isAdmin) {
    fetchLogs();
    fetchStats();
  }
}, [isAdmin]);

  // ✅ Fetch logs from backend
 const fetchLogs = async () => {
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

    const sql = data.filter(log => log.attack === "SQL Injection").length;
    const xss = data.filter(log => log.attack === "XSS").length;
    const path = data.filter(log => log.attack === "Path Traversal").length;

    setStats({
      total: data.length,
      sql,
      xss,
      path
    });
  } catch (err) {
    console.error(err);
  }
};

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

ChartJS.register(CategoryScale, LinearScale, BarElement);
const chartData = {
  labels: ["SQL", "XSS", "Path"],
  datasets: [
    {
      label: "Attacks",
      data: [stats.sql, stats.xss, stats.path],
      backgroundColor: ["red", "orange", "blue"],
    },
  ],
};

  // ✅ Attack Simulator

  const [simulationResult, setSimulationResult] = useState("");
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
      setSimulationResult(`Blocked ${type} attack by WAF`);
    } else {
      setSimulationResult(data.message || `${type} simulation completed`);
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
    setSimulationResult("Simulation failed. Check backend connection.");
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



  return (
    
    <>
    
<div style={{
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 0,
  background: "#0b1a2f",
  padding: "10px 0",
  zIndex: 1000
}}>

 <div>
  <h1 style={{ marginBottom: "5px" }}>🛡️ WAF Security Dashboard</h1>
  <p style={{ color: "#b8c7e0", marginTop: 0 }}>
    Real-time monitoring of blocked web attack simulations
  </p>
</div>

  <button
    onClick={() => {
      localStorage.removeItem("adminToken");
      setIsAdmin(false);
    }}
    style={{
      padding: "8px 16px",
      backgroundColor: "#ff4d4f",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer"
    }}
  >
    Logout
  </button>
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "30px"
  }}
>
  <div style={cardStyle}>
    <h3>Total Attacks</h3>
    <p style={cardValueStyle}>{stats.total}</p>
  </div>

  <div style={cardStyle}>
    <h3>SQL Injection</h3>
    <p style={cardValueStyle}>{stats.sql}</p>
  </div>

  <div style={cardStyle}>
    <h3>XSS Attacks</h3>
    <p style={cardValueStyle}>{stats.xss}</p>
  </div>

  <div style={cardStyle}>
    <h3>Path Traversal</h3>
    <p style={cardValueStyle}>{stats.path}</p>
  </div>
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

  <Bar
    data={chartData}
    options={{
      responsive: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,0.08)" }
        },
        y: {
          ticks: { color: "white" },
          grid: { color: "rgba(255,255,255,0.08)" }
        }
      }
    }}
  />
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

</div>
  


        {/* 📜 LOGS TABLE */}
        <h2>📜 Attack Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>IP</th>
              <th>Severity</th>
              <th>Method</th>
              <th>URL</th>
              <th>Attack</th>
              <th>Payload</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.time}</td>
                <td>{log.ip}</td>
                <td>
  <span
    style={{
      padding: "6px 10px",
      borderRadius: "6px",
      fontSize: "0.8rem",
      fontWeight: "bold",
      color: "white",
      backgroundColor:
        log.severity === "Critical"
          ? "#ff4d4f"
          : log.severity === "High"
          ? "#faad14"
          : "#1677ff"
    }}
  >
    {log.severity}
  </span>
</td>
                <td>{log.method}</td>
                <td>{log.url}</td>
                <td className={`attack-${log.attack}`}>
                 <td
  style={{
    fontWeight: "bold",
    color:
      log.attack === "SQL Injection"
        ? "#ff4d4f"
        : log.attack === "XSS"
        ? "#faad14"
        : "#1677ff"
  }}
>
  {log.attack}
</td>
                </td>
                <td>{log.payload}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;
