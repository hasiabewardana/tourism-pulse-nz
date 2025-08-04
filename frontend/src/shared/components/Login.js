import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Login component for user authentication
const Login = ({ authenticate }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState(
    new URLSearchParams(window.location.search).get("role") || "manager"
  );

  // Handle login action
  const handleLogin = () => {
    authenticate(role);
    navigate(`/${role}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Login to TourismPulseNZ</h2>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ marginRight: "10px" }}
      >
        <option value="manager">Manager</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={handleLogin} style={{ marginLeft: "10px" }}>
        Login
      </button>
    </div>
  );
};

export default Login;
