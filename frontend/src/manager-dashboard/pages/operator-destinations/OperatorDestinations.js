import { Container } from "@mui/material";
import OperatorDestinationList from "../../components/operator-destinations/OperatorDestinationList";
import classes from "./OperatorDestinations.module.css"; // Import CSS module

function OperatorDestinations() {
  return (
    <Container maxWidth="lg" className={classes.container}>
      <OperatorDestinationList />
    </Container>
  );
}

export default OperatorDestinations;
