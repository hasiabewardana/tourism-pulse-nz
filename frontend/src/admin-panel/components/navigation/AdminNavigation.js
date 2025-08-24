import { Form, Link, Outlet } from "react-router-dom";
import classes from "./AdminNavigation.module.css";

// Admin panel component for system configuration and reporting
const AdminPanel = () => {
  return (
    <header className={classes.header}>
      <nav>
        <ul className={classes.list}>
          <li>
            <Link to="user-management">User Management</Link>
          </li>
          <li>
            <Link to="reports">Reports</Link>
          </li>
          <li>
            <Link to="logout">Logout</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default AdminPanel; // Exporting the AdminPanel component for use in other parts of the application
