import React, { useState } from "react";
import {
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  LinearProgress,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Search,
  Monitor,
  Analytics,
  People,
  TrendingUp,
  Warning,
  CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../../../shared/context/AuthContext";
import classes from "./ManagerHome.module.css";

// Mock data for managed destinations
const managedDestinations = [
  {
    id: 1,
    name: "Milford Sound",
    currentVisitors: 2100,
    maxCapacity: 2500,
    status: "high",
    forecast: "Peak in 2 hours",
    revenueToday: "$45,000",
    alerts: ["High traffic alert"],
  },
  {
    id: 2,
    name: "Bay of Islands",
    currentVisitors: 1080,
    maxCapacity: 1800,
    status: "moderate",
    forecast: "Stable",
    revenueToday: "$32,000",
    alerts: ["Maintenance scheduled"],
  },
  {
    id: 3,
    name: "Rotorua",
    currentVisitors: 1280,
    maxCapacity: 3200,
    status: "low",
    forecast: "Increasing tomorrow",
    revenueToday: "$28,000",
    alerts: [],
  },
  {
    id: 4,
    name: "Queenstown",
    currentVisitors: 3000,
    maxCapacity: 4000,
    status: "high",
    forecast: "Overcapacity risk",
    revenueToday: "$60,000",
    alerts: ["Staffing shortage"],
  },
];

const quickActions = [
  {
    title: "Update Capacity",
    description: "Adjust real-time limits and alerts",
    icon: <Monitor fontSize="large" />,
    action: "update",
    color: "primary",
  },
  {
    title: "View Analytics",
    description: "Predictive forecasts and trends",
    icon: <Analytics fontSize="large" />,
    action: "analytics",
    color: "secondary",
  },
  {
    title: "Manage Bookings",
    description: "Dynamic pricing and reservations",
    icon: <People fontSize="large" />,
    action: "bookings",
    color: "success",
  },
  {
    title: "Coordinate Sites",
    description: "Collaborate with other operators",
    icon: <TrendingUp fontSize="large" />,
    action: "coordinate",
    color: "info",
  },
];

const operatorInsights = [
  {
    title: "Capacity Alert",
    message: "Multiple sites approaching limits - consider redirects.",
    type: "warning",
    icon: <Warning />,
  },
  {
    title: "Forecast Update",
    message: "Expected 15% increase in visitors next week.",
    type: "info",
    icon: <Analytics />,
  },
  {
    title: "Sustainability Tip",
    message: "Promote eco-friendly options to maintain scores.",
    type: "success",
    icon: <CheckCircle />,
  },
];

function ManagerHome() {
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const getStatusColor = (status) => {
    switch (status) {
      case "low":
        return "#4CAF50";
      case "moderate":
        return "#FF9800";
      case "high":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getCapacityPercentage = (current, max) => (current / max) * 100;

  const handleQuickAction = (action) => {
    console.log(`Operator action: ${action}`);
    // In real app, navigate or trigger modals/APIs
  };

  const filteredDestinations = managedDestinations.filter(
    (dest) =>
      (selectedStatus === "all" || dest.status === selectedStatus) &&
      dest.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" className={classes.managerContainer}>
      {/* Welcome Header */}
      <Box className={classes.welcomeHeader}>
        <Box className={classes.welcomeContent}>
          <Typography variant="h2" className={classes.welcomeTitle}>
            Welcome to TourismPulseNZ Manager Dashboard
          </Typography>
          <Typography variant="h5" className={classes.welcomeSubtitle}>
            {user?.name ? `Hello ${user.name}!` : "Hello Operator!"} Manage your
            destinations with real-time insights.
          </Typography>
        </Box>
        <Box className={classes.userAvatar}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#ffffff",
              color: "#0c8a94",
              fontSize: "2rem",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
          </Avatar>
        </Box>
      </Box>

      {/* Search Section */}
      <Box className={classes.searchSection}>
        <Card className={classes.searchCard}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search managed destinations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#0c8a94" }} />
                  </InputAdornment>
                ),
              }}
              className={classes.searchInput}
            />
            <Box className={classes.filterChips}>
              {["All Status", "Low", "Moderate", "High"].map((status) => (
                <Chip
                  key={status}
                  label={status}
                  onClick={() =>
                    setSelectedStatus(
                      status === "All Status" ? "all" : status.toLowerCase()
                    )
                  }
                  className={classes.filterChip}
                  variant={
                    selectedStatus ===
                    (status === "All Status" ? "all" : status.toLowerCase())
                      ? "filled"
                      : "outlined"
                  }
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Actions */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          Quick Actions
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                className={classes.actionCard}
                onClick={() => handleQuickAction(action.action)}
              >
                <CardContent>
                  <Box className={classes.actionIcon}>{action.icon}</Box>
                  <Typography variant="h6" className={classes.actionTitle}>
                    {action.title}
                  </Typography>
                  <Typography className={classes.actionDescription}>
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Live Destination Status */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          Managed Destinations - Live Status
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {filteredDestinations.map((destination) => (
            <Grid item xs={12} md={6} lg={6} key={destination.id}>
              <Card className={classes.destinationCard}>
                <CardContent>
                  <Box className={classes.destinationHeader}>
                    <Box className={classes.destinationInfo}>
                      <Box className={classes.destinationIcon}>🏔️</Box>
                      <Box>
                        <Typography
                          variant="h6"
                          className={classes.destinationName}
                        >
                          {destination.name}
                        </Typography>
                        <Typography className={classes.destinationRegion}>
                          Revenue Today: {destination.revenueToday}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={destination.status.toUpperCase()}
                      sx={{
                        backgroundColor: getStatusColor(destination.status),
                        color: "#ffffff",
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Box className={classes.capacitySection}>
                    <Box className={classes.capacityHeader}>
                      <Typography className={classes.capacityLabel}>
                        Current Visitors: {destination.currentVisitors} /{" "}
                        {destination.maxCapacity}
                      </Typography>
                      <Typography className={classes.waitTime}>
                        Forecast: {destination.forecast}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getCapacityPercentage(
                        destination.currentVisitors,
                        destination.maxCapacity
                      )}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getStatusColor(destination.status),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box className={classes.destinationDetails}>
                    <Box className={classes.highlights}>
                      {destination.alerts.map((alert, idx) => (
                        <Chip
                          key={idx}
                          label={alert}
                          size="small"
                          className={classes.highlightChip}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box className={classes.destinationActions}>
                    <Button
                      variant="contained"
                      className={classes.primaryButton}
                    >
                      Update Status
                    </Button>
                    <Button
                      variant="outlined"
                      className={classes.secondaryButton}
                    >
                      View Report
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Operator Insights */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          Operator Insights & Alerts
        </Typography>
        <Grid container spacing={3}>
          {operatorInsights.map((insight, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Alert
                severity={insight.type}
                className={classes.insightAlert}
                icon={insight.icon}
              >
                <Typography variant="h6">{insight.title}</Typography>
                <Typography>{insight.message}</Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Statistics */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          Operational Statistics
        </Typography>
        <Card className={classes.statsCard}>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    7,460
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Total Visitors Today
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <TrendingUp
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#4CAF50" }}
                    />
                    +12% from yesterday
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    $165K
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Daily Revenue
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <TrendingUp
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#4CAF50" }}
                    />
                    On target
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    4
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Active Sites
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <People
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#2196F3" }}
                    />
                    Fully staffed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    92%
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Sustainability Score
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <CheckCircle
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#4CAF50" }}
                    />
                    Above target
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* CTA Section */}
      <Box className={classes.ctaSection}>
        <Card className={classes.ctaCard}>
          <CardContent>
            <Typography variant="h4" className={classes.ctaTitle}>
              Optimize Your Operations
            </Typography>
            <Typography className={classes.ctaDescription}>
              Use predictive tools and real-time data to enhance sustainability
              and revenue.
            </Typography>
            <Box className={classes.ctaButtons}>
              <Button
                variant="contained"
                size="large"
                className={classes.ctaButton}
              >
                Generate Report
              </Button>
              <Button
                variant="outlined"
                size="large"
                className={classes.ctaSecondaryButton}
              >
                Coordinate Now
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default ManagerHome;
