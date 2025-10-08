import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import TrendingSearches from "../../../components/search/TrendingSearches";
import RecommendationsList from "../../../components/recommendations/RecommendationsList";
import DestinationModal from "../../../components/destination/DestinationModal";
import { useAuth } from "../../../context/AuthContext";
import classes from "./Home.module.css";

function Home() {
  const { isAuthenticated } = useAuth();
  const [activeRole, setActiveRole] = useState("public"); // State to manage role-based content
  const [destinations, setDestinations] = useState([]); // State for fetched destinations
  const [reviews, setReviews] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]); // State for filtered destinations
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchTerm, setSearchTerm] = useState(""); // Search state
  const [selectedStatus, setSelectedStatus] = useState("All"); // Status filter
  const [sortBy, setSortBy] = useState("Name (A-Z)"); // Sort state
  const [selectedRegion, setSelectedRegion] = useState("All"); // Region filter
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  // Fetch destinations from API and limit to 5
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/dest/api/v1/destinations/public",
          {
            params: {
              status: "Open",
              availability: "Available",
              date: "2025-09-07",
            },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // Set all destinations and apply initial filtering
        setDestinations(response.data);
        applySearchAndSort(response.data);
      } catch (err) {
        setError("Failed to load destinations. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Fetch featured reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/dest/api/v1/reviews/featured",
          {
            params: { limit: 6 },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setReviews(response.data);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };

    fetchReviews();
  }, []);

  // Apply search and sort functionality
  const applySearchAndSort = (data) => {
    let filtered = [...data];

    // Apply search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (dest) =>
          dest.name.toLowerCase().includes(lowerSearch) ||
          dest.description.toLowerCase().includes(lowerSearch) ||
          (dest.locationName &&
            dest.locationName.toLowerCase().includes(lowerSearch)) ||
          (dest.region && dest.region.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply status filter
    if (selectedStatus !== "All") {
      filtered = filtered.filter((dest) => dest.status === selectedStatus);
    }

    // Apply region filter
    if (selectedRegion !== "All") {
      filtered = filtered.filter((dest) => dest.region === selectedRegion);
    }

    // Apply sorting
    switch (sortBy) {
      case "Name (A-Z)":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "Name (Z-A)":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "Capacity (Low to High)":
        filtered.sort((a, b) => a.capacity - b.capacity);
        break;
      case "Capacity (High to Low)":
        filtered.sort((a, b) => b.capacity - a.capacity);
        break;
      case "Popularity (Most Popular)":
        filtered.sort(
          (a, b) => (b.current_visitors || 0) - (a.current_visitors || 0)
        );
        break;
      default:
        filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredDestinations(filtered);
  };

  // Filter and search handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleRegionChange = (e) => {
    setSelectedRegion(e.target.value);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedStatus("All");
    setSortBy("Name (A-Z)");
    setSelectedRegion("All");
  };

  const handleTrendingSearchClick = (searchQuery) => {
    setSearchTerm(searchQuery);
  };

  const handleDestinationClick = (destinationId) => {
    setSelectedDestinationId(destinationId);
    setOpenModal(true);
  };

  const handleViewDestinations = () => {
    navigate("/destinations");
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedDestinationId(null);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    applySearchAndSort(destinations);
  }, [searchTerm, selectedStatus, sortBy, selectedRegion, destinations]);

  const handleLoginClick = () => {
    navigate("/auth");
  };

  if (loading) return <CircularProgress className={classes.loading} />;
  if (error)
    return (
      <Typography color="error" className={classes.error}>
        {error}
      </Typography>
    );

  return (
    <Container maxWidth="lg" className={classes.homeContainer}>
      {/* Hero Section: Engaging introduction with call-to-action */}
      <Box className={classes.heroSection}>
        <Typography variant="h1" className={classes.heroTitle}>
          Welcome to TourismPulseNZ
        </Typography>
        <Typography variant="h6" className={classes.heroSubtitle}>
          Discover, Plan, and Experience New Zealand Sustainably
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleViewDestinations}
          className={classes.heroButton}
        >
          Explore Now
        </Button>
      </Box>

      {/* Role-based Tabs for Tourist and Operator Views */}
      <div id="tabs" className={classes.tabs}>
        <menu className={classes.tabMenu}>
          <button
            className={`${classes.tabButton} ${
              activeRole === "public" ? classes.active : ""
            }`}
            onClick={() => setActiveRole("public")}
            aria-label="Switch to Tourist Interface"
          >
            Tourist
          </button>
          <button
            className={`${classes.tabButton} ${
              activeRole === "operator" ? classes.active : ""
            }`}
            onClick={() => setActiveRole("operator")}
            aria-label="Switch to Manager Dashboard"
          >
            Operator
          </button>
        </menu>
        <div id="tab-content" className={classes.tabContent}>
          <Typography variant="h4" className={classes.contentTitle}>
            {activeRole === "public"
              ? "Explore New Zealand"
              : "Manage Operations"}
          </Typography>
          <ul className={classes.contentList}>
            {activeRole === "public" ? (
              <>
                <li>Real-time availability at top destinations</li>
                <li>Personalized travel itineraries</li>
                <li>Capacity-based booking insights</li>
                <li>Sustainable travel tips</li>
              </>
            ) : (
              <>
                <li>Real-time visitor capacity monitoring</li>
                <li>Dynamic pricing and booking optimization</li>
                <li>Predictive analytics for staffing</li>
                <li>Multi-destination coordination tools</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Trending Searches Section */}
      {isAuthenticated && (
        <Box sx={{ mb: 4 }}>
          <TrendingSearches onSearchClick={handleTrendingSearchClick} />
        </Box>
      )}

      {/* Personalized Recommendations Section */}
      {isAuthenticated && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" className={classes.sectionTitle}>
            Recommended For You
          </Typography>
          <RecommendationsList
            preferences={{
              categories: [], // Can be customized based on user preferences
              preferredRegions:
                selectedRegion !== "All" ? [selectedRegion] : [],
              minRating: 3.5,
            }}
            onDestinationClick={handleDestinationClick}
          />
        </Box>
      )}

      {/* Featured Destinations Section */}
      <Typography variant="h4" className={classes.sectionTitle}>
        Explore Destinations
      </Typography>

      <Grid container spacing={3} className={classes.destinationGrid}>
        {filteredDestinations.map((dest, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              className={classes.destinationCard}
              onClick={handleViewDestinations}
              sx={{ cursor: "pointer" }}
            >
              <CardMedia
                component="img"
                height="200"
                image={
                  "/images/destinations/" +
                  (dest.thumbnail || "https://via.placeholder.com/300x200")
                }
                alt={dest.name}
              />
              <CardContent>
                <Typography variant="h6">{dest.name}</Typography>
                <Typography variant="body2">
                  Current Capacity: {dest.capacity || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Testimonials Section */}
      <Typography variant="h4" className={classes.sectionTitle}>
        What Our Users Say
      </Typography>
      <Grid container spacing={3} className={classes.testimonialGrid}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <Grid item xs={12} sm={6} key={review.review_id}>
              <Card className={classes.testimonialCard}>
                <CardContent>
                  <Typography variant="body1">{review.comment}</Typography>
                  <Typography
                    variant="caption"
                    className={classes.testimonialAuthor}
                  >
                    - {review.username || "Anonymous"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 0.5 }}
                  >
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant="body2" align="center">
              No reviews yet. Be the first to share your experience!
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Final Call-to-Action */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleViewDestinations}
          className={classes.loginButton}
        >
          Get Started Today
        </Button>
      </Box>

      {/* Destination Modal for detailed view */}
      <DestinationModal
        open={openModal}
        onClose={handleCloseModal}
        destinationId={selectedDestinationId}
      />
    </Container>
  );
}

export default Home;
