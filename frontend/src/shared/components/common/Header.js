import { Link } from "react-router-dom";

// Header component for shared navigation
function Header() {
  return (
    <header>
      <Link
        to="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <img src="tourism-pulse-nz-logo.png" alt="TourismPulseNZ Logo" />
        <div>
          <h1>TourismPulseNZ</h1>
          <p>A Smart Web-Based Tourism Management Platform</p>
        </div>
      </Link>
    </header>
  );
}

export default Header; // Exporting the Header component for use in other parts of the application
