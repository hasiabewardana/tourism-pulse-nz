import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  Grid,
  CircularProgress,
  Chip,
  Rating,
} from "@mui/material";
import { LocationOn, TrendingUp } from "@mui/icons-material";
import recommendationService from "../../../util/recommendationService";
import analyticsService from "../../../util/analyticsService";

/**
 * Similar Destinations Component
 * Shows destinations similar to the current one
 */
const SimilarDestinations = ({ destinationId, onDestinationClick }) => {
  const [similarDestinations, setSimilarDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (destinationId) {
      loadSimilarDestinations();
    }
  }, [destinationId]);

  const loadSimilarDestinations = async () => {
    setLoading(true);

    try {
      const response = await recommendationService.getSimilarDestinations(
        destinationId,
        5
      );

      if (response.success) {
        setSimilarDestinations(response.similar);
      }
    } catch (error) {
      console.error("Error loading similar destinations:", error);
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
        source: "similar_destinations",
        sourceDestinationId: destinationId,
      },
    });

    if (onDestinationClick) {
      onDestinationClick(destination);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (similarDestinations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        🎯 Similar Destinations You Might Like
      </Typography>

      <Grid container spacing={2}>
        {similarDestinations.map((destination) => (
          <Grid item xs={12} sm={6} md={4} key={destination.destination_id}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
            >
              <CardActionArea
                onClick={() => handleDestinationClick(destination)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={
                    destination.photos?.[0] || "/tourism-pulse-nz-logo.png"
                  }
                  alt={destination.name}
                />

                <CardContent>
                  <Typography variant="subtitle1" gutterBottom noWrap>
                    {destination.name}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOn
                      sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {destination.region || "New Zealand"}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <Rating
                      value={destination.rating || 0}
                      precision={0.5}
                      size="small"
                      readOnly
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      ({destination.review_count || 0})
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {destination.association_strength && (
                      <Chip
                        label={`${Math.round(
                          destination.association_strength * 100
                        )}% similar`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    {destination.trending_score > 50 && (
                      <Chip
                        icon={<TrendingUp />}
                        label="Trending"
                        size="small"
                        color="warning"
                      />
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SimilarDestinations;
