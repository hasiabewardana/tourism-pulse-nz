// src/manager-dashboard/pages/offer-management/OfferManagement.js
import { Container } from "@mui/material";
import OfferList from "../../components/offers/OfferList";
import classes from "./OfferManagement.module.css";

function OfferManagement() {
  return (
    <Container maxWidth="lg" className={classes.container}>
      <OfferList />
    </Container>
  );
}

export default OfferManagement;
