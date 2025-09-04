import { Container } from "@mui/material";
import BookingList from "../../components/booking-management/BookingList"; // Adjusted path
import classes from "./BookingManagement.module.css"; // Import CSS module

// Page component for booking management, renders the BookingList
function BookingManagement() {
  return (
    <Container maxWidth="lg" className={classes.container}>
      <BookingList />
    </Container>
  );
}

export default BookingManagement;
