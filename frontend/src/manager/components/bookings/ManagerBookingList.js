// src/manager/components/bookings/ManagerBookingList.js
import { Grid, Typography } from "@mui/material";
import ManagerBookingCard from "./ManagerBookingCard";
import classes from "./ManagerBookingList.module.css";

function ManagerBookingList({ bookings, onRefresh }) {
  if (bookings.length === 0) {
    return (
      <Typography className={classes.noResults}>No bookings found.</Typography>
    );
  }

  return (
    <div className={classes.bookingsGrid}>
      {bookings.map((booking) => (
        <ManagerBookingCard
          key={booking.id}
          booking={booking}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

export default ManagerBookingList;
