import { Container } from "@mui/material";
import DestinationList from "../../components/destinations/DestinationList";
import classes from "./DestinationManagement.module.css"; // Import CSS module

function DestinationManagement() {
  return (
    <Container maxWidth="lg" className={classes.container}>
      <DestinationList />
    </Container>
  );
}

export default DestinationManagement;
