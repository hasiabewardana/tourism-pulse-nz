import classes from "./User.module.css";

// Component to display individual user information in a card format
function User({ user, onEdit, onDelete }) {
  const fullName = `${user.first_name || "N/A"} ${user.last_name || ""}`.trim();

  return (
    <div className={classes.userCard}>
      <h2>{fullName}</h2>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Role:</strong> {user.role}
      </p>
      <p>
        <strong>Joined:</strong>{" "}
        {new Date(user.created_at).toLocaleDateString()}
      </p>
      <div className={classes.actions}>
        <button onClick={() => onEdit(user)}>Edit</button>
        <button onClick={() => onDelete(user.user_id)}>Delete</button>
      </div>
    </div>
  );
}

export default User;
