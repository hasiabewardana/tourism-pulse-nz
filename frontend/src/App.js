import Header from "./shared/components/Header"; // Importing the Header component for shared navigation
import Footer from "./shared/components/Footer"; // Importing the Footer component for shared footer content
import Home from "./shared/pages/Home"; // Importing the Home component for the main content
import "./styles.css"; // Importing global styles

// Main App component that renders the application
export default function App() {
  return (
    <div>
      <Header /> {/* Rendering the Header component for navigation */}
      <Home /> {/* Rendering the Home component for the main content */}
      <Footer />
      {/* Rendering the Footer component for shared footer content */}
    </div>
  );
}
