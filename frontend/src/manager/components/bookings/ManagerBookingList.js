// src/manager/components/bookings/ManagerBookingList.js
import { Grid, Typography } from "@mui/material";
import ManagerBookingCard from "./ManagerBookingCard";
import classes from "../../../tourist/pages/bookings/BookingsPage.module.css"; // Reuse tourist's for consistency

function ManagerBookingList({ bookings, onRefresh }) {
  if (bookings.length === 0) {
    return (
      <Typography className={classes.noResults}>No bookings found.</Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {bookings.map((booking) => (
        <Grid item xs={12} sm={6} md={4} key={booking.id}>
          <ManagerBookingCard booking={booking} onRefresh={onRefresh} />
        </Grid>
      ))}
    </Grid>
  );
}

export default ManagerBookingList;
