// src/admin-panel/components/destination-management/DestinationList.js
import { useState, useEffect } from "react";
import Destination from "./Destination";
import DestinationForm from "./DestinationForm";
import classes from "./Destination.module.css";

function DestinationList() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Fetch destinations on mount
  useEffect(() => {
    const fetchDestinations = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          "http://localhost:3000/dest/api/v1/destinations",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setDestinations(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching destinations:", err);
        setError("Failed to fetch destinations.");
        setLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  // Handle create or update
  const handleSubmit = async (destData) => {
    const token = localStorage.getItem("token");
    const method = selectedDestination ? "PUT" : "POST";
    const url = selectedDestination
      ? `http://localhost:3000/dest/api/v1/destinations/${selectedDestination.id}`
      : "http://localhost:3000/dest/api/v1/destinations";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(destData),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const updatedDest = await res.json();

      if (selectedDestination) {
        setDestinations(
          destinations.map((d) =>
            d.id === selectedDestination.id ? updatedDest : d
          )
        );
      } else {
        setDestinations([...destinations, updatedDest]);
      }

      setShowModal(false);
      setSelectedDestination(null);
    } catch (err) {
      console.error("Error saving destination:", err);
      setError("Failed to save destination.");
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this destination?"))
      return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/dest/api/v1/destinations/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      setDestinations(destinations.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Error deleting destination:", err);
      setError("Failed to delete destination.");
    }
  };

  // Open modal for edit
  const handleEdit = (destination) => {
    setSelectedDestination(destination);
    setShowModal(true);
  };

  // Open modal for create
  const handleCreate = () => {
    setSelectedDestination(null);
    setShowModal(true);
  };

  if (loading) return <p>Loading destinations...</p>;
  if (error) return <p>Error: {error}</p>;
  if (destinations.length === 0) return <p>No destinations found.</p>;

  return (
    <div className={classes.destinationList}>
      <h1 className={classes.title}>Destinations</h1>
      <button className={classes.createButton} onClick={handleCreate}>
        Create New Destination
      </button>
      <div className={classes.grid}>
        {destinations.map((destination) => (
          <Destination
            key={destination.id}
            destination={destination}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {showModal && (
        <div className={classes.modal}>
          <div className={classes.modalContent}>
            <DestinationForm
              destination={selectedDestination}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DestinationList;
