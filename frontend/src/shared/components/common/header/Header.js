import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import classes from "./Header.module.css";

// Header component for shared navigation
function Header() {
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail"));
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setUserEmail(localStorage.getItem("userEmail"));
      setIsAuthenticated(!!localStorage.getItem("token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <header className={classes.header}>
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <img
          className={classes.logo}
          src="/tourism-pulse-nz-logo.png"
          alt="TourismPulseNZ Logo"
        />
        <div>
          <h1>TourismPulseNZ</h1>
          <p>A Smart Web-Based Tourism Management Platform</p>
        </div>
      </Link>
      {isAuthenticated && userEmail && (
        <div className={classes.userSection}>
          <span className={classes.userName}>{userEmail}</span>
        </div>
      )}
    </header>
  );
}

export default Header; // Exporting the Header component for use in other parts of the application
