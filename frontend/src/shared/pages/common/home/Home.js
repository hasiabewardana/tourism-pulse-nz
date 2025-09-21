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
} from "@mui/material";
import classes from "./Home.module.css";

// Testimonials for credibility and user engagement
const testimonials = [
  { text: "TourismPulseNZ made planning my trip so easy!", author: "Jane Doe" },
  {
    text: "Real-time updates saved our business during peak season.",
    author: "John Smith",
  },
];

function Home() {
  const [activeRole, setActiveRole] = useState("public"); // State to manage role-based content
  const [destinations, setDestinations] = useState([]); // State for fetched destinations
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
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
        // Limit to maximum of 5 destinations
        setDestinations(response.data.slice(0, 5)); // Assuming API returns array of destinations
      } catch (err) {
        setError("Failed to load destinations. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

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
          onClick={handleLoginClick}
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

      {/* Featured Destinations Section */}
      <Typography variant="h4" className={classes.sectionTitle}>
        Featured Destinations
      </Typography>
      <Grid container spacing={3} className={classes.destinationGrid}>
        {destinations.map((dest, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card className={classes.destinationCard}>
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
        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card className={classes.testimonialCard}>
              <CardContent>
                <Typography variant="body1">{testimonial.text}</Typography>
                <Typography
                  variant="caption"
                  className={classes.testimonialAuthor}
                >
                  - {testimonial.author}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Final Call-to-Action */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleLoginClick}
          className={classes.loginButton}
        >
          Get Started Today
        </Button>
      </Box>
    </Container>
  );
}

export default Home;
