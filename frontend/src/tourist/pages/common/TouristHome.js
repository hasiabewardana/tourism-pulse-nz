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
  Divider,
} from "@mui/material";
import {
  Search,
  LocationOn,
  AccessTime,
  People,
  TrendingUp,
  Nature,
} from "@mui/icons-material";
import { useAuth } from "../../../shared/context/AuthContext";
import classes from "./TouristHome.module.css";

// Mock data for popular destinations
const popularDestinations = [
  {
    id: 1,
    name: "Milford Sound",
    region: "Fiordland",
    currentCapacity: 85,
    maxCapacity: 2500,
    status: "busy",
    waitTime: "45 mins",
    image: "🏔️",
    highlights: ["Fjord cruises", "Scenic flights", "Kayaking"],
    sustainabilityScore: 7,
    weatherCondition: "Partly cloudy, 12°C",
  },
  {
    id: 2,
    name: "Bay of Islands",
    region: "Northland",
    currentCapacity: 60,
    maxCapacity: 1800,
    status: "moderate",
    waitTime: "15 mins",
    image: "🏝️",
    highlights: ["Dolphin tours", "Historic sites", "Sailing"],
    sustainabilityScore: 8,
    weatherCondition: "Sunny, 18°C",
  },
  {
    id: 3,
    name: "Rotorua",
    region: "Bay of Plenty",
    currentCapacity: 40,
    maxCapacity: 3200,
    status: "available",
    waitTime: "No wait",
    image: "♨️",
    highlights: ["Geothermal parks", "Māori culture", "Adventure sports"],
    sustainabilityScore: 9,
    weatherCondition: "Overcast, 15°C",
  },
  {
    id: 4,
    name: "Queenstown",
    region: "Otago",
    currentCapacity: 75,
    maxCapacity: 4000,
    status: "busy",
    waitTime: "30 mins",
    image: "🏔️",
    highlights: ["Adventure sports", "Wine tours", "Scenic views"],
    sustainabilityScore: 6,
    weatherCondition: "Clear, 8°C",
  },
];

const quickActions = [
  {
    title: "Find Destinations",
    description: "Search and discover New Zealand's best spots",
    icon: "🔍",
    action: "search",
    color: "primary",
  },
  {
    title: "Check Availability",
    description: "Real-time capacity for popular destinations",
    icon: "📊",
    action: "availability",
    color: "secondary",
  },
  {
    title: "Plan Your Trip",
    description: "Create personalized itineraries",
    icon: "📋",
    action: "plan",
    color: "success",
  },
  {
    title: "Sustainable Options",
    description: "Eco-friendly travel recommendations",
    icon: "🌱",
    action: "sustainable",
    color: "info",
  },
];

const travelInsights = [
  {
    title: "Peak Season Alert",
    message:
      "Summer months (Dec-Feb) see 40% higher visitor numbers. Consider shoulder seasons for better experiences.",
    type: "warning",
    icon: "📈",
  },
  {
    title: "Weather Update",
    message:
      "Current conditions are ideal for outdoor activities in most regions. Check destination-specific forecasts.",
    type: "info",
    icon: "🌤️",
  },
  {
    title: "Sustainability Tip",
    message:
      "Choose destinations with high sustainability scores to minimize your environmental impact.",
    type: "success",
    icon: "♻️",
  },
];

