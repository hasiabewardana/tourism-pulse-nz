// src/admin-panel/components/destination-management/DestinationList.js
import { useState, useEffect } from "react";
import Destination from "./Destination";
import DestinationForm from "./DestinationForm";
import classes from "./Destination.module.css";

function DestinationList() {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
  ); // Dynamic default (e.g., "2025-09-07")

  // Sort and search states
  const [sortBy, setSortBy] = useState("Name (A-Z)");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch destinations with filters
  const fetchDestinations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (selectedStatus !== "All") params.append("status", selectedStatus);
      if (selectedAvailability !== "All")
        params.append("availability", selectedAvailability.toLowerCase());
      params.append("date", selectedDate);

      const res = await fetch(
        `http://localhost:3000/dest/api/v1/destinations?${params.toString()}`,
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
      applySearchAndSort(data); // Apply initial client-side search/sort
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError("Failed to fetch destinations.");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refetch on filter changes
  useEffect(() => {
    fetchDestinations();
  }, [selectedStatus, selectedAvailability, selectedDate]);

  // Apply client-side search and sort
  const applySearchAndSort = (data) => {
    let filtered = data.filter((dest) =>
      dest.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "Name (A-Z)":
          return a.name.localeCompare(b.name);
        case "Name (Z-A)":
          return b.name.localeCompare(a.name);
        case "Visitors (Low to High)":
          return (a.current_visitors || 0) - (b.current_visitors || 0);
        case "Visitors (High to Low)":
          return (b.current_visitors || 0) - (a.current_visitors || 0);
        case "Capacity (Low to High)":
          return a.capacity - b.capacity;
        case "Capacity (High to Low)":
          return b.capacity - a.capacity;
        default:
          return 0;
      }
    });

    setFilteredDestinations(filtered);
  };

  // Handle search/sort changes
  useEffect(() => {
    applySearchAndSort(destinations);
  }, [searchTerm, sortBy, destinations]);

  // Handle create or update
  const handleSubmit = async (destData) => {
    const token = localStorage.getItem("token");
    const method = selectedDestination ? "PUT" : "POST";
    const url = selectedDestination
      ? `http://localhost:3000/dest/api/v1/destinations/${selectedDestination.destination_id}`
      : "http://localhost:3000/dest/api/v1/destinations";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: destData.name,
          description: destData.description,
          capacity: parseInt(destData.capacity),
          photos: destData.photos
            ? [destData.photos]
            : ["https://default-destination-thumbnail.jpg"],
          status:
            destData.status.charAt(0).toUpperCase() + destData.status.slice(1), // Capitalize
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const updatedDest = await res.json();

      // Refetch to get updated list with current_visitors
      fetchDestinations();

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
      // Refetch after delete
      fetchDestinations();
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

  const handleResetFilters = () => {
    setSelectedStatus("All");
    setSelectedAvailability("All");
    setSelectedDate(
      new Date().toLocaleDateString("en-CA", { timeZone: "Pacific/Auckland" })
    );
    setSearchTerm("");
    setSortBy("Name (A-Z)");
  };

  if (loading)
    return <p className={classes.loading}>Loading destinations...</p>;
  if (error) return <p className={classes.error}>Error: {error}</p>;

  return (
    <div className={classes.destinationList}>
      <h1 className={classes.title}>Destination Management</h1>
      <button className={classes.createButton} onClick={handleCreate}>
        Create New Destination
      </button>

      {/* Filters Section */}
      <div className={classes.filtersSection}>
        <label className={classes.filterLabel}>
          Status:
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
          </select>
        </label>
        <label className={classes.filterLabel}>
          Availability:
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
          </select>
        </label>
        <label className={classes.filterLabel}>
          Date:
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </label>
        <label className={classes.filterLabel}>
          Sort By:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Name (A-Z)">Name (A-Z)</option>
            <option value="Name (Z-A)">Name (Z-A)</option>
            <option value="Visitors (Low to High)">
              Visitors (Low to High)
            </option>
            <option value="Visitors (High to Low)">
              Visitors (High to Low)
            </option>
            <option value="Capacity (Low to High)">
              Capacity (Low to High)
            </option>
            <option value="Capacity (High to Low)">
              Capacity (High to Low)
            </option>
          </select>
        </label>
        <label className={classes.filterLabel}>
          Search Name:
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destinations..."
          />
        </label>
        <button className={classes.resetButton} onClick={handleResetFilters}>
          Reset
        </button>
      </div>

      {filteredDestinations.length === 0 ? (
        <p className={classes.noResults}>No destinations found.</p>
      ) : (
        <div className={classes.grid}>
          {filteredDestinations.map((destination) => (
            <Destination
              key={destination.destination_id}
              destination={destination}
              selectedDate={selectedDate} // Pass selectedDate as prop
            />
          ))}
        </div>
      )}

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
