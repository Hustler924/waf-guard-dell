import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

function App() {
  const [logs, setLogs] = useState([]);

  // ✅ Fetch logs from backend
  const fetchLogs = async () => {
    try {
      const res = await fetch("http://localhost:3000/logs");
      const data = await res.json();
      setLogs(data.reverse());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // ✅ Attack Simulator
  const simulateAttack = async (type) => {
    let payload = "";

    if (type === "sql") payload = "' OR 1=1 --";
    if (type === "xss") payload = "<script>alert('hack')</script>";
    if (type === "path") payload = "../../etc/passwd";

    try {
      const res = await fetch("http://localhost:3000/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: payload }),
      });

      // 🚨 SHOW ALERT
      if (!res.ok) {
        showAlert(type, payload);
        fetchLogs(); // refresh logs
      }

    } catch (err) {
      console.error(err);
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



  return (
    <>
      {/* 🔔 GLOBAL ALERT SYSTEM */}
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container">
        <h1>🛡️ WAF Security Dashboard</h1>

        {/* 🧪 ATTACK SIMULATOR */}
        <h2>🧪 Attack Simulator</h2>
        <div className="buttons">
          <button onClick={() => simulateAttack("sql")}>SQL Injection</button>
          <button onClick={() => simulateAttack("xss")}>XSS Attack</button>
          <button onClick={() => simulateAttack("path")}>Path Traversal</button>
        </div>

        {/* 📜 LOGS TABLE */}
        <h2>📜 Attack Logs</h2>
        <table>
          <thead>
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
                <td className={`attack-${log.attack}`}>
                  {log.attack}
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
