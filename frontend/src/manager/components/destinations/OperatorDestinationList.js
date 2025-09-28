import { useState, useEffect } from "react";
import {
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
import OperatorDestination from "./OperatorDestination";
import classes from "./OperatorDestination.module.css";

function OperatorDestinationList() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [userName, setUserName] = useState("");
  const [destinations, setDestinations] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [selectedViewMode, setSelectedViewMode] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
  );
  const [sortBy, setSortBy] = useState("User Name (A-Z)");
  const [searchTerm, setSearchTerm] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // WebSocket connection
  useEffect(() => {
    if (!userId || !token) {
      setError("Missing userId or token. Please log in.");
      setLoading(false);
      return;
    }

    const ws = new WebSocket(`ws://localhost:3003?operatorId=${userId}`);

    ws.onopen = () => console.log("WebSocket connected");
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "alert") {
        setAlerts((prev) => [...prev, message.message].slice(-5));
      } else if (message.type === "capacity") {
        setAssignments((prev) =>
          prev.map((assignment) => {
            const updated = message.data.find(
              (d) => d.destination_id === assignment.destinationId
            );
            return updated
              ? {
                  ...assignment,
                  current_visitors: updated.current_visitors,
                  occupancy_percentage: updated.occupancy_percentage,
                }
              : assignment;
          })
        );
      }
    };
    ws.onclose = () => console.log("WebSocket disconnected");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, [userId, token]);

  const fetchUserName = async () => {
    if (!userId || !token) return;
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
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
    if (!token) return;
    try {
      const res = await fetch(
        "http://localhost:3000/dest/api/v1/destinations",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch destinations");
      const data = await res.json();
      setDestinations(data);
    } catch (err) {
      console.error("Error fetching destinations:", err);
    }
  };

  const fetchAssignments = async () => {
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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const mappedData = await Promise.all(
        data.map(async (assignment) => {
          const subCheck = await fetch(
            `http://localhost:3000/analytics/api/v1/subscriptions/check?operatorId=${userId}&destinationId=${assignment.destination_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const subData = await subCheck.json();
          return {
            ...assignment,
            userName,
            destinationName: assignment.name,
            userId: parseInt(assignment.user_id),
            destinationId: parseInt(assignment.destination_id),
            subscribed: subData.subscribed || false,
          };
        })
      );
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
    if (userName) fetchAssignments();
  }, [selectedDate, userName]);

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
      if (!response.ok)
        throw new Error(`Failed to assign destination: ${response.statusText}`);
      setShowModal(false);
      fetchAssignments();
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
      if (!response.ok)
        throw new Error(`Failed to delete assignment: ${response.statusText}`);
      fetchAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      setError("Failed to delete assignment.");
    }
  };

  const handleSubscribe = async (operatorId, destinationId, subscribed) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(
        "http://localhost:3000/analytics/api/v1/subscriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ operatorId, destinationId, subscribed }),
        }
      );
      if (!response.ok) throw new Error("Failed to update subscription");
      fetchAssignments();
    } catch (err) {
      console.error("Error subscribing:", err);
      setError("Failed to update subscription.");
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
      <div className={classes.loadingContainer}>
        <CircularProgress color="primary" />
      </div>
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
      <div>
        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className={classes.alertsContainer}>
            <Typography variant="h6" className={classes.alertsTitle}>
              Recent Alerts
            </Typography>
            <div className={classes.alertsList}>
              {alerts.map((alert, index) => (
                <div key={index} className={classes.alertItem}>
                  {alert}
                </div>
              ))}
            </div>
          </div>
        )}

        <Grid container spacing={2} className={classes.filtersContainer}>
          {/* Primary Row */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                label="Search by Destination or User Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={classes.searchInput}
                aria-label="Search assignments"
              />
            </Grid>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                onClick={handleCreate}
                className={classes.createButton}
                fullWidth
              >
                Add Destination
              </Button>
            </Grid>
          </Grid>
          {/* Secondary Row */}
          <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={4}>
            <DatePicker
              label="Select Date"
              value={selectedDate ? new Date(selectedDate) : null}
              onChange={(newValue) => {
                if (newValue) {
                  const formattedDate = newValue.toLocaleDateString("en-CA", {
                    timeZone: "Pacific/Auckland",
                  });
                  setSelectedDate(formattedDate);
                }
              }}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              className={classes.resetButton}
              fullWidth
            >
              Reset
            </Button>
          </Grid>
        </Grid>

        {filteredAssignments.length === 0 ? (
          <div className={classes.noResultsContainer}>
            <Typography className={classes.noResults}>
              No destinations found.
            </Typography>
          </div>
        ) : (
          <div className={classes.destinationsGrid}>
            {filteredAssignments.map((assignment) => (
              <OperatorDestination
                key={`${assignment.userId}-${assignment.destinationId}`}
                assignment={assignment}
                userName={userName}
                onDelete={handleDelete}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
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
      </div>
    </LocalizationProvider>
  );
}

export default OperatorDestinationList;
