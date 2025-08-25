import { useState, useEffect } from "react";
import User from "./User";
import "./User.module.css"; // Note: Corrected file extension to .module.css

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = (useState < string) | (null > null);

  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve token from storage
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    fetch("http://localhost:3000/auth/api/v1/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Pass token in Authorization header
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError(
          "Failed to fetch users. Please check your token or try logging in again."
        );
        setLoading(false);
      });
  }, []); // Empty dependency array for one-time fetch

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;
  if (users.length === 0) return <p>No users found.</p>;

  return (
    <div className="user-list">
      <h1 className="title">Users</h1>
      <div className="grid">
        {users.map((user) => (
          <User key={user.user_id} user={user} />
        ))}
      </div>
    </div>
  );
}

export default UserList;
