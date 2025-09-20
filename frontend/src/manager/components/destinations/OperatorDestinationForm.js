import React, { useState, useEffect } from "react"; // Add React import
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from "@mui/material";
import classes from "./OperatorDestination.module.css";

function OperatorDestinationForm({ assignment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    destinationId: assignment?.destinationId || "",
  });
  const [destinations, setDestinations] = useState([]);
  const [assignedDestinations, setAssignedDestinations] = useState([]);
  const [errors, setErrors] = useState({});
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (assignment) {
      setFormData({
        destinationId: assignment.destinationId || "",
      });
    }
    fetchDestinations();
    fetchAssignedDestinations();
  }, [assignment]);

  const fetchDestinations = async () => {
    if (!token) {
      console.error("No authentication token found.");
      setErrors({ api: "No authentication token found." });
      return;
    }
    try {
      const res = await fetch(
        "http://localhost:3000/dest/api/v1/destinations?status=Open",
        {
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
      setDestinations(data);
    } catch (err) {
      console.error("Failed to fetch destinations:", err);
      setErrors({ api: "Failed to fetch destinations." });
    }
  };

  const fetchAssignedDestinations = async () => {
    if (!token || !userId) {
      console.error("No authentication token or user ID found.");
      setErrors({ api: "No authentication token or user ID found." });
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/operator-destinations/operator/${userId}`,
        {
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
      setAssignedDestinations(data);
    } catch (err) {
      console.error("Failed to fetch assigned destinations:", err);
      setErrors({ api: "Failed to fetch assigned destinations." });
    }
  };

  const availableDestinations = destinations.filter(
    (dest) =>
      !assignedDestinations.some(
        (assigned) => assigned.destination_id === dest.destination_id
      )
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.destinationId)
      newErrors.destinationId = "Destination is required";
    if (!userId) newErrors.userId = "User ID not found. Please log in.";
    return newErrors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submitData = {
      userId: parseInt(userId),
      destinationId: formData.destinationId,
    };

    onSubmit(submitData);
  };

  return (
    <form
      className={classes.operatorDestinationForm}
      onSubmit={handleFormSubmit}
    >
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Assigning to User ID: {userId || "Unknown"}
      </Typography>
      <FormControl fullWidth margin="normal" error={!!errors.destinationId}>
        <InputLabel>Destination</InputLabel>
        <Select
          name="destinationId"
          value={formData.destinationId}
          onChange={handleChange}
        >
          <MenuItem value="">Select Destination</MenuItem>
          {availableDestinations.map((dest) => (
            <MenuItem key={dest.destination_id} value={dest.destination_id}>
              {dest.name}
            </MenuItem>
          ))}
        </Select>
        {errors.destinationId && (
          <Typography color="error">{errors.destinationId}</Typography>
        )}
      </FormControl>
      {errors.userId && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.userId}
        </Typography>
      )}
      {errors.api && (
        <Typography color="error" sx={{ mt: 1 }}>
          {errors.api}
        </Typography>
      )}
      <div className={classes.formActions}>
        <Button type="submit" variant="contained" color="primary">
          {assignment ? "Update" : "Assign"} Destination
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default OperatorDestinationForm;
