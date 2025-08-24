import { Link } from "react-router-dom";
import classes from "./MainNavigation.module.css";

function MainNavigation({ isAuthenticated, role }) {
  return (
    <header className={classes["main-header"]}>
      <nav>
        <ul className={classes["nav-list"]}>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/destinations">Destinations</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>

          {!isAuthenticated && (
            <li>
              <Link to="/auth">Login / Sign Up</Link>
            </li>
          )}

          {isAuthenticated && role === "public" && (
            <li>
              <Link to="/tourist">My Dashboard</Link>
            </li>
          )}
          {isAuthenticated && role === "operator" && (
            <li>
              <Link to="/manager">Manager Dashboard</Link>
            </li>
          )}
          {isAuthenticated && role === "admin" && (
            <li>
              <Link to="/admin">Admin Panel</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
