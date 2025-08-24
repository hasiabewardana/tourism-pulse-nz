import { useState, useEffect } from "react";
import User from "./User"; // Import the User component

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch user data (e.g., from an API)
    fetch("http://localhost:3000/auth/api/v1/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return (
    <div>
      <h1>User List</h1>
      {users.map((user) => (
        <User key={user.id} user={user} />
      ))}
    </div>
  );
}

export default UserList;
