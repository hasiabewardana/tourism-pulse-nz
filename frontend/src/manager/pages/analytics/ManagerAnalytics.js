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
  Place,
  Star,
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
} from "recharts";
import classes from "./ManagerAnalytics.module.css";

const ManagerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [days] = useState(30);

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAnalyticsData();
  }, [days]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/analytics-service/api/operator/${userId}/dashboard?days=${days}`,
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

  if (!data || !data.overview) {
    return (
      <Box className={classes.container}>
        <Box className={classes.innerContainer}>
          <Alert severity="info">No analytics data available</Alert>
        </Box>
      </Box>
    );
  }

  const { overview, revenueChart, topDestinations, bookingTrend } = data;

  return (
    <Box className={classes.container}>
      <Box className={classes.innerContainer}>
        <Box className={classes.header}>
          <Typography variant="h3" className={classes.title}>
            Analytics Dashboard
          </Typography>
          <Typography variant="subtitle1" className={classes.subtitle}>
            Last {days} days performance overview
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Revenue"
              value={`$${parseFloat(
                overview.totalRevenue || 0
              ).toLocaleString()}`}
              subtitle={`${overview.revenueGrowth}% vs previous period`}
              trend={parseFloat(overview.revenueGrowth || 0)}
              icon={<AttachMoney sx={{ color: "#48d9f3", fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bookings"
              value={overview.totalBookings || 0}
              subtitle={`Avg $${parseFloat(
                overview.avgBookingValue || 0
              ).toFixed(2)} per booking`}
              icon={<BookOnline sx={{ color: "#48d9f3", fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Destinations"
              value={overview.activeDestinations || 0}
              subtitle={`${overview.avgOccupancy}% avg occupancy`}
              icon={<Place sx={{ color: "#48d9f3", fontSize: 32 }} />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Average Rating"
              value={overview.avgRating || "0.0"}
              subtitle="Overall satisfaction"
              icon={<Star sx={{ color: "#48d9f3", fontSize: 32 }} />}
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
                Top Destinations
              </Typography>
              <Box sx={{ mt: 2 }}>
                {topDestinations && topDestinations.length > 0 ? (
                  topDestinations.map((dest, index) => (
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
                          {dest.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#82c2ce" }}>
                          {dest.bookings} bookings • {dest.occupancy}% occupied
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center">
                        <Star
                          sx={{ color: "#ffc107", fontSize: 16, mr: 0.5 }}
                        />
                        <Typography variant="body2" sx={{ color: "#ffffff" }}>
                          {dest.rating ? dest.rating.toFixed(1) : "N/A"}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: "#82c2ce" }}>
                    No destination data available
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

export default ManagerAnalytics;
