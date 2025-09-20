import { query } from "../services/db";

export const toggleSubscription = async (
  operatorId: number,
  destinationId: number,
  subscribed: boolean
) => {
  const result = await query(
    `INSERT INTO dest.subscriptions (operator_id, destination_id, subscribed)
     VALUES ($1, $2, $3)
     ON CONFLICT (operator_id, destination_id) 
     DO UPDATE SET subscribed = $3, updated_at = CURRENT_TIMESTAMP
     RETURNING subscription_id`,
    [operatorId, destinationId, subscribed]
  );
  return result[0]?.subscription_id || null;
};

export const checkSubscription = async (
  operatorId: number,
  destinationId: number
) => {
  const result = await query(
    `SELECT subscribed FROM dest.subscriptions 
     WHERE operator_id = $1 AND destination_id = $2`,
    [operatorId, destinationId]
  );
  return result[0]?.subscribed || false;
};
