import { query } from "../services/db";

// Format date to YYYY-MM-DD in Pacific/Auckland time zone
const getCurrentDateNZ = (): string => {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Pacific/Auckland",
  });
};

// Validate and parse date (YYYY-MM-DD)
const parseDateParam = (dateStr?: string): string => {
  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  return getCurrentDateNZ();
};

// ==================== DESTINATION OPERATIONS ====================

// Get all destinations with filters
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
      ST_AsText(d.location) AS location,
      d.capacity, 
      COALESCE(b.total_visitors, 0) AS current_visitors,
      d.created_at, 
      d.updated_at, 
      d.photos, 
      d.description, 
      d.status
    FROM dest.destinations d 
    LEFT JOIN (
      SELECT 
        oi.destination_id, 
        SUM(bk.visitor_count) AS total_visitors 
      FROM dest.bookings bk
      JOIN dest.offers o ON bk.offer_id = o.offer_id
      JOIN dest.offer_items oi ON o.offer_id = oi.offer_id
      WHERE bk.status = 'confirmed' 
        AND DATE(bk.booking_date) = $1
      GROUP BY oi.destination_id
    ) b ON d.destination_id = b.destination_id
  `;

  const dateParam = parseDateParam(filters.date);
  const params: any[] = [dateParam];
  const whereConditions: string[] = [];
  const whereParams: any[] = [];

  // Status filter
  if (filters.status) {
    whereConditions.push("d.status = $" + (params.length + 1));
    whereParams.push(filters.status);
  }

  // Availability condition (without leading "AND")
  let availabilityCond = "";
  if (filters.availability) {
    if (filters.availability === "Full") {
      availabilityCond = "COALESCE(b.total_visitors, 0) >= d.capacity";
    } else if (filters.availability === "Available") {
      availabilityCond = "COALESCE(b.total_visitors, 0) < d.capacity";
    }
    // No param needed, uses existing columns
  }

  // Build WHERE clause
  if (whereConditions.length > 0 || availabilityCond) {
    const whereClause = whereConditions.join(" AND ");
    sql +=
      " WHERE " +
      (whereClause ? whereClause : "") +
      (whereClause && availabilityCond
        ? " AND " + availabilityCond
        : availabilityCond
        ? availabilityCond
        : "");
    params.push(...whereParams);
  }

  sql += " ORDER BY d.name ASC";

  console.log("Executing SQL:", sql, "with params:", params); // Log for debugging
  try {
    const result = await query(sql, params);
    return result;
  } catch (dbError: any) {
    console.error("Database query failed:", {
      sql,
      params,
      error: dbError.message,
    });
    throw dbError;
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
  description: string,
  location: string | null,
  capacity: number,
  photos: string[]
) => {
  const result = await query(
    "INSERT INTO dest.destinations (name, description, location, capacity, photos) VALUES ($1, $2, ST_GeomFromText($3), $4, $5) RETURNING destination_id",
    [
      name,
      description,
      location || "POINT(0 0)",
      capacity,
      JSON.stringify(photos),
    ]
  );
  return result[0].destination_id;
};

// Update an existing destination (now includes description)
export const updateDestination = async (
  destinationId: number,
  name: string,
  description: string,
  location: string | null,
  capacity: number,
  photos: string[]
) => {
  const result = await query(
    "UPDATE dest.destinations SET name = $1, description = $2, location = ST_GeomFromText($3), capacity = $4, photos = $5, updated_at = CURRENT_TIMESTAMP WHERE destination_id = $6 RETURNING destination_id",
    [
      name,
      description,
      location || "POINT(0 0)",
      capacity,
      JSON.stringify(photos),
      destinationId,
    ]
  );
  return result[0]?.destination_id || null; // Null if no rows affected
};

// Delete a destination (cascades to offer_items via FK)
export const deleteDestination = async (destinationId: number) => {
  const result = await query(
    "DELETE FROM dest.destinations WHERE destination_id = $1 RETURNING destination_id",
    [destinationId]
  );
  return result[0]?.destination_id || null;
};

// ==================== OFFER OPERATIONS ====================

// Get all offers with filters (aggregated current_booked and remaining_slots)
export const getAllOffers = async (
  filters: {
    status?: string;
    availability?: "Full" | "Available";
    date?: string;
  } = {}
) => {
  let sql = `
    SELECT 
      o.offer_id, 
      o.operator_id,
      o.name, 
      o.description, 
      o.price, 
      o.max_slots, 
      COALESCE(bo.total_booked, 0) AS current_booked,
      (o.max_slots - COALESCE(bo.total_booked, 0)) AS remaining_slots,
      o.available_from, 
      o.available_to, 
      o.status,
      o.created_at, 
      o.updated_at
    FROM dest.offers o 
    LEFT JOIN (
      SELECT 
        offer_id, 
        SUM(bk.visitor_count) AS total_booked 
      FROM dest.bookings bk
      WHERE bk.status = 'confirmed' 
        AND DATE(bk.booking_date) = $1
      GROUP BY offer_id
    ) bo ON o.offer_id = bo.offer_id
  `;

  const dateParam = parseDateParam(filters.date);
  const params: any[] = [dateParam];
  const whereConditions: string[] = [];
  const whereParams: any[] = [];

  // Active on date filter (always apply if date provided)
  let dateFilter = "";
  if (filters.date) {
    dateFilter =
      "DATE($2) >= DATE(o.available_from) AND DATE($2) <= DATE(o.available_to)";
    params.push(dateParam); // $2 for date in filter
  }

  // Status filter
  if (filters.status) {
    const paramIndex = params.length + 1;
    whereConditions.push(`o.status = $${paramIndex}`);
    whereParams.push(filters.status);
  }

  // Availability condition (based on remaining_slots)
  let availabilityCond = "";
  if (filters.availability) {
    if (filters.availability === "Full") {
      availabilityCond = "(o.max_slots - COALESCE(bo.total_booked, 0)) <= 0";
    } else if (filters.availability === "Available") {
      availabilityCond = "(o.max_slots - COALESCE(bo.total_booked, 0)) > 0";
    }
  }

  // Build WHERE clause
  const allConditions = [...whereConditions];
  if (dateFilter) allConditions.push(dateFilter);
  if (availabilityCond) allConditions.push(availabilityCond);

  if (allConditions.length > 0) {
    sql += " WHERE " + allConditions.join(" AND ");
    params.push(...whereParams);
  }

  sql += " ORDER BY o.name ASC";

  console.log("Executing SQL:", sql, "with params:", params);
  try {
    const result = await query(sql, params);
    return result;
  } catch (dbError: any) {
    console.error("Database query failed:", {
      sql,
      params,
      error: dbError.message,
    });
    throw dbError;
  }
};

// Create a new offer
export const createOffer = async (
  operatorId: number,
  name: string,
  description: string,
  price: number,
  maxSlots: number,
  availableFrom: Date,
  availableTo: Date
) => {
  const result = await query(
    "INSERT INTO dest.offers (operator_id, name, description, price, max_slots, available_from, available_to) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING offer_id",
    [operatorId, name, description, price, maxSlots, availableFrom, availableTo]
  );
  return result[0].offer_id;
};

// Update an existing offer
export const updateOffer = async (
  offerId: number,
  name?: string,
  description?: string,
  price?: number,
  maxSlots?: number,
  availableFrom?: Date,
  availableTo?: Date
) => {
  const updates: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    params.push(name);
  }
  if (description !== undefined) {
    updates.push(`description = $${paramIndex++}`);
    params.push(description);
  }
  if (price !== undefined) {
    updates.push(`price = $${paramIndex++}`);
    params.push(price);
  }
  if (maxSlots !== undefined) {
    updates.push(`max_slots = $${paramIndex++}`);
    params.push(maxSlots);
  }
  if (availableFrom !== undefined) {
    updates.push(`available_from = $${paramIndex++}`);
    params.push(availableFrom);
  }
  if (availableTo !== undefined) {
    updates.push(`available_to = $${paramIndex++}`);
    params.push(availableTo);
  }

  if (updates.length === 0) {
    throw new Error("No fields provided for update");
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  params.push(offerId); // Last param for WHERE

  const sql = `UPDATE dest.offers SET ${updates.join(
    ", "
  )} WHERE offer_id = $${paramIndex} RETURNING offer_id`;
  const result = await query(sql, params);
  return result[0]?.offer_id || null;
};

// Delete an offer (cascades to bookings and offer_items)
export const deleteOffer = async (offerId: number) => {
  const result = await query(
    "DELETE FROM dest.offers WHERE offer_id = $1 RETURNING offer_id",
    [offerId]
  );
  return result[0]?.offer_id || null;
};

// ==================== OFFER-DESTINATION JUNCTION OPERATIONS ====================

// Add a destination to an offer (insert if not exists)
export const addDestinationToOffer = async (
  offerId: number,
  destinationId: number
) => {
  const result = await query(
    "INSERT INTO dest.offer_items (offer_id, destination_id) VALUES ($1, $2) ON CONFLICT (offer_id, destination_id) DO NOTHING RETURNING offer_item_id",
    [offerId, destinationId]
  );
  return result[0]?.offer_item_id || null; // Null if already exists
};

// Remove a destination from an offer (cascades if needed)
export const removeDestinationFromOffer = async (
  offerId: number,
  destinationId: number
) => {
  const result = await query(
    "DELETE FROM dest.offer_items WHERE offer_id = $1 AND destination_id = $2 RETURNING offer_item_id",
    [offerId, destinationId]
  );
  return result[0]?.offer_item_id || null;
};

// Get destinations for an offer
export const getOfferDestinations = async (offerId: number) => {
  const result = await query(
    "SELECT destination_id FROM dest.offer_items WHERE offer_id = $1 ORDER BY destination_id",
    [offerId]
  );
  return result.map((row: any) => row.destination_id);
};
