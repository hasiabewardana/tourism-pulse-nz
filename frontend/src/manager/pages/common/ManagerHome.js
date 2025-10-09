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
  Business,
  Map as MapIcon,
  LocalOffer,
  BookOnline,
  Analytics,
} from "@mui/icons-material";
import { useAuth } from "../../../shared/context/AuthContext";
import classes from "./ManagerHome.module.css";

const navigationCards = [
  {
    title: "Destinations",
    description: "Explore all destinations across New Zealand",
    icon: LocationOn,
    path: "/destinations",
    color: "#1976d2",
  },
  {
    title: "My Destinations",
    description: "Manage your registered destinations",
    icon: Business,
    path: "/operator/destinations",
    color: "#d32f2f",
  },
  {
    title: "Map",
    description: "View destinations on an interactive map",
    icon: MapIcon,
    path: "/map",
    color: "#388e3c",
  },
  {
    title: "My Offers",
    description: "Manage your special offers and deals",
    icon: LocalOffer,
    path: "/operator/offers",
    color: "#f57c00",
  },
  {
    title: "My Bookings",
    description: "Manage your bookings and reservations",
    icon: BookOnline,
    path: "/operator/bookings",
    color: "#7b1fa2",
  },
  {
    title: "Analytics",
    description: "View insights and performance metrics",
    icon: Analytics,
    path: "/operator/analytics",
    color: "#0288d1",
  },
];

function ManagerHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" className={classes.managerContainer}>
      <Box className={classes.welcomeHeader}>
        <Box className={classes.welcomeContent}>
          <Typography variant="h2" className={classes.welcomeTitle}>
            Welcome to TourismPulseNZ
          </Typography>
          <Typography variant="h5" className={classes.welcomeSubtitle}>
            {user?.name ? `Hello ${user.name}!` : "Hello Operator!"} Manage your
            destinations and grow your business
          </Typography>
        </Box>
        <Box className={classes.userAvatar}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: "#ffffff",
              color: "#0c8a94",
              fontSize: "2rem",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : "O"}
          </Avatar>
        </Box>
      </Box>

      <Box className={classes.section}>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          sx={{ maxWidth: "1200px", margin: "0 auto" }}
        >
          {navigationCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
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

export default ManagerHome;
