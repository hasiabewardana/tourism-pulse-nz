import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Paper,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Rating,
  Divider,
} from "@mui/material";
import {
  Recommend,
  TrendingUp,
  LocationOn,
  AttachMoney,
  Star,
} from "@mui/icons-material";
import recommendationService from "../../../util/recommendationService";
import analyticsService from "../../../util/analyticsService";

/**
 * Recommendations List Component
 * Displays personalized recommendations with scores and reasons
 */
const RecommendationsList = ({ preferences, onDestinationClick }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, [preferences]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        topN: 10,
        ...preferences,
      };

      const response = await recommendationService.getRecommendations(params);

      if (response.success) {
        setRecommendations(response.recommendations);
      } else {
        setError("Failed to load recommendations");
      }
    } catch (err) {
      console.error("Error loading recommendations:", err);
      setError("An error occurred while loading recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationClick = async (destination) => {
    // Track interaction
    await analyticsService.trackInteraction({
      destinationId: destination.destination_id,
      interactionType: "click",
      metadata: {
        source: "recommendations",
        score: destination.score,
      },
    });

    if (onDestinationClick) {
      onDestinationClick(destination);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "primary";
    if (score >= 40) return "warning";
    return "default";
  };

  const getPriceDisplay = (destination) => {
    if (
      destination.price_range === "free" ||
      destination.estimated_cost === 0
    ) {
      return "FREE";
    }
    return destination.price_range
      ? destination.price_range.toUpperCase()
      : `$${destination.estimated_cost || "N/A"}`;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Recommend sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Recommendations Found
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your preferences or filters
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Recommend sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h5" component="h2">
          Recommended for You
        </Typography>
        <Chip
          label={`${recommendations.length} destinations`}
          size="small"
          sx={{ ml: 2 }}
        />
      </Box>

      <Grid container spacing={3}>
        {recommendations.map((destination, index) => (
          <Grid item xs={12} sm={6} md={4} key={destination.destination_id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
            >
              {/* Match Score Badge */}
              <Chip
                icon={<Star />}
                label={`${Math.round(destination.score)}% Match`}
                color={getScoreColor(destination.score)}
                size="small"
                sx={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  zIndex: 1,
                  fontWeight: "bold",
                }}
              />

              {/* Ranking Badge */}
              {index < 3 && (
                <Chip
                  label={`#${index + 1}`}
                  color="secondary"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    zIndex: 1,
                  }}
                />
              )}

              {/* Destination Image */}
              <CardMedia
                component="img"
                height="200"
                image={destination.photos?.[0] || "/tourism-pulse-nz-logo.png"}
                alt={destination.name}
                sx={{ objectFit: "cover" }}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                {/* Destination Name */}
                <Typography variant="h6" component="h3" gutterBottom>
                  {destination.name}
                </Typography>

                {/* Location */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <LocationOn
                    sx={{ fontSize: 18, mr: 0.5, color: "text.secondary" }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {destination.region ||
                      destination.location_name ||
                      "New Zealand"}
                  </Typography>
                </Box>

                {/* Rating */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Rating
                    value={destination.rating || 0}
                    precision={0.5}
                    size="small"
                    readOnly
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({destination.review_count || 0} reviews)
                  </Typography>
                </Box>

                {/* Price & Category */}
                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  {destination.category && (
                    <Chip
                      label={destination.category}
                      size="small"
                      variant="outlined"
                    />
                  )}
                  <Chip
                    icon={<AttachMoney />}
                    label={getPriceDisplay(destination)}
                    size="small"
                    variant="outlined"
                    color={
                      destination.price_range === "free" ? "success" : "default"
                    }
                  />
                  {destination.trending_score > 50 && (
                    <Chip
                      icon={<TrendingUp />}
                      label="Trending"
                      size="small"
                      color="warning"
                    />
                  )}
                </Box>

                <Divider sx={{ my: 1 }} />

                {/* Recommendation Reasons */}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: "bold", display: "block", mb: 0.5 }}
                >
                  Why recommended:
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {destination.reasons?.slice(0, 3).map((reason, idx) => (
                    <Typography
                      key={idx}
                      variant="caption"
                      color="primary"
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      • {reason}
                    </Typography>
                  ))}
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleDestinationClick(destination)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RecommendationsList;
