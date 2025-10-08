import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore,
  FilterList,
  Clear,
  Search,
  TrendingUp,
} from "@mui/icons-material";
import recommendationService from "../../../util/recommendationService";
import { NZ_REGIONS } from "../../../util/regionParser";

/**
 * Advanced Filter Panel Component
 * Provides comprehensive filtering options for destination search
 */
function AdvancedFilterPanel({ onFilterChange, onReset }) {
  const [filters, setFilters] = useState({
    searchQuery: "",
    categories: [],
    tags: [],
    regions: [],
    minPrice: "",
    maxPrice: "",
    priceRange: "",
    minRating: 0,
    minReviews: 0,
    isIndoor: false,
    isOutdoor: false,
    wheelchairAccessible: false,
    familyFriendly: false,
    petFriendly: false,
    parkingAvailable: false,
    publicTransportNearby: false,
    minCapacity: "",
    trendingOnly: false,
    sortBy: "rating",
    sortOrder: "DESC",
  });

  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    tags: [],
    priceRanges: ["free", "budget", "moderate", "premium"],
  });

  const [expanded, setExpanded] = useState({
    basic: true,
    location: false,
    price: false,
    rating: false,
    accessibility: false,
    environment: false,
  });

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await recommendationService.getFilterOptions();
      if (response.success) {
        setFilterOptions(response.options);
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMultiSelectChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleApplyFilters = () => {
    // Clean up filters (remove empty values)
    const cleanedFilters = Object.entries(filters).reduce(
      (acc, [key, value]) => {
        if (
          value !== "" &&
          value !== 0 &&
          value !== false &&
          !(Array.isArray(value) && value.length === 0)
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    onFilterChange(cleanedFilters);
  };

  const handleResetFilters = () => {
    const resetFilters = {
      searchQuery: "",
      categories: [],
      tags: [],
      regions: [],
      minPrice: "",
      maxPrice: "",
      priceRange: "",
      minRating: 0,
      minReviews: 0,
      isIndoor: false,
      isOutdoor: false,
      wheelchairAccessible: false,
      familyFriendly: false,
      petFriendly: false,
      parkingAvailable: false,
      publicTransportNearby: false,
      minCapacity: "",
      trendingOnly: false,
      sortBy: "rating",
      sortOrder: "DESC",
    };

    setFilters(resetFilters);
    onReset();
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded((prev) => ({
      ...prev,
      [panel]: isExpanded,
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <FilterList sx={{ mr: 1 }} />
        <Typography variant="h6" component="h2">
          Advanced Filters
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Reset all filters">
          <IconButton onClick={handleResetFilters} size="small">
            <Clear />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Basic Search */}
      <Accordion
        expanded={expanded.basic}
        onChange={handleAccordionChange("basic")}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>🔍 Search & Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search destinations"
                placeholder="Enter name, description..."
                value={filters.searchQuery}
                onChange={(e) =>
                  handleFilterChange("searchQuery", e.target.value)
                }
                InputProps={{
                  startAdornment: (
                    <Search sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={filters.categories}
                  onChange={(e) =>
                    handleFilterChange("categories", e.target.value)
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {filterOptions.categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {filterOptions.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onClick={() => handleMultiSelectChange("tags", tag)}
                    color={filters.tags.includes(tag) ? "primary" : "default"}
                    variant={filters.tags.includes(tag) ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.trendingOnly}
                    onChange={(e) =>
                      handleFilterChange("trendingOnly", e.target.checked)
                    }
                    icon={<TrendingUp />}
                    checkedIcon={<TrendingUp />}
                  />
                }
                label="Show trending destinations only"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Location Filters */}
      <Accordion
        expanded={expanded.location}
        onChange={handleAccordionChange("location")}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>📍 Location</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Regions</InputLabel>
            <Select
              multiple
              value={filters.regions}
              onChange={(e) => handleFilterChange("regions", e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {NZ_REGIONS.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Price Filters */}
      <Accordion
        expanded={expanded.price}
        onChange={handleAccordionChange("price")}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>💰 Price Range</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Price Category</InputLabel>
                <Select
                  value={filters.priceRange}
                  onChange={(e) =>
                    handleFilterChange("priceRange", e.target.value)
                  }
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="free">Free</MenuItem>
                  <MenuItem value="budget">Budget ($)</MenuItem>
                  <MenuItem value="moderate">Moderate ($$)</MenuItem>
                  <MenuItem value="premium">Premium ($$$)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Price ($)"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Price ($)"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Rating Filters */}
      <Accordion
        expanded={expanded.rating}
        onChange={handleAccordionChange("rating")}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>⭐ Rating & Reviews</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography gutterBottom>
                Minimum Rating: {filters.minRating}
              </Typography>
              <Slider
                value={filters.minRating}
                onChange={(e, value) => handleFilterChange("minRating", value)}
                min={0}
                max={5}
                step={0.5}
                marks
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Minimum Reviews"
                type="number"
                value={filters.minReviews}
                onChange={(e) =>
                  handleFilterChange("minReviews", e.target.value)
                }
                helperText="Show only destinations with at least this many reviews"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Accessibility Filters */}
      <Accordion
        expanded={expanded.accessibility}
        onChange={handleAccordionChange("accessibility")}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>♿ Accessibility & Amenities</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.wheelchairAccessible}
                    onChange={(e) =>
                      handleFilterChange(
                        "wheelchairAccessible",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Wheelchair Accessible"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.familyFriendly}
                    onChange={(e) =>
                      handleFilterChange("familyFriendly", e.target.checked)
                    }
                  />
                }
                label="Family Friendly"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.petFriendly}
                    onChange={(e) =>
                      handleFilterChange("petFriendly", e.target.checked)
                    }
                  />
                }
                label="Pet Friendly"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.parkingAvailable}
                    onChange={(e) =>
                      handleFilterChange("parkingAvailable", e.target.checked)
                    }
                  />
                }
                label="Parking Available"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.publicTransportNearby}
                    onChange={(e) =>
                      handleFilterChange(
                        "publicTransportNearby",
                        e.target.checked
                      )
                    }
                  />
                }
                label="Public Transport Nearby"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Environment Filters */}
      <Accordion
        expanded={expanded.environment}
        onChange={handleAccordionChange("environment")}
      >
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>🌤️ Environment & Capacity</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.isIndoor}
                    onChange={(e) =>
                      handleFilterChange("isIndoor", e.target.checked)
                    }
                  />
                }
                label="Indoor Activities"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.isOutdoor}
                    onChange={(e) =>
                      handleFilterChange("isOutdoor", e.target.checked)
                    }
                  />
                }
                label="Outdoor Activities"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Minimum Capacity"
                type="number"
                value={filters.minCapacity}
                onChange={(e) =>
                  handleFilterChange("minCapacity", e.target.value)
                }
                helperText="Required capacity for group visits"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Sort Options */}
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
              >
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="popularity">Popularity</MenuItem>
                <MenuItem value="name">Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value)
                }
              >
                <MenuItem value="DESC">Descending</MenuItem>
                <MenuItem value="ASC">Ascending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleApplyFilters}
          startIcon={<FilterList />}
        >
          Apply Filters
        </Button>

        <Button
          variant="outlined"
          onClick={handleResetFilters}
          startIcon={<Clear />}
        >
          Reset
        </Button>
      </Box>
    </Paper>
  );
}

export default AdvancedFilterPanel;
