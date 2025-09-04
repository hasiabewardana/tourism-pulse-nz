// content/admin-panel/src/components/user-management/UserForm.js
import { useState } from "react";
import classes from "./User.module.css"; // Reuse CSS module for form styles

// Form component for creating or editing users
function UserForm({ user, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    role: user?.role || "user",
    password: "", // Password only for create
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (user) {
      // For edit, exclude password if not changed (assuming no password change for simplicity)
      delete submitData.password;
      delete submitData.email; // Email might not be editable
    }
    onSubmit(submitData);
  };

  return (
    <form className={classes.userForm} onSubmit={handleFormSubmit}>
      <label>
        Email:
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={!!user}
        />
      </label>
      <label>
        First Name:
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Last Name:
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Role:
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="operator">Manager</option>
        </select>
      </label>
      {!user && (
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>
      )}
      <div className={classes.formActions}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default UserForm;