function TouristHome() {
  const { user, role } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "#4CAF50";
      case "moderate":
        return "#FF9800";
      case "busy":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getCapacityPercentage = (current, max) => {
    return (current / max) * 100;
  };

  const handleQuickAction = (action) => {
    // Handle different actions
    console.log(`Quick action: ${action}`);
    // In real app, navigate to appropriate pages or open modals
  };

  const filteredDestinations = popularDestinations.filter(
    (dest) =>
      selectedRegion === "all" ||
      dest.region.toLowerCase().includes(selectedRegion.toLowerCase())
  );

  return (
    <Container maxWidth="lg" className={classes.touristContainer}>
      {/* Welcome Header */}
      <Box className={classes.welcomeHeader}>
        <Box className={classes.welcomeContent}>
          <Typography variant="h2" className={classes.welcomeTitle}>
            Welcome to TourismPulseNZ
          </Typography>
          <Typography variant="h5" className={classes.welcomeSubtitle}>
            {user?.name ? `Hello ${user.name}!` : "Hello Traveler!"} Discover
            New Zealand's best destinations with real-time insights
          </Typography>
        </Box>
        <Box className={classes.userAvatar}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#ffffff",
              color: "#0fa4af",
              fontSize: "2rem",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "🧳"}
          </Avatar>
        </Box>
      </Box>

      {/* Search Bar */}
      <Box className={classes.searchSection}>
        <Card className={classes.searchCard}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search destinations, activities, or regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#0fa4af" }} />
                  </InputAdornment>
                ),
              }}
              className={classes.searchInput}
            />
            <Box className={classes.filterChips}>
              {[
                "All Regions",
                "Northland",
                "Auckland",
                "Bay of Plenty",
                "Fiordland",
                "Otago",
              ].map((region) => (
                <Chip
                  key={region}
                  label={region}
                  onClick={() =>
                    setSelectedRegion(region === "All Regions" ? "all" : region)
                  }
                  className={classes.filterChip}
                  variant={
                    selectedRegion ===
                    (region === "All Regions" ? "all" : region)
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
        <Grid container spacing={3}>
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

      {/* Real-time Destination Status */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          Popular Destinations - Live Status
        </Typography>
        <Grid container spacing={3}>
          {filteredDestinations.map((destination) => (
            <Grid item xs={12} md={6} lg={6} key={destination.id}>
              <Card className={classes.destinationCard}>
                <CardContent>
                  <Box className={classes.destinationHeader}>
                    <Box className={classes.destinationInfo}>
                      <Box className={classes.destinationIcon}>
                        {destination.image}
                      </Box>
                      <Box>
                        <Typography
                          variant="h6"
                          className={classes.destinationName}
                        >
                          {destination.name}
                        </Typography>
                        <Typography className={classes.destinationRegion}>
                          {destination.region}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={destination.status}
                      sx={{
                        backgroundColor: getStatusColor(destination.status),
                        color: "#ffffff",
                        fontWeight: 600,
                        textTransform: "capitalize",
                      }}
                    />
                  </Box>

                  <Box className={classes.capacitySection}>
                    <Box className={classes.capacityHeader}>
                      <Typography className={classes.capacityLabel}>
                        Current Capacity: {destination.currentCapacity}% (
                        {(destination.currentCapacity *
                          destination.maxCapacity) /
                          100}{" "}
                        / {destination.maxCapacity})
                      </Typography>
                      <Typography className={classes.waitTime}>
                        <AccessTime sx={{ fontSize: "1rem", mr: 0.5 }} />
                        {destination.waitTime}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={destination.currentCapacity}
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
                    <Box className={classes.weatherInfo}>
                      <Typography className={classes.weatherText}>
                        🌤️ {destination.weatherCondition}
                      </Typography>
                      <Box className={classes.sustainabilityScore}>
                        <Nature
                          sx={{ fontSize: "1rem", color: "#4CAF50", mr: 0.5 }}
                        />
                        <Typography className={classes.scoreText}>
                          Sustainability: {destination.sustainabilityScore}/10
                        </Typography>
                      </Box>
                    </Box>

                    <Box className={classes.highlights}>
                      {destination.highlights.map((highlight, idx) => (
                        <Chip
                          key={idx}
                          label={highlight}
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
                      startIcon={<LocationOn />}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      className={classes.secondaryButton}
                    >
                      Plan Visit
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Travel Insights */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          Travel Insights & Updates
        </Typography>
        <Grid container spacing={3}>
          {travelInsights.map((insight, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Alert
                severity={insight.type}
                className={classes.insightAlert}
                icon={
                  <span style={{ fontSize: "1.5rem" }}>{insight.icon}</span>
                }
              >
                <Typography variant="h6" className={classes.insightTitle}>
                  {insight.title}
                </Typography>
                <Typography className={classes.insightMessage}>
                  {insight.message}
                </Typography>
              </Alert>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tourism Statistics */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          New Zealand Tourism Insights
        </Typography>
        <Card className={classes.statsCard}>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    3.8M
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Annual Visitors
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <TrendingUp
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#4CAF50" }}
                    />
                    +7% this year
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    $44.4B
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Tourism Revenue
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <TrendingUp
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#4CAF50" }}
                    />
                    Economic impact
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    150+
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Monitored Destinations
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <People
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#2196F3" }}
                    />
                    Real-time tracking
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    89%
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Satisfaction Rate
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <Nature
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#4CAF50" }}
                    />
                    Sustainable tourism
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Footer CTA */}
      <Box className={classes.ctaSection}>
        <Card className={classes.ctaCard}>
          <CardContent>
            <Typography variant="h4" className={classes.ctaTitle}>
              Ready to Explore New Zealand?
            </Typography>
            <Typography className={classes.ctaDescription}>
              Start planning your sustainable journey with real-time insights
              and personalized recommendations.
            </Typography>
            <Box className={classes.ctaButtons}>
              <Button
                variant="contained"
                size="large"
                className={classes.ctaButton}
              >
                Start Planning
              </Button>
              <Button
                variant="outlined"
                size="large"
                className={classes.ctaSecondaryButton}
              >
                Explore Destinations
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default TouristHome;
