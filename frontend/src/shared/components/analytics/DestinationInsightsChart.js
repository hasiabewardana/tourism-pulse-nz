import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";
import {
  Visibility,
  TouchApp,
  Bookmark,
  Share,
  TrendingUp,
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
import analyticsService from "../../../util/analyticsService";

/**
 * Destination Insights Chart Component
 * Displays analytics and performance metrics for a destination
 */
const DestinationInsightsChart = ({ destinationId, days = 7 }) => {
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (destinationId) {
      loadInsights();
    }
  }, [destinationId, days]);

  const loadInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await analyticsService.getDestinationInsights(
        destinationId,
        days
      );

      if (response.success) {
        processInsights(response.insights);
      } else {
        setError("Failed to load insights");
      }
    } catch (err) {
      console.error("Error loading insights:", err);
      setError("An error occurred while loading insights");
    } finally {
      setLoading(false);
    }
  };

  const processInsights = (data) => {
    // Group data by date and interaction type
    const dateMap = {};
    let totalViews = 0;
    let totalClicks = 0;
    let totalBookmarks = 0;
    let totalShares = 0;
    let totalDuration = 0;
    let durationCount = 0;

    data.forEach((item) => {
      const date = item._id.date;
      const type = item._id.type;

      if (!dateMap[date]) {
        dateMap[date] = {
          date,
          views: 0,
          clicks: 0,
          bookmarks: 0,
          shares: 0,
        };
      }

      dateMap[date][type + "s"] = item.count;

      // Calculate totals
      if (type === "view") {
        totalViews += item.count;
        totalDuration += item.avgDuration * item.count;
        durationCount += item.count;
      } else if (type === "click") {
        totalClicks += item.count;
      } else if (type === "bookmark") {
        totalBookmarks += item.count;
      } else if (type === "share") {
        totalShares += item.count;
      }
    });

    const chartData = Object.values(dateMap).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    setInsights(chartData);
    setSummary({
      totalViews,
      totalClicks,
      totalBookmarks,
      totalShares,
      avgDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      conversionRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
    });
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!summary || insights.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No analytics data available for this destination
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center" }}
      >
        <TrendingUp sx={{ mr: 1 }} />
        Analytics Insights (Last {days} Days)
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Visibility sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="h4">{summary.totalViews}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Views
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TouchApp sx={{ mr: 1, color: "success.main" }} />
                <Typography variant="h4">{summary.totalClicks}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total Clicks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Bookmark sx={{ mr: 1, color: "warning.main" }} />
                <Typography variant="h4">{summary.totalBookmarks}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Bookmarks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Share sx={{ mr: 1, color: "info.main" }} />
                <Typography variant="h4">{summary.totalShares}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Shares
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h5" color="primary">
              {summary.conversionRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click-through Rate
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6}>
          <Paper sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h5" color="primary">
              {Math.round(summary.avgDuration)}s
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg. View Duration
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Interaction Trends Line Chart */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Interaction Trends
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={insights}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#1976d2"
              name="Views"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#2e7d32"
              name="Clicks"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="bookmarks"
              stroke="#ed6c02"
              name="Bookmarks"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="shares"
              stroke="#0288d1"
              name="Shares"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {/* Daily Activity Bar Chart */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Daily Activity Breakdown
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={insights}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="views" fill="#1976d2" name="Views" />
            <Bar dataKey="clicks" fill="#2e7d32" name="Clicks" />
            <Bar dataKey="bookmarks" fill="#ed6c02" name="Bookmarks" />
            <Bar dataKey="shares" fill="#0288d1" name="Shares" />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default DestinationInsightsChart;
