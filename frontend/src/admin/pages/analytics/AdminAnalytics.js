import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AttachMoney,
  BookOnline,
  People,
  Business,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import classes from "./AdminAnalytics.module.css";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [days] = useState(30);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAnalyticsData();
  }, [days]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/analytics/api/admin/dashboard?days=${days}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch analytics");

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, trend }) => (
    <Card
      sx={{
        backgroundColor: "#282f33",
        border: "1px solid rgba(72, 217, 243, 0.1)",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "rgba(72, 217, 243, 0.2)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" sx={{ color: "#bdd1d4", mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: "#ffffff", fontWeight: 600 }}>
              {value}
            </Typography>
            {subtitle && (
              <Box display="flex" alignItems="center" mt={0.5}>
                {trend > 0 ? (
                  <TrendingUp
                    sx={{ color: "#4caf50", fontSize: 18, mr: 0.5 }}
                  />
                ) : trend < 0 ? (
                  <TrendingDown
                    sx={{ color: "#f44336", fontSize: 18, mr: 0.5 }}
                  />
                ) : null}
                <Typography variant="caption" sx={{ color: "#82c2ce" }}>
                  {subtitle}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: "#374549",
              borderRadius: "50%",
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box className={classes.loadingContainer}>
        <CircularProgress size={60} className={classes.loadingSpinner} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.container}>
        <Box className={classes.innerContainer}>
          <Alert severity="error" className={classes.errorAlert}>
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  if (!data || !data.platform) {
    return (
      <Box className={classes.container}>
        <Box className={classes.innerContainer}>
          <Alert severity="info">No analytics data available</Alert>
        </Box>
      </Box>
    );
  }

  const { platform, revenueChart, operatorPerformance, bookingTrend } = data;

  const COLORS = ["#48d9f3", "#4caf50", "#ffc107", "#f44336", "#9c27b0"];

  return (
    <Box className={classes.container}>
      <Box className={classes.innerContainer}>
        <Box className={classes.header}>
          <Typography variant="h3" className={classes.title}>
            Platform Analytics
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            Last {days} days platform-wide overview
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`$${parseFloat(
                platform.totalRevenue || 0
              ).toLocaleString()}`}
              subtitle={`${platform.revenueGrowth}% vs previous period`}
              trend={parseFloat(platform.revenueGrowth || 0)}
              icon={<AttachMoney sx={{ color: "#48d9f3", fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bookings"
              value={platform.totalBookings || 0}
              subtitle={`Avg $${parseFloat(
                platform.avgBookingValue || 0
              ).toFixed(2)} per booking`}
              icon={<BookOnline sx={{ color: "#48d9f3", fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Operators"
              value={platform.totalOperators || 0}
              subtitle={`${platform.totalDestinations || 0} destinations`}
              icon={<Business sx={{ color: "#48d9f3", fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={platform.totalUsers || 0}
              subtitle="Platform users"
              icon={<People sx={{ color: "#48d9f3", fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} lg={8}>
            <Paper className={classes.contentPaper}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Revenue Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueChart || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374549" />
                  <XAxis
                    dataKey="date"
                    stroke="#bdd1d4"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-NZ", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis stroke="#bdd1d4" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#282f33",
                      border: "1px solid #48d9f3",
                      borderRadius: "4px",
                      color: "#ffffff",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#48d9f3"
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#4caf50"
                    strokeWidth={2}
                    name="Bookings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper className={classes.contentPaper}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Top Operators
              </Typography>
              <Box sx={{ mt: 2 }}>
                {operatorPerformance && operatorPerformance.length > 0 ? (
                  operatorPerformance.slice(0, 5).map((operator, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1.5,
                        mb: 1,
                        backgroundColor: "#374549",
                        borderRadius: "4px",
                        border: "1px solid rgba(72, 217, 243, 0.1)",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ color: "#ffffff", fontWeight: 500 }}
                        >
                          {operator.operatorName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#82c2ce" }}>
                          {operator.destinations} destinations
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" sx={{ color: "#ffffff" }}>
                          ${parseFloat(operator.revenue || 0).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#82c2ce" }}>
                          {operator.bookings} bookings
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: "#82c2ce" }}>
                    No operator data available
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {bookingTrend && bookingTrend.length > 0 && (
            <Grid item xs={12}>
              <Paper className={classes.contentPaper}>
                <Typography variant="h6" className={classes.sectionTitle}>
                  Weekly Booking Trend
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={bookingTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374549" />
                    <XAxis
                      dataKey="week"
                      stroke="#bdd1d4"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("en-NZ", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                    />
                    <YAxis stroke="#bdd1d4" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#282f33",
                        border: "1px solid #48d9f3",
                        borderRadius: "4px",
                        color: "#ffffff",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="bookings" fill="#48d9f3" name="Bookings" />
                    <Bar dataKey="revenue" fill="#4caf50" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminAnalytics;
