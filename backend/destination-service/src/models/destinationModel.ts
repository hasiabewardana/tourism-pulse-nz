import { query } from "../services/db";

// Get all destinations
export const getAllDestinations = async () => {
  const result = await query("SELECT * FROM dest.destinations");
  return result;
};

// Find destination by ID
export const findDestinationById = async (destinationId: number) => {
  const result = await query(
    "SELECT * FROM dest.destinations WHERE destination_id = $1",
    [destinationId]
  );
  return result[0] || null;
};

// Create a new destination
export const createDestination = async (
  name: string,
  location: string | null,
  capacity: number,
  photos: string[]
) => {
  const result = await query(
    "INSERT INTO dest.destinations (name, location, capacity, photos) VALUES ($1, ST_GeomFromText($2), $3, $4) RETURNING destination_id",
    [name, location || "POINT(0 0)", capacity, photos]
  );
  return result[0].destination_id;
};

// Update an existing destination
export const updateDestination = async (
  destinationId: number,
  name: string,
  location: string | null,
  capacity: number,
  photos: string[]
) => {
  const result = await query(
    "UPDATE dest.destinations SET name = $1, location = ST_GeomFromText($2), capacity = $3, photos = $4, updated_at = CURRENT_TIMESTAMP WHERE destination_id = $5 RETURNING destination_id",
    [name, location || "POINT(0 0)", capacity, photos, destinationId]
  );
  return result[0].destination_id;
};

// Delete a destination
export const deleteDestination = async (destinationId: number) => {
  await query("DELETE FROM dest.destinations WHERE destination_id = $1", [
    destinationId,
  ]);
};
