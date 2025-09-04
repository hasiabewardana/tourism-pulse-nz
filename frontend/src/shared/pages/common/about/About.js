// src/shared/pages/common/About.js
import { Typography, Container, Box } from "@mui/material";
import classes from "./About.module.css"; // Import the new CSS module for styling

function About() {
  return (
    <Container maxWidth="lg" className={classes.aboutContainer}>
      <Typography variant="h2" align="center" className={classes.title}>
        About TourismPulseNZ
      </Typography>
      <Box className={classes.section}>
        <Typography variant="h4" className={classes.sectionTitle}>
          Our Mission
        </Typography>
        <Typography className={classes.content}>
          TourismPulseNZ is dedicated to transforming New Zealand's tourism
          industry through sustainable, data-driven solutions. We aim to balance
          visitor satisfaction with environmental and cultural preservation by
          providing real-time capacity monitoring, predictive analytics, and
          personalized planning tools.
        </Typography>
      </Box>
      <Box className={classes.section}>
        <Typography variant="h4" className={classes.sectionTitle}>
          Key Features
        </Typography>
        <Typography className={classes.content}>
          - Real-time availability and visitor insights for tourists.
          <br />- Dynamic management tools for tourism operators.
          <br />- Predictive analytics to optimize resource allocation.
          <br />- Collaborative platform for sustainable destination management.
        </Typography>
      </Box>
      <Box className={classes.section}>
        <Typography variant="h4" className={classes.sectionTitle}>
          Our Team
        </Typography>
        <Typography className={classes.content}>
          Developed by a dedicated team at the University of Waikato as part of
          the Master of Information Technology program. Led by Hasitha Prasanga
          Abewardana Houpe Mudiyanselage, our project leverages cutting-edge web
          technologies to support New Zealand's tourism goals.
        </Typography>
      </Box>
      {/* Future: Add testimonials, team photos, or a contact form */}
    </Container>
  );
}

export default About;
