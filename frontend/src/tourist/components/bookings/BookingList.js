// src/tourist/components/bookings/BookingList.js
import { Grid, Typography } from "@mui/material";
import BookingCard from "./BookingCard";
import classes from "../../pages/bookings/BookingsPage.module.css"; // Shared

function BookingList({ bookings, onRefresh }) {
  if (bookings.length === 0) {
    return (
      <Typography className={classes.noResults}>No bookings found.</Typography>
    );
  }

  return (
    <Grid
      container
      spacing={3}
      justifyContent="center"
      sx={{ width: "100%", margin: 0 }}
    >
      {bookings.map((booking) => (
        <Grid item xs={12} sm={6} md={4} key={booking.id}>
          <BookingCard booking={booking} onRefresh={onRefresh} />
        </Grid>
      ))}
    </Grid>
  );
}

export default BookingList;
