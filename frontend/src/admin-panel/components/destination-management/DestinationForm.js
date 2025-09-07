// src/admin-panel/components/destination-management/DestinationForm.js
import { useState } from "react";
import classes from "./Destination.module.css";

function DestinationForm({ destination, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: destination?.name || "",
    description: destination?.description || "",
    capacity: destination?.capacity || 0,
    photos: destination?.photos?.[0] || "", // Use first photo as input
    status: destination?.status?.toLowerCase() || "open",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className={classes.destinationForm} onSubmit={handleFormSubmit}>
      <label>
        Name:
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Capacity:
        <input
          type="number"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          min="0"
          required
        />
      </label>
      <label>
        Photo URL (Thumbnail):
        <input
          type="url"
          name="photos"
          value={formData.photos}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </label>
      <label>
        Status:
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </label>
      <div className={classes.formActions}>
        <button type="submit">Save</button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DestinationForm;
