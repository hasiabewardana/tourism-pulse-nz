import React, { useState } from "react";

// Admin panel component for system configuration and reporting
const AdminPanel = () => {
  const [reports, setReports] = useState([]);

  // Generate report by calling API
  const generateReport = async () => {
    try {
      const response = await fetch("/api/reports/generate");
      const data = await response.json();
      setReports([...reports, data]);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Panel</h1>
      <p>Configure settings and generate reports for system administration.</p>
      <button onClick={generateReport}>Generate New Report</button>
      <ul>
        {reports.map((report, index) => (
          <li key={index}>
            {report.title}: {report.details}
          </li>
        ))}
      </ul>
      <button onClick={() => alert("Settings update initiated...")}>
        Update Settings
      </button>
    </div>
  );
};

export default AdminPanel;
