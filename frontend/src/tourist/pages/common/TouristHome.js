import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  LocationOn,
  Map as MapIcon,
  LocalOffer,
  BookOnline,
} from "@mui/icons-material";
import { useAuth } from "../../../shared/context/AuthContext";
import classes from "./TouristHome.module.css";

const navigationCards = [
  {
    title: "Destinations",
    description: "Explore popular destinations across New Zealand",
    icon: LocationOn,
    path: "/destinations",
    color: "#1976d2",
  },
  {
    title: "Map",
    description: "View destinations on an interactive map",
    icon: MapIcon,
    path: "/map",
    color: "#388e3c",
  },
  {
    title: "Offers",
    description: "Discover exclusive deals and special offers",
    icon: LocalOffer,
    path: "/tourist/offers",
    color: "#f57c00",
  },
  {
    title: "My Bookings",
    description: "Manage your bookings and reservations",
    icon: BookOnline,
    path: "/tourist/bookings",
    color: "#7b1fa2",
  },
];

function TouristHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" className={classes.touristContainer}>
      <Box className={classes.welcomeHeader}>
        <Box className={classes.welcomeContent}>
          <Typography variant="h2" className={classes.welcomeTitle}>
            Welcome to TourismPulseNZ
          </Typography>
          <Typography variant="h5" className={classes.welcomeSubtitle}>
            {user?.name ? `Hello ${user.name}!` : "Hello Traveler!"} Discover
            and explore New Zealand's finest destinations
          </Typography>
        </Box>
        <Box className={classes.userAvatar}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#ffffff",
              color: "#0fa4af",
              fontSize: "2rem",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "T"}
          </Avatar>
        </Box>
      </Box>

      <Box className={classes.section}>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          sx={{ maxWidth: "900px", margin: "0 auto" }}
        >
          {navigationCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Grid item xs={12} sm={6} md={6} lg={6} key={index}>
                <Card
                  className={classes.navCard}
                  onClick={() => navigate(card.path)}
                  sx={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  <CardContent className={classes.navCardContent}>
                    <Box
                      className={classes.iconWrapper}
                      sx={{ backgroundColor: card.color }}
                    >
                      <IconComponent
                        sx={{ fontSize: "3rem", color: "#ffffff" }}
                      />
                    </Box>
                    <Typography variant="h6" className={classes.navCardTitle}>
                      {card.title}
                    </Typography>
                    <Typography className={classes.navCardDescription}>
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Container>
  );
}

export default TouristHome;
