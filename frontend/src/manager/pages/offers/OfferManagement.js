import { Container, Typography } from "@mui/material";
import OfferList from "../../components/offers/OfferList";
import classes from "./OfferManagement.module.css";

function OfferManagement() {
  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography variant="h3" className={classes.title}>
        My Offers
      </Typography>
      <OfferList />
    </Container>
  );
}

export default OfferManagement;
