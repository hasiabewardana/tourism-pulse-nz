// src/shared/components/navigation/Navigation.js
import { Link, Form } from "react-router-dom"; // FIX: Import Form to enable POST submission for logout action.
import { useAuth } from "../../context/AuthContext";
import classes from "./Navigation.module.css";

function Navigation() {
  const { isAuthenticated, role } = useAuth();

  // Define role-based link sets
  const roleBasedLinks = {
    user: [
      { to: "/", label: "Home" },
      { to: "/destinations", label: "Destinations" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/auth", label: "Login / Sign Up" },
    ],
    public: [
      { to: "/", label: "Home" },
      { to: "/destinations", label: "Destinations" },
      { to: "/about", label: "About" },
      { to: "/contact", label: "Contact" },
      { to: "/logout", label: "Logout" },
    ],
    operator: [
      { to: "/", label: "Home" },
      { to: "/destinations", label: "Destinations" },
      { to: "/operator/destinations", label: "Operator Destinations" },
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

  // Determine the relevant links based on authentication status and role
  let links = roleBasedLinks.user; // Default to public links for all users

  if (isAuthenticated) {
    // For authenticated users, use role-specific links
    links = roleBasedLinks[role] || roleBasedLinks.user; // Fallback to operator if role is invalid
  }

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
              {/* FIX: For logout, use a Form with POST to trigger the route action (clear storage and redirect).
                  This replaces the GET <Link>, which didn't execute the action. For other links, keep <Link>. */}
              {link.to === "/logout" ? (
                <Form method="post" action="/logout">
                  <button type="submit" className={classes.link}>
                    {link.label}
                  </button>
                </Form>
              ) : (
                <Link to={link.to} className={classes.link}>
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export default Navigation;
