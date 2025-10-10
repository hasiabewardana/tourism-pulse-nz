import { Typography, Box } from "@mui/material";
import BookingCard from "./BookingCard";
import classes from "./BookingList.module.css";

function BookingList({ bookings, onRefresh }) {
  if (bookings.length === 0) {
    return (
      <Typography className={classes.noResults}>No bookings found.</Typography>
    );
  }

  return (
    <Box className={classes.grid}>
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} onRefresh={onRefresh} />
      ))}
    </Box>
  );
}

export default BookingList;
