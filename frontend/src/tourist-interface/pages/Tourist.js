import React, { useState, useEffect } from "react";
import { Form } from "react-router-dom";

// Tourist interface component for destination browsing
const TouristInterface = () => {
  const [destinations, setDestinations] = useState([]);

  // Fetch destination data from API
  const fetchDestinations = async () => {
    try {
      // const response = await fetch("/api/destinations");
      // const data = await response.json();
      setDestinations(data);
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
    }
  };

  // Load destinations on component mount
  useEffect(() => {
    fetchDestinations();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Tourist Interface</h1>
      <p>Explore New Zealand destinations and check real-time availability.</p>
      <ul>
        {destinations.map((dest, index) => (
          <li key={index}>
            {dest.name} - Availability: {dest.available ? "Yes" : "No"}
          </li>
        ))}
      </ul>
      <button onClick={fetchDestinations}>Refresh Availability</button>
      <Form action="/logout" method="post">
        <button>Logout</button>
      </Form>
    </div>
  );
};

export default TouristInterface;
