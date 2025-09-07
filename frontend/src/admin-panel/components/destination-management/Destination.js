// src/admin-panel/components/destination-management/Destination.js
import classes from "./Destination.module.css";

function Destination({ destination, onEdit, onDelete, selectedDate }) {
  return (
    <div className={classes.destinationCard}>
      <img
        src={
          "/images/destinations/" + destination.thumbnail ||
          "https://default-destination-thumbnail.jpg"
        }
        alt={destination.name}
        className={classes.thumbnail}
      />
      <h2>{destination.name}</h2>
      <p>
        <strong>Description:</strong>{" "}
        {destination.description || "No description"}
      </p>
      <p>
        <strong>Capacity:</strong> {destination.capacity}
      </p>
      <p>
        <strong>
          Current Visitors (
          {selectedDate
            ? new Date(selectedDate).toLocaleDateString("en-NZ", {
                timeZone: "Pacific/Auckland",
              })
            : "Today"}
          ):
        </strong>{" "}
        {destination.current_visitors || 0}
      </p>
      <p>
        <strong>Status:</strong> {destination.status}
      </p>
      <div className={classes.actions}>
        <button onClick={() => onEdit(destination)}>Edit</button>
        <button onClick={() => onDelete(destination.destination_id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default Destination;
