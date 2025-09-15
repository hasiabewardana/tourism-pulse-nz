// src/manager-dashboard/components/operator-destination-management/OperatorDestinationList.js
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
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import OperatorDestinationForm from "./OperatorDestinationForm";
import classes from "./OperatorDestination.module.css";
import OperatorDestination from "./OperatorDestination";

function OperatorDestinationList() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [userName, setUserName] = useState("");
  const [destinations, setDestinations] = useState([]);

  // Filter states
  const [selectedViewMode, setSelectedViewMode] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
  );

  // Sort and search states
  const [sortBy, setSortBy] = useState("User Name (A-Z)");
  const [searchTerm, setSearchTerm] = useState("");

  const userId = localStorage.getItem("userId");

  const fetchUserName = async () => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUserName(data.name || "Operator");
    } catch (err) {
      console.error("Error fetching user:", err);
      setUserName("Operator");
    }
  };

  const fetchDestinations = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(
        "http://localhost:3000/dest/api/v1/destinations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch destinations");
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      console.error("Error fetching destinations:", err);
    }
  };

  // Fetch assignments with filters
  const fetchAssignments = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userId) {
      setError("No authentication token or user ID found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `http://localhost:3000/dest/api/v1/operator-destinations/operator/${userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      // Map the response to include userName and destinationName for consistency
      const mappedData = data.map((assignment) => ({
        ...assignment,
        userName,
        destinationName: assignment.name,
        userId: parseInt(assignment.user_id),
        destinationId: parseInt(assignment.destination_id),
      }));
      setAssignments(mappedData);
      applySearchAndSort(mappedData);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to fetch operator destinations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserName();
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (userName) {
      fetchAssignments();
    }
  }, [selectedDate, userName]); // Removed selectedViewMode since not used in API

  const applySearchAndSort = (data) => {
    let filtered = data.filter(
      (assignment) =>
        assignment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.destinationName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "User Name (A-Z)":
          return a.userName.localeCompare(b.userName);
        case "User Name (Z-A)":
          return b.userName.localeCompare(a.userName);
        case "Destination Name (A-Z)":
          return a.destinationName.localeCompare(b.destinationName);
        case "Destination Name (Z-A)":
          return b.destinationName.localeCompare(a.destinationName);
        default:
          return 0;
      }
    });

    setFilteredAssignments(filtered);
  };

  useEffect(() => {
    applySearchAndSort(assignments);
  }, [searchTerm, sortBy, assignments]);

  const handleSubmit = async (formData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found.");
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        "http://localhost:3000/dest/api/v1/operator-destinations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: parseInt(userId),
            destinationId: parseInt(formData.destinationId),
          }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to assign destination: ${response.statusText}`);
      }
      setShowModal(false);
      fetchAssignments(); // Refresh the list
    } catch (err) {
      console.error("Error assigning destination:", err);
      setError("Failed to assign destination.");
    }
  };

  const handleDelete = async (userIdToDelete, destinationId) => {
    if (!window.confirm("Are you sure you want to delete this assignment?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:3000/dest/api/v1/operator-destinations",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: userIdToDelete, destinationId }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete assignment: ${response.statusText}`);
      }
      fetchAssignments(); // Refresh the list
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError("Failed to delete assignment.");
    }
  };

  const handleCreate = () => {
    setSelectedAssignment(null);
    setShowModal(true);
  };

  const handleResetFilters = () => {
    setSelectedViewMode("All");
    setSelectedDate(
      new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
    );
    setSearchTerm("");
    setSortBy("User Name (A-Z)");
  };

  if (loading) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Alert severity="error" className={classes.errorAlert}>
        {error}
      </Alert>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container className={classes.container}>
        <Typography variant="h3" className={classes.title}>
          My Operator Destinations
        </Typography>

        <Grid container spacing={2} className={classes.filtersContainer}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>View Mode</InputLabel>
              <Select
                value={selectedViewMode}
                label="View Mode"
                onChange={(e) => setSelectedViewMode(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="User">By User</MenuItem>
                <MenuItem value="Destination">By Destination</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <DatePicker
              label="Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="User Name (A-Z)">User Name (A-Z)</MenuItem>
                <MenuItem value="User Name (Z-A)">User Name (Z-A)</MenuItem>
                <MenuItem value="Destination Name (A-Z)">
                  Destination Name (A-Z)
                </MenuItem>
                <MenuItem value="Destination Name (Z-A)">
                  Destination Name (Z-A)
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={2} className={classes.searchResetContainer}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search by User or Destination Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={classes.searchInput}
              aria-label="Search assignments"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
            >
              Reset Filters
            </Button>
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          onClick={handleCreate}
          className={classes.createButton}
        >
          Assign New Destination
        </Button>

        {filteredAssignments.length === 0 ? (
          <Typography className={classes.noResults}>
            No assignments found.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredAssignments.map((assignment) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={`${assignment.userId}-${assignment.destinationId}`}
              >
                <OperatorDestination
                  assignment={assignment}
                  userName={userName}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {showModal && (
          <div className={classes.modal}>
            <div className={classes.modalContent}>
              <OperatorDestinationForm
                destinations={destinations}
                userId={userId}
                onSubmit={handleSubmit}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default OperatorDestinationList;
