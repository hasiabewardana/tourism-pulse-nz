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
  SupervisedUserCircle,
  BarChart,
  LocationOn,
  Business,
  Map as MapIcon,
} from "@mui/icons-material";
import { useAuth } from "../../../shared/context/AuthContext";
import classes from "./AdminHome.module.css";

const navigationCards = [
  {
    title: "Destinations",
    description: "Explore all destinations across New Zealand",
    icon: LocationOn,
    path: "/destinations",
    color: "#1976d2",
  },
  {
    title: "Destination Management",
    description: "Manage and oversee registered destinations",
    icon: Business,
    path: "/admin/destination-management",
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
    title: "User Management",
    description: "Manage users, roles, and access control",
    icon: SupervisedUserCircle,
    path: "/admin/user-management",
    color: "#f57c00",
  },
  {
    title: "Analytics",
    description: "View global performance metrics and insights",
    icon: BarChart,
    path: "/admin/analytics",
    color: "#0288d1",
  },
];

function AdminHome() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" className={classes.adminContainer}>
      <Box className={classes.welcomeHeader}>
        <Box className={classes.welcomeContent}>
          <Typography variant="h2" className={classes.welcomeTitle}>
            Welcome to TourismPulseNZ
          </Typography>
          <Typography variant="h5" className={classes.welcomeSubtitle}>
            {user?.name ? `Hello ${user.name}!` : "Hello Admin!"} Oversee and
            manage New Zealand's tourism ecosystem
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
            {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
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

export default AdminHome;
