import {
  Typography,
  Container,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useAuth } from "../../../shared/context/AuthContext"; // Assuming path; adjust if needed
import classes from "./TouristHome.module.css"; // Import the new CSS module for styling

// Tourist-specific content (can expand with personalized recommendations or maps later)
const touristContent = {
  title: "Tourist Dashboard Overview",
  items: [
    "Check real-time availability for popular New Zealand destinations",
    "Get personalized recommendations for alternative spots",
    "Plan your trips with capacity-based booking suggestions",
    "Enhance your experience with real-time insights and tips",
  ],
};

function TouristHome() {
  const { role } = useAuth(); // Optional: For additional role validation if needed

  // In a real app, add checks or redirects if not tourist, but rely on checkAuthLoader for now

  return (
    <Container maxWidth="lg" className={classes.touristContainer}>
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
        Welcome to Your Tourist Dashboard{" "}
        {role === "public" ? ", Traveler!" : "!"}
      </Typography>
      <Typography variant="h4" gutterBottom className={classes.contentTitle}>
        {" "}
        {/* Apply contentTitle class */}
        {touristContent.title}
      </Typography>
      <List className={classes.contentList}>
        {" "}
        {/* Apply contentList class for the list */}
        {touristContent.items.map((item, index) => (
          <ListItem key={index} className={classes.contentItem}>
            {" "}
            {/* Apply contentItem class for each item */}
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
      {/* Future: Add quick links to /tourist/destinations, search, or personalized feed */}
      {/* Or integrate interactive maps using libraries like Leaflet if needed */}
    </Container>
  );
}

export default TouristHome;
