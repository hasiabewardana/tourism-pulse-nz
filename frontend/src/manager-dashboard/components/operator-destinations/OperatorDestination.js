// src/manager-dashboard/components/operator-destination-management/OperatorDestination.js
import { Card, CardContent, Typography, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import classes from "./OperatorDestination.module.css";

function OperatorDestination({ assignment, userName, onDelete }) {
  return (
    <Card className={classes.card}>
      <CardContent className={classes.cardContent}>
        <Typography variant="h5" className={classes.cardTitle}>
          {assignment.destinationName || assignment.name}
        </Typography>
        <Typography variant="body2" className={classes.cardDescription}>
          Operator: {userName}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Capacity: {assignment.capacity}
        </Typography>
        <Typography variant="body1" className={classes.cardInfo}>
          Current Visitors: {assignment.current_visitors || 0}
        </Typography>
        <Typography variant="body1" className={classes.cardStatus}>
          Status: {assignment.status || "Active"}
        </Typography>
        <div className={classes.actions}>
          <IconButton
            onClick={() =>
              onDelete(assignment.userId, assignment.destinationId)
            }
            color="error"
            aria-label="Delete assignment"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </CardContent>
    </Card>
  );
}

export default OperatorDestination;
