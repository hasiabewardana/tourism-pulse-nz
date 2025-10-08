import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Grid,
} from "@mui/material";
import { TrendingUp, Search } from "@mui/icons-material";
import analyticsService from "../../../util/analyticsService";

/**
 * Trending Searches Component
 * Displays popular search queries
 */
const TrendingSearches = ({ onSearchClick }) => {
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingSearches();
  }, []);

  const loadTrendingSearches = async () => {
    setLoading(true);

    try {
      const response = await analyticsService.getTrendingSearches(10);

      if (response.success) {
        setTrendingSearches(response.trending);
      }
    } catch (error) {
      console.error("Error loading trending searches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = (searchQuery) => {
    if (onSearchClick) {
      onSearchClick(searchQuery);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress size={30} />
        </Box>
      </Paper>
    );
  }

  if (trendingSearches.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <TrendingUp sx={{ mr: 1, color: "warning.main" }} />
        <Typography variant="h6" component="h3">
          Trending Searches
        </Typography>
      </Box>

      <Grid container spacing={1}>
        {trendingSearches.map((item, index) => (
          <Grid item key={index}>
            <Chip
              icon={<Search />}
              label={`${item._id} (${item.count})`}
              onClick={() => handleSearchClick(item._id)}
              clickable
              color={index < 3 ? "primary" : "default"}
              variant={index < 3 ? "filled" : "outlined"}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default TrendingSearches;
