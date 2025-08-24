import { useState, useEffect } from "react";
import User from "./User";
import "./User.module.css";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/auth/api/v1/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading users...</p>;
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
