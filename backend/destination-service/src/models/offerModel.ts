import { query } from "../services/db";

// Create a new offer
export const createOfferModel = async (
  operatorId: number,
  name: string,
  description: string | undefined,
  price: number,
  max_slots: number,
  available_from: string,
  available_to: string,
  status: string,
  destinationIds: number[]
) => {
  // Start transaction
  const client = await query("BEGIN", []);

  try {
    // Insert offer
    const insertOfferResult = await query(
      `
      INSERT INTO dest.offers (
        operator_id,
        name,
        description,
        price,
        max_slots,
        available_from,
        available_to,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING offer_id
      `,
      [
        operatorId,
        name,
        description || null,
        price,
        max_slots,
        available_from,
        available_to,
        status,
      ]
    );

    const offerId = insertOfferResult[0].offer_id;

    // Insert offer_items
    for (const destinationId of destinationIds) {
      await query(
        "INSERT INTO dest.offer_items (offer_id, destination_id) VALUES ($1, $2)",
        [offerId, destinationId]
      );
    }

    // Commit transaction
    await query("COMMIT", []);
    return offerId;
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK", []);
    throw error;
  }
};

// Get all offers (admin)
export const getAllOffersModel = async (
  filters: { status?: string; date?: string } = {}
) => {
  let sql = `
    SELECT 
      o.offer_id,
      o.operator_id,
      o.name,
      o.description,
      o.price,
      o.max_slots,
      o.available_from,
      o.available_to,
      o.status,
      o.created_at,
      o.updated_at,
      COALESCE(
        (SELECT json_agg(json_build_object('id', oi.destination_id, 'name', d.name))
         FROM dest.offer_items oi
         JOIN dest.destinations d ON oi.destination_id = d.destination_id
         WHERE oi.offer_id = o.offer_id),
        '[]'
      ) as destinations
    FROM dest.offers o
  `;

  const params: any[] = [];
  const whereConditions: string[] = [];

  if (filters.status) {
    whereConditions.push("o.status = $1");
    params.push(filters.status);
  }

  if (filters.date) {
    whereConditions.push(
      "o.available_from <= $2::date AND o.available_to >= $2::date"
    );
    params.push(filters.date);
  }

  if (whereConditions.length > 0) {
    sql += " WHERE " + whereConditions.join(" AND ");
  }

  sql += " ORDER BY o.created_at DESC";

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

// Get offers by operator
export const getOffersByOperatorModel = async (
  operatorId: number,
  filters: { status?: string; date?: string } = {}
) => {
  let sql = `
    SELECT 
      o.offer_id,
      o.operator_id,
      o.name,
      o.description,
      o.price,
      o.max_slots,
      o.available_from,
      o.available_to,
      o.status,
      o.created_at,
      o.updated_at,
      COALESCE(
        (SELECT json_agg(json_build_object('id', oi.destination_id, 'name', d.name))
         FROM dest.offer_items oi
         JOIN dest.destinations d ON oi.destination_id = d.destination_id
         WHERE oi.offer_id = o.offer_id),
        '[]'
      ) as destinations
    FROM dest.offers o
    WHERE o.operator_id = $1
  `;

  const params: any[] = [operatorId];
  const whereConditions: string[] = [];

  if (filters.status) {
    whereConditions.push("o.status = $2");
    params.push(filters.status);
  }

  if (filters.date) {
    const paramIndex = params.length + 1;
    whereConditions.push(
      `o.available_from <= $${paramIndex}::date AND o.available_to >= $${paramIndex}::date`
    );
    params.push(filters.date);
  }

  if (whereConditions.length > 0) {
    sql += " AND " + whereConditions.join(" AND ");
  }

  sql += " ORDER BY o.created_at DESC";

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

// Find offer by ID
export const findOfferById = async (offerId: number) => {
  const result = await query("SELECT * FROM dest.offers WHERE offer_id = $1", [
    offerId,
  ]);
  return result[0] || null;
};

// Update an offer
export const updateOfferModel = async (
  offerId: number,
  name: string,
  description: string | undefined,
  price: number,
  max_slots: number,
  available_from: string,
  available_to: string,
  status: string,
  destinationIds: number[]
) => {
  // Start transaction
  const client = await query("BEGIN", []);

  try {
    // Update offer
    const updateOfferResult = await query(
      `
      UPDATE dest.offers
      SET 
        name = $1,
        description = $2,
        price = $3,
        max_slots = $4,
        available_from = $5,
        available_to = $6,
        status = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE offer_id = $8
      RETURNING offer_id
      `,
      [
        name,
        description || null,
        price,
        max_slots,
        available_from,
        available_to,
        status,
        offerId,
      ]
    );

    // Delete existing offer_items
    await query("DELETE FROM dest.offer_items WHERE offer_id = $1", [offerId]);

    // Insert new offer_items
    for (const destinationId of destinationIds) {
      await query(
        "INSERT INTO dest.offer_items (offer_id, destination_id) VALUES ($1, $2)",
        [offerId, destinationId]
      );
    }

    // Commit transaction
    await query("COMMIT", []);
    return updateOfferResult[0].offer_id;
  } catch (error) {
    // Rollback transaction on error
    await query("ROLLBACK", []);
    throw error;
  }
};

// Delete an offer
export const deleteOfferModel = async (offerId: number) => {
  await query("DELETE FROM dest.offers WHERE offer_id = $1", [offerId]);
};
