function User({ user }) {
  return (
    <div className="user-card">
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      {/* Add more user details as needed */}
    </div>
  );
}

export default User;
