import { Container, Typography } from "@mui/material";
import DestinationList from "../../components/destination/DestinationList";
import classes from "./Destinations.module.css";

function Destinations() {
  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography variant="h3" className={classes.title}>
        Explore Destinations
      </Typography>

      <DestinationList />
    </Container>
  );
}

export default Destinations;
