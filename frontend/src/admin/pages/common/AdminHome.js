import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  SupervisedUserCircle,
  BarChart,
  Settings,
  Warning,
  CheckCircle,
  TrendingUp, // Added missing import
} from "@mui/icons-material";
import { useAuth } from "../../../shared/context/AuthContext";
import classes from "./AdminHome.module.css";

// Mock data for system overview
const systemOverview = [
  {
    id: 1,
    region: "Northland",
    totalVisitors: 15000,
    maxCapacity: 20000,
    status: "moderate",
    revenue: "$500K",
    compliance: "95%",
  },
  {
    id: 2,
    region: "Fiordland",
    totalVisitors: 18000,
    maxCapacity: 25000,
    status: "high",
    revenue: "$750K",
    compliance: "88%",
  },
  {
    id: 3,
    region: "Otago",
    totalVisitors: 22000,
    maxCapacity: 30000,
    status: "high",
    revenue: "$900K",
    compliance: "92%",
  },
];

const quickActions = [
  {
    title: "Manage Users",
    description: "Control access and roles",
    icon: <SupervisedUserCircle fontSize="large" />,
    action: "users",
    color: "primary",
  },
  {
    title: "View Analytics",
    description: "Global performance metrics",
    icon: <BarChart fontSize="large" />,
    action: "analytics",
    color: "secondary",
  },
  {
    title: "Update Policies",
    description: "Set sustainability and capacity rules",
    icon: <Settings fontSize="large" />,
    action: "policies",
    color: "success",
  },
];

const adminInsights = [
  {
    title: "Compliance Alert",
    message: "Two regions below 90% sustainability compliance.",
    type: "warning",
    icon: <Warning />,
  },
  {
    title: "Performance Update",
    message: "Overall visitor growth by 10% this month.",
    type: "info",
    icon: <BarChart />,
  },
  {
    title: "System Check",
    message: "All servers operational with 99% uptime.",
    type: "success",
    icon: <CheckCircle />,
  },
];

function AdminHome() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
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
    console.log(`Admin action: ${action}`);
    switch (action) {
      case "analytics":
        navigate("/admin/analytics");
        break;
      case "user-management":
        navigate("/admin/user-management");
        break;
      case "destination-management":
        navigate("/admin/destination-management");
        break;
      case "booking-management":
        navigate("/admin/booking-management");
        break;
      case "reports":
        navigate("/admin/reports");
        break;
      default:
        console.log(`Action ${action} not implemented yet`);
    }
  };

  const filteredOverview = systemOverview.filter(
    (region) =>
      (selectedStatus === "all" || region.status === selectedStatus) &&
      region.region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" className={classes.adminContainer}>
      {/* Welcome Header */}
      <Box className={classes.welcomeHeader}>
        <Box className={classes.welcomeContent}>
          <Typography variant="h2" className={classes.welcomeTitle}>
            Welcome to TourismPulseNZ Admin Panel
          </Typography>
          <Typography variant="h5" className={classes.welcomeSubtitle}>
            {user?.name ? `Hello ${user.name}!` : "Hello Admin!"} Oversee New
            Zealand's tourism ecosystem.
          </Typography>
        </Box>
        <Box className={classes.userAvatar}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#48d9f3",
              color: "#ffffff",
              fontSize: "2rem",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
          </Avatar>
        </Box>
      </Box>

      {/* Search Section */}
      <Box className={classes.searchSection}>
        <Card className={classes.searchCard}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search regions or sites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#48d9f3" }} />
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
            <Grid item xs={12} sm={6} md={4} key={index}>
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

      {/* Live Overview */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          System-Wide Overview
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {filteredOverview.map((region) => (
            <Grid item xs={12} md={6} lg={4} key={region.id}>
              <Card className={classes.overviewCard}>
                <CardContent>
                  <Box className={classes.overviewHeader}>
                    <Typography variant="h6" className={classes.overviewName}>
                      {region.region}
                    </Typography>
                    <Chip
                      label={region.status.toUpperCase()}
                      sx={{
                        backgroundColor: getStatusColor(region.status),
                        color: "#ffffff",
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Box className={classes.capacitySection}>
                    <Box className={classes.capacityHeader}>
                      <Typography className={classes.capacityLabel}>
                        Visitors: {region.totalVisitors} / {region.maxCapacity}
                      </Typography>
                      <Typography className={classes.revenueText}>
                        Revenue: {region.revenue}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getCapacityPercentage(
                        region.totalVisitors,
                        region.maxCapacity
                      )}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getStatusColor(region.status),
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>

                  <Box className={classes.complianceSection}>
                    <Typography className={classes.complianceText}>
                      Compliance: {region.compliance}
                    </Typography>
                  </Box>

                  <Box className={classes.overviewActions}>
                    <Button
                      variant="contained"
                      className={classes.primaryButton}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Admin Insights */}
      <Box className={classes.section}>
        <Typography variant="h3" className={classes.sectionTitle}>
          Admin Insights & Alerts
        </Typography>
        <Grid container spacing={3}>
          {adminInsights.map((insight, index) => (
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
          TourismPulseNZ Statistics
        </Typography>
        <Card className={classes.statsCard}>
          <CardContent>
            <Grid container spacing={4}>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    55,000
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Total Visitors
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <TrendingUp
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#4CAF50" }}
                    />
                    +10% this month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    $2.15M
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Total Revenue
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
                    12
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Active Regions
                  </Typography>
                  <Typography className={classes.statTrend}>
                    <SupervisedUserCircle
                      sx={{ fontSize: "1rem", mr: 0.5, color: "#2196F3" }}
                    />
                    Fully monitored
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box className={classes.statItem}>
                  <Typography variant="h4" className={classes.statNumber}>
                    91%
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Average Compliance
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
              Enhance System Oversight
            </Typography>
            <Typography className={classes.ctaDescription}>
              Leverage real-time data and analytics to optimize New Zealand's
              tourism network.
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
                Manage Policies
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default AdminHome;
