import { Container, Typography } from "@mui/material";
import OperatorDestinationList from "../../components/destinations/OperatorDestinationList";
import classes from "./OperatorDestinations.module.css";

function OperatorDestinations() {
  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography variant="h3" className={classes.title}>
        My Destinations
      </Typography>
      <OperatorDestinationList />
    </Container>
  );
}

export default OperatorDestinations;
