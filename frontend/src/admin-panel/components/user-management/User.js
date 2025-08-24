import "./User.module.css";

function User({ user }) {
  const fullName = `${user.first_name || "N/A"} ${user.last_name || ""}`.trim();

  return (
    <div className="user-card">
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
    </div>
  );
}

export default User;
