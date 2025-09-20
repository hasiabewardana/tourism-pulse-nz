import { query } from "../services/db";

// Format date to YYYY-MM-DD in Pacific/Auckland time zone (current: 2025-09-17)
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
  return getCurrentDateNZ(); // Defaults to 2025-09-17
};

// ==================== OPERATOR-DESTINATION JUNCTION OPERATIONS ====================

// Assign an operator to a destination (idempotent: ignores if exists)
export const assignOperatorToDestination = async (
  userId: number,
  destinationId: number
): Promise<number | null> => {
  const result = await query(
    `INSERT INTO dest.operator_destinations (user_id, destination_id)
     VALUES ($1, $2)
     ON CONFLICT ON CONSTRAINT operator_destinations_user_id_destination_id_key
     DO NOTHING
     RETURNING operator_destination_id`,
    [userId, destinationId]
  );
  return result[0]?.operator_destination_id || null;
};

// Get all destinations managed by an operator with filters
export const getDestinationsByOperator = async (
  userId: number,
  filters: {
    status?: string;
    availability?: "Full" | "Available";
    date?: string;
  } = {}
): Promise<any[]> => {
  let sql = `
    SELECT 
      od.operator_destination_id,
      od.user_id,
      od.destination_id,
      d.name,
      ST_AsText(d.location) AS location,
      d.capacity,
      COALESCE(b.total_visitors, 0) AS current_visitors,
      d.created_at,
      d.updated_at,
      d.photos,
      d.description,
      d.status
    FROM dest.operator_destinations od
    JOIN dest.destinations d ON od.destination_id = d.destination_id
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
    WHERE od.user_id = $2
  `;

  const dateParam = parseDateParam(filters.date);
  const params: any[] = [dateParam, userId];
  const whereConditions: string[] = [];
  const whereParams: any[] = [];

  // Status filter
  if (filters.status) {
    const paramIndex = params.length + 1;
    whereConditions.push(`d.status = $${paramIndex}`);
    whereParams.push(filters.status);
  }

  // Availability condition
  let availabilityCond = "";
  if (filters.availability) {
    if (filters.availability === "Full") {
      availabilityCond = "COALESCE(b.total_visitors, 0) >= d.capacity";
    } else if (filters.availability === "Available") {
      availabilityCond = "COALESCE(b.total_visitors, 0) < d.capacity";
    }
  }

  // Build WHERE clause
  const allConditions = [...whereConditions];
  if (availabilityCond) allConditions.push(availabilityCond);

  if (allConditions.length > 0) {
    sql += " AND " + allConditions.join(" AND ");
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

// Get all operators for a destination with filters (enhanced with user details)
export const getOperatorsByDestination = async (
  destinationId: number,
  filters: {
    role?: string; // e.g., "operator"
  } = {}
): Promise<any[]> => {
  let sql = `
    SELECT 
      od.user_id,
      od.created_at,
      COALESCE(u.name, '') AS operator_name,  -- Assume users table with name
      COALESCE(u.email, '') AS operator_email,
      COALESCE(u.role, '') AS role
    FROM dest.operator_destinations od
    LEFT JOIN dest.users u ON od.user_id = u.user_id  -- Adjust schema if users is in auth schema
    WHERE od.destination_id = $1
  `;

  const params: any[] = [destinationId];
  const whereConditions: string[] = [];
  const whereParams: any[] = [];

  // Role filter
  if (filters.role) {
    const paramIndex = params.length + 1;
    whereConditions.push(`COALESCE(u.role, '') = $${paramIndex}`);
    whereParams.push(filters.role);
  }

  if (whereConditions.length > 0) {
    sql += " AND " + whereConditions.join(" AND ");
    params.push(...whereParams);
  }

  sql += " ORDER BY od.user_id ASC";

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

// Get a specific operator-destination assignment by ID
export const getOperatorDestinationById = async (
  operatorDestinationId: number
): Promise<any | null> => {
  const result = await query(
    `SELECT 
       od.operator_destination_id,
       od.user_id,
       od.destination_id,
       od.created_at
     FROM dest.operator_destinations od
     WHERE od.operator_destination_id = $1`,
    [operatorDestinationId]
  );
  return result[0] || null;
};

// Remove an operator from a destination
export const removeOperatorFromDestination = async (
  userId: number,
  destinationId: number
): Promise<number | null> => {
  const result = await query(
    `DELETE FROM dest.operator_destinations
     WHERE user_id = $1 AND destination_id = $2
     RETURNING operator_destination_id`,
    [userId, destinationId]
  );
  return result[0]?.operator_destination_id || null;
};
