import { useState } from "react"; // Importing useState for managing state in functional components
import "./styles.css"; // Importing styles for the application
import Header from "./shared/components/Header"; // Importing the Header component for shared navigation
import Footer from "./shared/components/Footer";

// Content for the tabs in the application
const content = [
  [
    "Offer real-time availability information for popular destinations",
    "Provide personalized recommendations for alternative destinations",
    "Enable advance planning with capacity-based booking suggestions",
    "Enhance overall visit experience through better information",
  ],
  [
    "Provide real-time visitor capacity monitoring and alerts",
    "Enable dynamic pricing and booking management",
    "Deliver predictive analytics for staffing and resource planning",
    "Facilitate coordinated capacity management across multiple destinations",
  ],
  [
    "Monitor and manage visitor capacity across multiple destinations",
    "Provide real-time data for informed decision-making",
    "Enable predictive analytics for future planning",
    "Facilitate collaboration with tourism operators and stakeholders",
    "Support sustainable tourism practices through data-driven insights",
  ],
];

// Main App component that renders the application
export default function App() {
  const [activeContentIndex, setActiveContentIndex] = useState(0); // State to track the currently active tab content index

  return (
    <div>
      <Header /> {/* Rendering the Header component for navigation */}
      <div id="tabs">
        <menu>
          <button
            // Button to switch to the Tourist Interface tab
            className={activeContentIndex === 0 ? "active" : ""}
            onClick={() => setActiveContentIndex(0)}
          >
            Tourist Interface
          </button>
          <button
            // Button to switch to the Manager Dashboard tab
            className={activeContentIndex === 1 ? "active" : ""}
            onClick={() => setActiveContentIndex(1)}
          >
            Manager Dashboard
          </button>
          <button
            // Button to switch to the Admin Panel tab
            className={activeContentIndex === 2 ? "active" : ""}
            onClick={() => setActiveContentIndex(2)}
          >
            Admin Panel
          </button>
        </menu>
        <div id="tab-content">
          <ul>
            {
              // Mapping through the content array to display the items for the active tab
              content[activeContentIndex].map((item) => (
                <li key={item}>{item}</li>
              ))
            }
          </ul>
        </div>
      </div>
      <Footer />{" "}
      {/* Rendering the Footer component for shared footer content */}
    </div>
  );
}
