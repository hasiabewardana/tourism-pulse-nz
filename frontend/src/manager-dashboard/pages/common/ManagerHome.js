import {
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useAuth } from "../../../shared/context/AuthContext"; // Assuming path; adjust if needed
import classes from "./ManagerHome.module.css"; // Import the new CSS module for styling

// Manager-specific content (can expand with charts/analytics later)
const managerContent = {
  title: "Manager Dashboard Overview",
  items: [
    "Monitor visitor capacity in real-time across your sites",
    "Optimize operations with dynamic pricing and booking tools",
    "Plan staffing and resources using predictive analytics",
    "Coordinate with other operators for regional sustainability",
  ],
};

function ManagerHome() {
  const { role } = useAuth(); // Optional: For additional role validation if needed

  // In a real app, add checks or redirects if not manager, but rely on checkAuthLoader for now

  return (
    <Container maxWidth="lg" className={classes.managerContainer}>
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
        Welcome to the Manager Dashboard{" "}
        {role === "operator" ? ", Operator!" : "!"}
      </Typography>
      <Typography variant="h4" gutterBottom className={classes.contentTitle}>
        {" "}
        {/* Apply contentTitle class */}
        {managerContent.title}
      </Typography>
      <List className={classes.contentList}>
        {" "}
        {/* Apply contentList class for the list */}
        {managerContent.items.map((item, index) => (
          <ListItem key={index} className={classes.contentItem}>
            {" "}
            {/* Apply contentItem class for each item */}
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
      {/* Future: Add quick links to /manager/capacity-monitoring, reports, etc. */}
      {/* Or integrate charts using libraries like Chart.js if needed */}
    </Container>
  );
}

export default ManagerHome;
