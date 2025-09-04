// src/admin-panel/pages/common/AdminHome.js
import {
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useAuth } from "../../../shared/context/AuthContext"; // Assuming path; adjust if needed
import classes from "./AdminHome.module.css"; // Import the new CSS module for styling

// Admin-specific content (can expand with charts/analytics later)
const adminContent = {
  title: "Admin Dashboard Overview",
  items: [
    "Oversee visitor capacity across all sites",
    "Make data-driven decisions with real-time insights",
    "Plan future strategies with predictive analytics",
    "Collaborate with operators for sustainability",
  ],
};

function AdminHome() {
  const { role } = useAuth(); // Optional: For additional role validation if needed

  // In a real app, add checks or redirects if not admin, but rely on checkAuthLoader for now

  return (
    <Container maxWidth="lg" className={classes.adminContainer}>
      {" "}
      {/* Apply container class for overall styling */}
      <Typography
        variant="h2"
        align="center"
        gutterBottom
        className={classes.title}
      >
        {" "}
        {/* Apply title class */}
        Welcome to the Admin Panel {role === "admin" ? ", Administrator!" : "!"}
      </Typography>
      <Typography variant="h4" gutterBottom className={classes.contentTitle}>
        {" "}
        {/* Apply contentTitle class */}
        {adminContent.title}
      </Typography>
      <List className={classes.contentList}>
        {" "}
        {/* Apply contentList class for the list */}
        {adminContent.items.map((item, index) => (
          <ListItem key={index} className={classes.contentItem}>
            {" "}
            {/* Apply contentItem class for each item */}
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
      {/* Future: Add quick links to /admin/user-management, reports, etc. */}
      {/* Or integrate charts using libraries like Chart.js if needed */}
    </Container>
  );
}

export default AdminHome;
