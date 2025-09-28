import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import classes from "./User.module.css";

function User({ user, onEdit, onDelete }) {
  const fullName = `${user.first_name || "N/A"} ${user.last_name || ""}`.trim();

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "error";
      case "operator":
        return "warning";
      case "user":
        return "primary";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-NZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className={classes.userCard} elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" marginBottom={2}>
          <PersonIcon
            sx={{ marginRight: 1, color: "var(--tp-surface-dark)" }}
          />
          <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
            {fullName}
          </Typography>
          <Chip
            label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            color={getRoleColor(user.role)}
            size="small"
          />
        </Box>

        <Typography variant="body2" sx={{ marginBottom: 1 }}>
          <strong>Email:</strong> {user.email}
        </Typography>

        <Typography variant="body2" sx={{ marginBottom: 2 }}>
          <strong>Joined:</strong> {formatDate(user.created_at)}
        </Typography>

        <div className={classes.actions}>
          <Button
            variant="contained"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(user)}
            sx={{ textTransform: "none" }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(user.user_id)}
            sx={{ textTransform: "none" }}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default User;
