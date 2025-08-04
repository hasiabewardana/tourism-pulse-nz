import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TouristInterface from "./tourist-interface/components/TouristInterface";
import ManagerDashboard from "./manager-dashboard/components/ManagerDashboard";
import AdminPanel from "./admin-panel/components/AdminPanel";
import Login from "./shared/components/Login";

// Main application component handling routing and authentication
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Authenticate user by calling auth-service API
  const authenticateUser = async (role) => {
    try {
      const response = await fetch("/auth-service/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: role === "admin" ? "admin1@tourismpulsenz.nz" : "manager",
          password: "admin1",
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsAuthenticated(true);
        setUserRole(role);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  // Perform initial authentication
  useEffect(() => {
    authenticateUser("manager"); // Default role for demo
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tourist" />} />
        <Route path="/tourist/*" element={<TouristInterface />} />
        <Route
          path="/manager/*"
          element={
            isAuthenticated && userRole === "manager" ? (
              <ManagerDashboard />
            ) : (
              <Navigate to="/login?role=manager" />
            )
          }
        />
        <Route
          path="/admin/*"
          element={
            isAuthenticated && userRole === "admin" ? (
              <AdminPanel />
            ) : (
              <Navigate to="/login?role=admin" />
            )
          }
        />
        <Route
          path="/login"
          element={<Login authenticate={authenticateUser} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
