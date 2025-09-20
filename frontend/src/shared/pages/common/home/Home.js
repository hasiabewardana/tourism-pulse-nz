// src/shared/pages/common/Home.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Box, Typography, Container } from "@mui/material";
import classes from "./Home.module.css"; // New CSS module for custom styling

// Content for the tabs tailored to each role
const content = {
  public: {
    title: "Explore New Zealand with TourismPulseNZ",
    items: [
      "Discover real-time availability for top destinations",
      "Get personalized travel recommendations",
      "Plan ahead with capacity-based booking insights",
      "Enjoy a seamless travel experience",
    ],
  },
  operator: {
    title: "Manage Operations Efficiently",
    items: [
      "Monitor visitor capacity in real-time",
      "Optimize booking management with dynamic pricing",
      "Plan staffing with predictive analytics",
      "Coordinate across multiple destinations",
    ],
  },
};

function Home() {
  const [activeRole, setActiveRole] = useState("public"); // State to track the active role tab
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/auth");
  };

  return (
    <Container maxWidth="lg" className={classes.homeContainer}>
      <Typography variant="h3" className={classes.title}>
        Welcome to TourismPulseNZ
      </Typography>
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
            {content[activeRole].title}
          </Typography>
          <ul className={classes.contentList}>
            {content[activeRole].items.map((item, index) => (
              <li key={index} className={classes.contentItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleLoginClick}
          className={classes.loginButton}
        >
          Get Started
        </Button>
      </Box>
    </Container>
  );
}

export default Home;
