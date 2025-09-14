import { query } from "../services/db";

// Assign an operator to a destination
export const assignOperatorToDestination = async (
  userId: number,
  destinationId: number
) => {
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

// Get all destinations managed by an operator
export const getDestinationsByOperator = async (userId: number) => {
  const result = await query(
    `SELECT 
       od.operator_destination_id,
       od.user_id,
       od.destination_id,
       d.name,
       ST_AsText(d.location) as location,
       d.capacity,
       COALESCE(b.total_visitors, 0) as current_visitors,
       d.created_at,
       d.updated_at,
       d.photos,
       d.description,
       d.status
     FROM dest.operator_destinations od
     JOIN dest.destinations d ON od.destination_id = d.destination_id
     LEFT JOIN (
       SELECT destination_id, SUM(visitor_count) as total_visitors 
       FROM dest.bookings 
       WHERE status = 'confirmed' 
       AND DATE(booking_date) = CURRENT_DATE
       GROUP BY destination_id
     ) b ON d.destination_id = b.destination_id
     WHERE od.user_id = $1
     ORDER BY d.name ASC`,
    [userId]
  );
  return result;
};

// Get all operators for a destination
export const getOperatorsByDestination = async (destinationId: number) => {
  const result = await query(
    `SELECT 
       od.user_id,
       od.created_at
     FROM dest.operator_destinations od
     WHERE od.destination_id = $1
     ORDER BY od.user_id ASC`,
    [destinationId]
  );
  return result;
};

// Remove an operator from a destination
export const removeOperatorFromDestination = async (
  userId: number,
  destinationId: number
) => {
  const result = await query(
    `DELETE FROM dest.operator_destinations
     WHERE user_id = $1 AND destination_id = $2
     RETURNING operator_destination_id`,
    [userId, destinationId]
  );
  return result[0]?.operator_destination_id || null;
};
