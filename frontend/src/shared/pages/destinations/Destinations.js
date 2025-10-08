import { useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import DestinationList from "../../components/destination/DestinationList";
import AdvancedFilterPanel from "../../components/filters/AdvancedFilterPanel";
import classes from "./Destinations.module.css";

function Destinations() {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography variant="h3" className={classes.title}>
        Explore Destinations
      </Typography>

      {/* Advanced Filter Panel */}
      <Box sx={{ mb: 3 }}>
        <AdvancedFilterPanel
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </Box>

      {/* Destination List */}
      <DestinationList filters={filters} />
    </Container>
  );
}

export default Destinations;
