import React, { useState, useContext, useEffect } from "react";
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
  Button,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { AnalyticsContext } from "../../../shared/context/AnalyticsContext";
import {
  DemandChart,
  StaffingChart,
  PeakSeasonChart,
  ResourceChart,
  RevenueTrendChart,
} from "../../../shared/components/analytics/Charts";
import {
  DemandForecastCard,
  StaffingInsightCard,
  PeakSeasonAnalyticsCard,
  ResourceOptimizationCard,
  PerformanceMetricCard,
  TrendAnalysisCard,
  AlertsCard,
} from "../../../shared/components/analytics/AnalyticsCards";

const AdminAnalytics = () => {
  const {
    demandForecast,
    staffingInsights,
    peakSeasons,
    resourceOptimization,
    loading,
    error,
    fetchDemandForecast,
    fetchStaffingInsights,
    fetchPeakSeasons,
    fetchResourceOptimization,
  } = useContext(AnalyticsContext);

  const [selectedRegion, setSelectedRegion] = useState("all");
  const [timeRange, setTimeRange] = useState("90");
  const [tabValue, setTabValue] = useState(0);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Sample regions for admin view
  const regions = [
    { value: "all", label: "All Regions" },
    { value: "north-island", label: "North Island" },
    { value: "south-island", label: "South Island" },
    { value: "central", label: "Central Region" },
    { value: "coastal", label: "Coastal Areas" },
  ];

  const timeRanges = [
    { value: "30", label: "Last 30 Days" },
    { value: "90", label: "Last 3 Months" },
    { value: "180", label: "Last 6 Months" },
    { value: "365", label: "Last Year" },
    { value: "730", label: "Last 2 Years" },
  ];

  useEffect(() => {
    // Load comprehensive data for admin view
    const loadData = async () => {
      try {
        await Promise.all([
          fetchDemandForecast(selectedRegion, parseInt(timeRange)),
          fetchStaffingInsights(selectedRegion),
          fetchPeakSeasons(selectedRegion),
          fetchResourceOptimization(selectedRegion),
        ]);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      }
    };

    loadData();
  }, [selectedRegion, timeRange]);

  // Auto-refresh functionality
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        if (!loading) {
          console.log("Auto-refreshing analytics data...");
          // Refresh data
        }
      }, 300000); // 5 minutes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loading]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleExportData = () => {
    // Implementation for data export
    console.log("Exporting analytics data...");
  };

  const handleRefresh = () => {
    // Force refresh all data
    console.log("Refreshing all data...");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              System Analytics Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Comprehensive analytics and system-wide insights for Tourism Pulse
              NZ
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExportData}
              size="small"
            >
              Export
            </Button>
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              size="small"
            >
              Settings
            </Button>
          </Box>
        </Box>
      </Box>

      {/* System Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Region</InputLabel>
              <Select
                value={selectedRegion}
                label="Region"
                onChange={handleRegionChange}
              >
                {regions.map((region) => (
                  <MenuItem key={region.value} value={region.value}>
                    {region.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
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
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={realTimeUpdates}
                    onChange={(e) => setRealTimeUpdates(e.target.checked)}
                    size="small"
                  />
                }
                label="Real-time"
                componentsProps={{ typography: { variant: "caption" } }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    size="small"
                  />
                }
                label="Auto-refresh"
                componentsProps={{ typography: { variant: "caption" } }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip label="System Monitoring" color="success" size="small" />
              <Chip label="Predictive Analytics" color="primary" size="small" />
              <Chip label="Advanced Insights" color="secondary" size="small" />
              <Chip label="Export Ready" color="warning" size="small" />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {typeof error === "string"
            ? error
            : error.message || "An error occurred while loading analytics data"}
        </Alert>
      )}

      {/* System Health Status */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "success.light",
          color: "success.contrastText",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <TrendingUpIcon />
          <Typography variant="body2">
            System Status: All services operational • Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="System Overview" />
          <Tab label="Regional Analytics" />
          <Tab label="Predictive Models" />
          <Tab label="Resource Planning" />
          <Tab label="Performance Analytics" />
          <Tab label="System Reports" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {/* System Overview Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {/* System-wide KPIs */}
          <Grid item xs={12} sm={6} lg={3}>
            <PerformanceMetricCard
              title="Total System Users"
              value="45,892"
              change="+12.4%"
              trend="up"
              timeframe="monthly growth"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PerformanceMetricCard
              title="Total Revenue"
              value="$2.3M"
              change="+18.7%"
              trend="up"
              timeframe="quarterly"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PerformanceMetricCard
              title="System Uptime"
              value="99.97%"
              change="+0.02%"
              trend="up"
              timeframe="availability"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <PerformanceMetricCard
              title="API Response Time"
              value="142ms"
              change="-8ms"
              trend="up"
              timeframe="average"
            />
          </Grid>

          {/* Main Dashboard Charts */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System-wide Tourism Trends
              </Typography>
              <RevenueTrendChart
                data={demandForecast?.historical || []}
                height={350}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <AlertsCard
              alerts={[
                {
                  type: "critical",
                  message: "High traffic expected during Christmas week",
                  priority: "high",
                },
                {
                  type: "warning",
                  message: "Database optimization recommended",
                  priority: "medium",
                },
                {
                  type: "info",
                  message: "New features deployed successfully",
                  priority: "low",
                },
                {
                  type: "success",
                  message: "System performance within optimal range",
                  priority: "low",
                },
              ]}
            />
          </Grid>

          {/* Regional Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Regional Performance
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {[
                    {
                      region: "Auckland",
                      visitors: "15,642",
                      growth: "+22%",
                      color: "success",
                    },
                    {
                      region: "Queenstown",
                      visitors: "12,834",
                      growth: "+18%",
                      color: "success",
                    },
                    {
                      region: "Rotorua",
                      visitors: "8,921",
                      growth: "+12%",
                      color: "primary",
                    },
                    {
                      region: "Wellington",
                      visitors: "7,445",
                      growth: "+8%",
                      color: "primary",
                    },
                    {
                      region: "Christchurch",
                      visitors: "6,050",
                      growth: "+3%",
                      color: "warning",
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                    >
                      <Typography variant="body2">{item.region}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight="bold">
                          {item.visitors}
                        </Typography>
                        <Chip
                          label={item.growth}
                          color={item.color}
                          size="small"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Service Health Metrics
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {[
                    {
                      service: "Authentication Service",
                      status: "Healthy",
                      uptime: "99.98%",
                      color: "success",
                    },
                    {
                      service: "Analytics Service",
                      status: "Healthy",
                      uptime: "99.95%",
                      color: "success",
                    },
                    {
                      service: "Destination Service",
                      status: "Healthy",
                      uptime: "99.97%",
                      color: "success",
                    },
                    {
                      service: "Integration Service",
                      status: "Warning",
                      uptime: "99.80%",
                      color: "warning",
                    },
                    {
                      service: "Database Cluster",
                      status: "Healthy",
                      uptime: "99.99%",
                      color: "success",
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                    >
                      <Typography variant="body2">{item.service}</Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="caption">{item.uptime}</Typography>
                        <Chip
                          label={item.status}
                          color={item.color}
                          size="small"
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Regional Analytics Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Cross-Regional Demand Analysis
              </Typography>
              <DemandChart data={demandForecast?.forecast || []} height={400} />
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <DemandForecastCard forecast={demandForecast} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TrendAnalysisCard
              trends={demandForecast?.trends || {}}
              title="Regional Growth Trends"
            />
          </Grid>
        </Grid>
      )}

      {/* Predictive Models Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Peak Season Predictions (National)
              </Typography>
              <PeakSeasonChart
                data={peakSeasons?.predictions || []}
                height={350}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Staffing Optimization Models
              </Typography>
              <StaffingChart
                data={staffingInsights?.recommendations || []}
                height={350}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <PeakSeasonAnalyticsCard peakSeasons={peakSeasons} />
          </Grid>

          <Grid item xs={12} md={4}>
            <StaffingInsightCard insights={staffingInsights} />
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Model Accuracy
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {[
                    {
                      model: "Demand Forecasting",
                      accuracy: "94.2%",
                      color: "success",
                    },
                    {
                      model: "Peak Season Prediction",
                      accuracy: "91.8%",
                      color: "success",
                    },
                    {
                      model: "Staffing Optimization",
                      accuracy: "88.5%",
                      color: "primary",
                    },
                    {
                      model: "Resource Planning",
                      accuracy: "92.1%",
                      color: "success",
                    },
                  ].map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      py={1}
                    >
                      <Typography variant="body2">{item.model}</Typography>
                      <Chip
                        label={item.accuracy}
                        color={item.color}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Resource Planning Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System-wide Resource Allocation
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
              title="System Resource Efficiency"
            />
          </Grid>
        </Grid>
      )}

      {/* Performance Analytics Tab */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <PerformanceMetricCard
              title="Overall Satisfaction"
              value="4.6/5.0"
              change="+0.2"
              trend="up"
              timeframe="system-wide"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <PerformanceMetricCard
              title="Platform Usage"
              value="89.3%"
              change="+5.7%"
              trend="up"
              timeframe="engagement rate"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <PerformanceMetricCard
              title="Data Processing"
              value="2.1M records/day"
              change="+12%"
              trend="up"
              timeframe="throughput"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <PerformanceMetricCard
              title="Cost Efficiency"
              value="$0.14/user"
              change="-$0.03"
              trend="up"
              timeframe="operational cost"
            />
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                System Performance Trends
              </Typography>
              <RevenueTrendChart
                data={demandForecast?.historical || []}
                height={350}
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* System Reports Tab */}
      {tabValue === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Automated Report Generation
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Generate comprehensive reports for stakeholders, regulatory
                compliance, and strategic planning.
              </Typography>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                {[
                  {
                    title: "Monthly Performance Report",
                    description: "Comprehensive monthly analytics",
                    status: "Ready",
                  },
                  {
                    title: "Quarterly Business Intelligence",
                    description: "Strategic insights and trends",
                    status: "Generating",
                  },
                  {
                    title: "Annual Tourism Impact Study",
                    description: "Year-over-year analysis",
                    status: "Scheduled",
                  },
                  {
                    title: "Real-time Dashboard Export",
                    description: "Current system state",
                    status: "Available",
                  },
                ].map((report, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="flex-start"
                        >
                          <Box>
                            <Typography variant="subtitle2" gutterBottom>
                              {report.title}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {report.description}
                            </Typography>
                          </Box>
                          <Chip
                            label={report.status}
                            size="small"
                            color={
                              report.status === "Ready" ||
                              report.status === "Available"
                                ? "success"
                                : "primary"
                            }
                          />
                        </Box>
                        <Button
                          size="small"
                          startIcon={<DownloadIcon />}
                          sx={{ mt: 2 }}
                          disabled={
                            report.status === "Generating" ||
                            report.status === "Scheduled"
                          }
                        >
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default AdminAnalytics;
