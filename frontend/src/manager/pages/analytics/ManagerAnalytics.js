import React, { useState, useContext, useEffect } from "react";
import {
  DemandForecastCard,
  StaffingInsightCard,
  PeakSeasonAnalyticsCard,
  ResourceOptimizationCard,
  PerformanceMetricCard,
  TrendAnalysisCard,
  AlertsCard,
} from "../../../shared/components/analytics/AnalyticsCards";
import StatsNZInsights from "../../components/StatsNZInsights";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { AnalyticsContext } from "../../../shared/context/AnalyticsContext";
import {
  DemandChart,
  StaffingChart,
  PeakSeasonChart,
  ResourceChart,
  RevenueTrendChart,
} from "../../../shared/components/analytics/Charts";
import classes from "./ManagerAnalytics.module.css";

const ManagerAnalytics = () => {
  const {
    demandForecast,
    staffingRecommendations: staffingInsights,
    peakSeasons,
    resourceUtilization: resourceOptimization,
    loading,
    error,
    fetchDemandForecast,
    fetchStaffingRecommendations: fetchStaffingInsights,
    fetchPeakSeasons,
    fetchResourceUtilization: fetchResourceOptimization,
  } = useContext(AnalyticsContext);

  const [selectedDestination, setSelectedDestination] = useState("all");
  const [timeRange, setTimeRange] = useState("30");
  const [tabValue, setTabValue] = useState(0);

  // Sample destinations for the dropdown
  const destinations = [
    { value: "all", label: "All Destinations" },
    { value: "queenstown", label: "Queenstown" },
    { value: "rotorua", label: "Rotorua" },
    { value: "auckland", label: "Auckland" },
    { value: "wellington", label: "Wellington" },
    { value: "christchurch", label: "Christchurch" },
  ];

  const timeRanges = [
    { value: "7", label: "Last 7 Days" },
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 3 Months" },
    { value: "365", label: "Last Year" },
  ];

  useEffect(() => {
    // Load initial data
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDemandForecast(selectedDestination, parseInt(timeRange)),
          fetchStaffingInsights(selectedDestination),
          fetchPeakSeasons(selectedDestination),
          fetchResourceOptimization(selectedDestination),
        ]);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      }
    };

    loadData();
  }, [selectedDestination, timeRange]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDestinationChange = (event) => {
    setSelectedDestination(event.target.value);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress size={60} className={classes.loadingSpinner} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Box className={classes.innerContainer}>
        <Box className={classes.header}>
          <Typography variant="h3" className={classes.title}>
            Manager Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            Monitor performance, forecast demand, and optimize resources
          </Typography>
        </Box>

        <Paper className={classes.filterPaper}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Destination</InputLabel>
                <Select
                  value={selectedDestination}
                  label="Destination"
                  onChange={handleDestinationChange}
                >
                  {destinations.map((dest) => (
                    <MenuItem key={dest.value} value={dest.value}>
                      {dest.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={handleTimeRangeChange}
                >
                  {timeRanges.map((range) => (
                    <MenuItem key={range.value} value={range.value}>
                      {range.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip label="Real-time Updates" color="success" size="small" />
                <Chip
                  label="Predictive Analytics"
                  color="primary"
                  size="small"
                />
                <Chip
                  label="Resource Optimization"
                  color="secondary"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" className={classes.errorAlert}>
            {typeof error === "string"
              ? error
              : error.message ||
                "An error occurred while loading analytics data"}
          </Alert>
        )}

        {/* Tabs */}
        <Paper className={classes.tabsPaper}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Overview" />
            <Tab label="Demand Forecasting" />
            <Tab label="Staffing Analytics" />
            <Tab label="Resource Management" />
            <Tab label="Performance Insights" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {/* Overview Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Key Performance Cards */}
            <Grid item xs={12} sm={6} lg={3}>
              <PerformanceMetricCard
                title="Total Visitors"
                value="12,845"
                change="+15.3%"
                trend="up"
                timeframe="vs last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <PerformanceMetricCard
                title="Revenue"
                value="$485,320"
                change="+8.7%"
                trend="up"
                timeframe="vs last month"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <PerformanceMetricCard
                title="Staff Efficiency"
                value="87.5%"
                change="+3.2%"
                trend="up"
                timeframe="optimal level"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <PerformanceMetricCard
                title="Resource Utilization"
                value="92.1%"
                change="-2.1%"
                trend="down"
                timeframe="capacity usage"
              />
            </Grid>

            {/* Charts */}
            <Grid item xs={12} lg={8}>
              <Paper className={classes.contentPaper}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Visitor Trends & Revenue
                </Typography>
                <RevenueTrendChart
                  data={demandForecast?.historical || []}
                  height={300}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <AlertsCard
                alerts={[
                  {
                    type: "warning",
                    message: "Peak season approaching - increase staff by 25%",
                    priority: "high",
                  },
                  {
                    type: "info",
                    message: "New marketing campaign showing positive results",
                    priority: "medium",
                  },
                  {
                    type: "success",
                    message: "Resource optimization target achieved",
                    priority: "low",
                  },
                ]}
              />
            </Grid>

            {/* Quick Insights */}
            <Grid item xs={12} md={6}>
              <DemandForecastCard forecast={demandForecast} />
            </Grid>
            <Grid item xs={12} md={6}>
              <StaffingInsightCard insights={staffingInsights} />
            </Grid>

            {/* Stats NZ National Tourism Insights */}
            <Grid item xs={12}>
              <Paper
                className={classes.contentPaper}
                sx={{ p: 0, overflow: "hidden" }}
              >
                <StatsNZInsights />
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Demand Forecasting Tab */}
        {tabValue === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.contentPaper}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Demand Forecast Analysis
                </Typography>
                <DemandChart
                  data={demandForecast?.forecast || []}
                  height={400}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <DemandForecastCard forecast={demandForecast} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TrendAnalysisCard
                trends={demandForecast?.trends || {}}
                title="Demand Trends"
              />
            </Grid>
          </Grid>
        )}

        {/* Staffing Analytics Tab */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.contentPaper}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Staffing Requirements & Efficiency
                </Typography>
                <StaffingChart
                  data={staffingInsights?.recommendations || []}
                  height={400}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <StaffingInsightCard insights={staffingInsights} />
            </Grid>

            <Grid item xs={12} md={6}>
              <PerformanceMetricCard
                title="Staff Productivity"
                value="94.2%"
                change="+5.8%"
                trend="up"
                timeframe="efficiency score"
              />
            </Grid>
          </Grid>
        )}

        {/* Resource Management Tab */}
        {tabValue === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper className={classes.contentPaper}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Resource Allocation & Optimization
                </Typography>
                <ResourceChart
                  data={resourceOptimization?.allocation || []}
                  height={400}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <ResourceOptimizationCard optimization={resourceOptimization} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TrendAnalysisCard
                trends={resourceOptimization?.efficiency || {}}
                title="Resource Efficiency Trends"
              />
            </Grid>
          </Grid>
        )}

        {/* Performance Insights Tab */}
        {tabValue === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <PerformanceMetricCard
                title="Visitor Satisfaction"
                value="4.7/5.0"
                change="+0.3"
                trend="up"
                timeframe="rating score"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <PerformanceMetricCard
                title="Booking Conversion"
                value="23.8%"
                change="+2.1%"
                trend="up"
                timeframe="conversion rate"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <PerformanceMetricCard
                title="Average Stay"
                value="3.2 days"
                change="+0.4"
                trend="up"
                timeframe="duration"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <PerformanceMetricCard
                title="Repeat Visitors"
                value="34.5%"
                change="+1.8%"
                trend="up"
                timeframe="return rate"
              />
            </Grid>

            <Grid item xs={12} lg={8}>
              <Paper className={classes.contentPaper}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Peak Season Predictions
                </Typography>
                <PeakSeasonChart
                  data={peakSeasons?.predictions || []}
                  height={350}
                />
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <PeakSeasonAnalyticsCard peakSeasons={peakSeasons} />
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default ManagerAnalytics;
