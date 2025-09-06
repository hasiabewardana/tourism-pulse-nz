import { query } from "../services/db";

// Get all destinations
export const getAllDestinations = async (
  filters: {
    status?: string;
    availability?: "Full" | "Available";
    date?: string;
  } = {}
) => {
  let sql = `
    SELECT 
      d.destination_id, 
      d.name, 
      ST_AsText(d.location) as location,  -- Convert geography to WKT string for JSON response
      d.capacity, 
      COALESCE(b.total_visitors, 0) as current_visitors,
      d.created_at, 
      d.updated_at, 
      d.photos, 
      d.description, 
      d.status
    FROM dest.destinations d 
    LEFT JOIN (
      SELECT destination_id, SUM(visitor_count) as total_visitors 
      FROM dest.bookings 
      WHERE status = 'confirmed' 
      AND DATE(booking_date) = $1
      GROUP BY destination_id
    ) b ON d.destination_id = b.destination_id
  `;

  const params: any[] = [];
  let dateParam = "CURRENT_DATE"; // Default to today's date (2025-09-07)
  if (filters.date) {
    // Basic validation: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD.");
    }
    dateParam = filters.date;
  }
  params.push(dateParam); // Always push dateParam as $1

  const whereConditions: string[] = [];
  const whereParams: any[] = [];

  if (filters.status) {
    whereConditions.push("d.status = $2");
    whereParams.push(filters.status);
    params.push(...whereParams); // Append after date
  }

  let availabilityCond = "";
  if (filters.availability) {
    if (filters.availability === "Full") {
      availabilityCond = "AND COALESCE(b.total_visitors, 0) >= d.capacity";
    } else if (filters.availability === "Available") {
      availabilityCond = "AND COALESCE(b.total_visitors, 0) < d.capacity";
    }
  }

  if (whereConditions.length > 0 || availabilityCond) {
    sql +=
      " WHERE " +
      whereConditions.join(" AND ") +
      (whereConditions.length > 0 && availabilityCond
        ? " " + availabilityCond
        : availabilityCond);
  }

  sql += " ORDER BY d.name ASC";

  // Ensure finalParams is always correctly populated
  const finalParams = [...params]; // Copy params to avoid mutation issues

  console.log("Executing SQL:", sql, "with params:", finalParams); // Log for debugging
  try {
    const result = await query(sql, finalParams);
    return result;
  } catch (dbError: any) {
    console.error("Database query failed:", {
      sql,
      params: finalParams,
      error: dbError.message,
    });
    throw dbError; // Re-throw to be caught by controller
  }
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
    [name, location || "POINT(0 0)", capacity, JSON.stringify(photos)]
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
    [
      name,
      location || "POINT(0 0)",
      capacity,
      JSON.stringify(photos),
      destinationId,
    ]
  );
  return result[0].destination_id;
};

// Delete a destination
export const deleteDestination = async (destinationId: number) => {
  await query("DELETE FROM dest.destinations WHERE destination_id = $1", [
    destinationId,
  ]);
};
