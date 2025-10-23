import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import DestinationInsightsChart from "../../../shared/components/analytics/DestinationInsightsChart";
import axios from "axios";
import classes from "./DestinationAnalytics.module.css";

/**
 * Admin Destination Analytics Page
 * Displays comprehensive analytics for a specific destination
 */
function DestinationAnalytics() {
  const { destinationId } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);

  useEffect(() => {
    loadDestinationDetails();
  }, [destinationId]);

  const loadDestinationDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/dest/api/v1/destinations/${destinationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDestination(response.data);
    } catch (error) {
      console.error("Error loading destination:", error);
      setError("Failed to load destination details");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate("/admin/destinations");
  };

  const handlePeriodChange = (event, newValue) => {
    setSelectedPeriod(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Destinations
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBackClick}
          sx={{ mb: 2 }}
        >
          Back to Destinations
        </Button>
        <Typography variant="h3" gutterBottom>
          {destination?.name || "Destination"} - Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {destination?.region && `${destination.region} • `}
          {destination?.locationName}
        </Typography>
      </Box>

      {/* Time Period Selector */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedPeriod}
          onChange={handlePeriodChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Last 7 Days" value={7} />
          <Tab label="Last 14 Days" value={14} />
          <Tab label="Last 30 Days" value={30} />
          <Tab label="Last 90 Days" value={90} />
        </Tabs>
      </Paper>

      {/* Analytics Dashboard */}
      <DestinationInsightsChart
        destinationId={parseInt(destinationId)}
        days={selectedPeriod}
      />
    </Container>
  );
}

export default DestinationAnalytics;
