// src/admin-panel/components/destination-management/DestinationForm.js
import { useState } from "react";
import classes from "./Destination.module.css";

function DestinationForm({ destination, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: destination?.name || "",
    description: destination?.description || "",
    maxCapacity: destination?.maxCapacity || 0,
    currentVisitors: destination?.currentVisitors || 0,
    status: destination?.status || "open",
    imageUrl: destination?.imageUrl || "",
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
        Max Capacity:
        <input
          type="number"
          name="maxCapacity"
          value={formData.maxCapacity}
          onChange={handleChange}
          min="0"
          required
        />
      </label>
      <label>
        Current Visitors:
        <input
          type="number"
          name="currentVisitors"
          value={formData.currentVisitors}
          onChange={handleChange}
          min="0"
          required
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
      <label>
        Image URL:
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />
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
