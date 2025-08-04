import React, { useState, useEffect } from "react";

// Manager dashboard component for analytics and booking management
const ManagerDashboard = () => {
  const [analytics, setAnalytics] = useState({ visitors: 0, bookings: 0 });

  // Fetch analytics data from API
  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  // Load analytics on component mount
  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Manager Dashboard</h1>
      <p>Manage bookings and view analytics for tourism operators.</p>
      <div>
        <p>Current Visitors: {analytics.visitors}</p>
        <p>Active Bookings: {analytics.bookings}</p>
      </div>
      <button onClick={fetchAnalytics}>Update Analytics</button>
      <button onClick={() => alert("Booking management initiated...")}>
        Manage Bookings
      </button>
    </div>
  );
};

export default ManagerDashboard;
