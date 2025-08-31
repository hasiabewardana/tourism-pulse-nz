// src/shared/components/navigation/Navigation.js
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import classes from "./Navigation.module.css";

function Navigation() {
  const { isAuthenticated, role } = useAuth();

  // Define role-based link sets
  const roleBasedLinks = {
    public: [
      { to: "/", label: "Home" },
      { to: "/destinations", label: "Destinations" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/auth", label: "Login / Sign Up" },
    ],
    operator: [
      { to: "/", label: "Home" },
      { to: "/destinations", label: "Destinations" },
      { to: "/admin/booking-management", label: "Booking Management" },
      { to: "/admin/reports", label: "Reports" },
      { to: "/logout", label: "Logout" },
    ],
    admin: [
      { to: "/", label: "Home" },
      { to: "/destinations", label: "Destinations" },
      { to: "/admin/destination-management", label: "Destination Management" },
      { to: "/admin/user-management", label: "User Management" },
      { to: "/admin/booking-management", label: "Booking Management" },
      { to: "/admin/reports", label: "Reports" },
      { to: "/logout", label: "Logout" },
    ],
  };

  // Determine the relevant links based on role and authentication status
  const links =
    roleBasedLinks[role] ||
    (isAuthenticated
      ? roleBasedLinks[role] || roleBasedLinks.operator
      : roleBasedLinks.public) ||
    roleBasedLinks.public; // Fallback to public if role is undefined

  return (
    <header
      className={classes.header}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav>
        <ul className={classes.list}>
          {links.map((link, index) => (
            <li key={index}>
              <Link to={link.to} className={classes.link}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Navigation;
