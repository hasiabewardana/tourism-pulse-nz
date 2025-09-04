// src/admin-panel/components/destination-management/Destination.js
import classes from "./Destination.module.css";

function Destination({ destination, onEdit, onDelete }) {
  return (
    <div className={classes.destinationCard}>
      <h2>{destination.name}</h2>
      <p>
        <strong>Description:</strong> {destination.description}
      </p>
      <p>
        <strong>Max Capacity:</strong> {destination.maxCapacity}
      </p>
      <p>
        <strong>Current Visitors:</strong> {destination.currentVisitors}
      </p>
      <p>
        <strong>Status:</strong> {destination.status}
      </p>
      <div className={classes.actions}>
        <button onClick={() => onEdit(destination)}>Edit</button>
        <button onClick={() => onDelete(destination.id)}>Delete</button>
      </div>
    </div>
  );
}

export default Destination;
