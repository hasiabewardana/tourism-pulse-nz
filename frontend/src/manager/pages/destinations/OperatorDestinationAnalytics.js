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
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { ArrowBack, TrendingUp } from "@mui/icons-material";
import DestinationInsightsChart from "../../../shared/components/analytics/DestinationInsightsChart";
import axios from "axios";
import classes from "./OperatorDestinationAnalytics.module.css";

/**
 * Manager/Operator Destination Analytics Page
 * Displays analytics for operator's managed destinations
 */
function OperatorDestinationAnalytics() {
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
    navigate("/manager/destinations");
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
          Back to My Destinations
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
          Back to My Destinations
        </Button>
        <Typography variant="h3" gutterBottom>
          {destination?.name || "Destination"} - Performance Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {destination?.region && `${destination.region} • `}
          {destination?.locationName}
        </Typography>
      </Box>

      {/* Quick Stats Overview */}
      {destination && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Typography variant="h6">{destination.status}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Capacity
                </Typography>
                <Typography variant="h6">{destination.capacity}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Rating
                </Typography>
                <Typography variant="h6">
                  {destination.rating ? `${destination.rating} ⭐` : "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Price
                </Typography>
                <Typography variant="h6">
                  {destination.priceMin === 0
                    ? "FREE"
                    : `$${destination.priceMin}`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

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

      {/* Performance Tips */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <TrendingUp sx={{ mr: 1 }} color="primary" />
          <Typography variant="h6">Performance Tips</Typography>
        </Box>
        <Typography variant="body2" paragraph>
          • Increase visibility by responding to reviews and updating
          destination information regularly
        </Typography>
        <Typography variant="body2" paragraph>
          • Optimize pricing during off-peak hours to attract more visitors
        </Typography>
        <Typography variant="body2" paragraph>
          • Monitor trending searches to understand what tourists are looking
          for
        </Typography>
        <Typography variant="body2">
          • Improve click-through rate by adding high-quality photos and
          detailed descriptions
        </Typography>
      </Paper>
    </Container>
  );
}

export default OperatorDestinationAnalytics;
