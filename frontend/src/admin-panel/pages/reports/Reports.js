// content/admin-panel/src/admin-panel/pages/reports/Reports.js
import { useState, useEffect } from "react";
import classes from "./Reports.module.css"; // Import CSS module for reports styles

// Reports page component to display summary statistics
function Reports() {
  const [stats, setStats] = useState({ userCount: 0, bookingCount: 0 }); // State for stats
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch users and bookings to compute stats
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        // Fetch users
        const usersRes = await fetch(
          "http://localhost:3000/auth/api/v1/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!usersRes.ok) throw new Error("Failed to fetch users");
        const users = await usersRes.json();

        // Fetch bookings
        const bookingsRes = await fetch(
          "http://localhost:3000/dest/api/v1/bookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!bookingsRes.ok) throw new Error("Failed to fetch bookings");
        const bookings = await bookingsRes.json();

        setStats({ userCount: users.length, bookingCount: bookings.length });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch reports data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className={classes.reports}>
      <h1 className={classes.title}>Admin Reports</h1>
      <div className={classes.statsGrid}>
        <div className={classes.statCard}>
          <h2>Total Users</h2>
          <p>{stats.userCount}</p>
        </div>
        <div className={classes.statCard}>
          <h2>Total Bookings</h2>
          <p>{stats.bookingCount}</p>
        </div>
      </div>
    </div>
  );
}

export default Reports;
