import { useState } from "react";
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import classes from "./User.module.css";

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
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="email"
            name="email"
            label="Email"
            value={formData.email}
            onChange={handleChange}
            disabled={!!user}
            required={!user}
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="text"
            name="firstName"
            label="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="text"
            name="lastName"
            label="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="operator">Manager</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {!user && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
              variant="outlined"
            />
          </Grid>
        )}
      </Grid>

      <div className={classes.formActions}>
        <Button
          type="submit"
          variant="contained"
          className={classes.saveButton}
          size="large"
        >
          {user ? "Update User" : "Create User"}
        </Button>
        <Button
          type="button"
          variant="outlined"
          onClick={onCancel}
          className={classes.cancelButton}
          size="large"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default UserForm;
