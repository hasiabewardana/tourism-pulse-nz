import { Link } from "react-router-dom";
import classes from "./MainNavigation.module.css";

function MainNavigation({ isAuthenticated }) {
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
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
