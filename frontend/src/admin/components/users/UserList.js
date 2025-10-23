import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import User from "./User";
import UserForm from "./UserForm";
import Pagination from "../../../shared/components/common/Pagination";
import classes from "./User.module.css";

function UserList() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [paginatedUsers, setPaginatedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const ITEMS_PER_PAGE = 12;

  // Filter and search states
  const [selectedRole, setSelectedRole] = useState("All");
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const [searchTerm, setSearchTerm] = useState("");

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
        applySearchAndSort(data);
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

  // Apply search and sort filters
  const applySearchAndSort = (data) => {
    let filtered = data.filter((user) => {
      const matchesSearch =
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        selectedRole === "All" || user.role === selectedRole.toLowerCase();
      return matchesSearch && matchesRole;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Name (A-Z)":
          return `${a.first_name} ${a.last_name}`.localeCompare(
            `${b.first_name} ${b.last_name}`
          );
        case "Name (Z-A)":
          return `${b.first_name} ${b.last_name}`.localeCompare(
            `${a.first_name} ${a.last_name}`
          );
        case "Email (A-Z)":
          return a.email.localeCompare(b.email);
        case "Email (Z-A)":
          return b.email.localeCompare(a.email);
        case "Role":
          return a.role.localeCompare(b.role);
        case "Newest First":
          return new Date(b.created_at) - new Date(a.created_at);
        case "Oldest First":
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
  };

  useEffect(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setPaginatedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, selectedRole]);

  // Re-apply filters when search/sort criteria change
  useEffect(() => {
    applySearchAndSort(users);
  }, [users, searchTerm, selectedRole, sortBy]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedRole("All");
    setSortBy("Name (A-Z)");
  };

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

  if (loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress />
        <Typography
          variant="h6"
          sx={{ mt: 2, color: "var(--tp-secondary-text)" }}
        >
          Loading users...
        </Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className={classes.container}>
        <Alert severity="error" className={classes.errorAlert}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <div className={classes.container}>
      <Typography variant="h3" className={classes.title}>
        User Management
      </Typography>

      {/* Filter Options Row */}
      <Grid container spacing={2} className={classes.filtersContainer}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by Name or Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
              placeholder="Search by name or email..."
              aria-label="Search users"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="Name (A-Z)">Name (A-Z)</MenuItem>
                <MenuItem value="Name (Z-A)">Name (Z-A)</MenuItem>
                <MenuItem value="Email (A-Z)">Email (A-Z)</MenuItem>
                <MenuItem value="Email (Z-A)">Email (Z-A)</MenuItem>
                <MenuItem value="Role">Role</MenuItem>
                <MenuItem value="Newest First">Newest First</MenuItem>
                <MenuItem value="Oldest First">Oldest First</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              className={classes.createButton}
              fullWidth
            >
              Create New User
            </Button>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={selectedRole}
              label="Role"
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <MenuItem value="All">All Roles</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="Operator">Manager</MenuItem>
              <MenuItem value="User">User</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={7}>
          {/* Empty space for alignment */}
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            onClick={resetFilters}
            className={classes.resetButton}
            fullWidth
          >
            Reset Filters
          </Button>
        </Grid>
      </Grid>

      {/* Results */}
      {filteredUsers.length === 0 ? (
        <div className={classes.noResults}>
          <Typography variant="h6" color="textSecondary">
            {users.length === 0
              ? "No users found."
              : "No users match your search criteria."}
          </Typography>
        </div>
      ) : (
        <div className={classes.resultsContainer}>
          <Typography variant="body2" className={classes.resultsCount}>
            Showing {filteredUsers.length} of {users.length} users
          </Typography>
          <div className={classes.grid}>
            {paginatedUsers.map((user) => (
              <User
                key={user.user_id}
                user={user}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        className={classes.dialog}
      >
        <DialogTitle className={classes.dialogTitle}>
          {selectedUser ? "Edit User" : "Create New User"}
          <IconButton
            onClick={() => setShowModal(false)}
            className={classes.closeButton}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          <UserForm
            user={selectedUser}
            onSubmit={handleSubmit}
            onCancel={() => setShowModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserList;
