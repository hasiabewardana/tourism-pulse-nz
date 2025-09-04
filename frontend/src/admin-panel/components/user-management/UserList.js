// content/admin-panel/src/components/user-management/UserList.js
import { useState, useEffect } from "react";
import User from "./User"; // Import User component
import UserForm from "./UserForm"; // Import UserForm for create/edit
import classes from "./User.module.css"; // Import CSS module for styling

// Component to list all users, handle CRUD operations
function UserList() {
  const [users, setUsers] = useState([]); // State for user list
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [selectedUser, setSelectedUser] = useState(null); // Selected user for edit

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3000/auth/api/v1/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(
          "Failed to fetch users. Please check your token or try logging in again."
        );
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle user creation or update
  const handleSubmit = async (userData) => {
    const token = localStorage.getItem("token");
    const method = selectedUser ? "PUT" : "POST";
    const url = selectedUser
      ? `http://localhost:3000/auth/api/v1/users/${selectedUser.user_id}`
      : "http://localhost:3000/auth/api/v1/register";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const updatedUser = await res.json();

      if (selectedUser) {
        // Update existing user in list
        setUsers(
          users.map((u) =>
            u.user_id === selectedUser.user_id ? updatedUser : u
          )
        );
      } else {
        // Add new user to list
        setUsers([...users, updatedUser]);
      }

      setShowModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
      setError("Failed to save user.");
    }
  };

  // Handle user deletion
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/auth/api/v1/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setUsers(users.filter((u) => u.user_id !== userId));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
    }
  };

  // Open modal for edit
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Open modal for create
  const handleCreate = () => {
    setSelectedUser(null);
    setShowModal(true);
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>Error: {error}</p>;
  if (users.length === 0) return <p>No users found.</p>;

  return (
    <div className={classes.userList}>
      <h1 className={classes.title}>Users</h1>
      <button className={classes.createButton} onClick={handleCreate}>
        Create New User
      </button>
      <div className={classes.grid}>
        {users.map((user) => (
          <User
            key={user.user_id}
            user={user}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {showModal && (
        <div className={classes.modal}>
          <div className={classes.modalContent}>
            <UserForm
              user={selectedUser}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default UserList;
