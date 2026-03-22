import React, { useEffect, useState } from "react";

function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});

 useEffect(() => {
  const fetchData = () => {
    fetch("http://localhost:3000/logs")
      .then(res => res.json())
      .then(data => setLogs(data));

    fetch("http://localhost:3000/stats")
      .then(res => res.json())
      .then(data => setStats(data));
  };

  fetchData();

  const interval = setInterval(fetchData, 3000); // every 3 sec

  return () => clearInterval(interval);
}, []);

  return (
  <div style={{ padding: "20px", fontFamily: "Arial" }}>
    <h1 style={{ textAlign: "center" }}>🛡️ WAF Security Dashboard</h1>

    {/* Stats Cards */}
    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
      <div style={{ background: "#eee", padding: "15px", flex: 1 }}>
        <h3>Total</h3>
        <p>{stats.total}</p>
      </div>
      <div style={{ background: "#ffcccc", padding: "15px", flex: 1 }}>
        <h3>SQL</h3>
        <p>{stats.sql}</p>
      </div>
      <div style={{ background: "#fff3cd", padding: "15px", flex: 1 }}>
        <h3>XSS</h3>
        <p>{stats.xss}</p>
      </div>
      <div style={{ background: "#cce5ff", padding: "15px", flex: 1 }}>
        <h3>Path</h3>
        <p>{stats.path}</p>
      </div>
    </div>

    {/* Logs Table */}
    <h2>📜 Attack Logs</h2>
    <table border="1" cellPadding="10" width="100%">
      <thead style={{ background: "#ddd" }}>
        <tr>
          <th>Time</th>
          <th>IP</th>
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
            <td>{log.method}</td>
            <td>{log.url}</td>
            <td style={{
              color:
                log.attack === "SQL Injection" ? "red" :
                log.attack === "XSS" ? "orange" :
                "blue"
            }}>
              {log.attack}
            </td>
            <td>{log.payload}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
}

export default App;