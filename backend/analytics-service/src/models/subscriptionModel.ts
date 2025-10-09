import { query } from "../services/db";

export const toggleSubscription = async (
  operatorId: number,
  destinationId: number,
  subscribed: boolean
): Promise<void> => {
  await query(
    `INSERT INTO dest.subscriptions (operator_id, destination_id, subscribed)
     VALUES ($1, $2, $3)
     ON CONFLICT (operator_id, destination_id)
     DO UPDATE SET subscribed = $3`,
    [operatorId, destinationId, subscribed]
  );
};

export const checkSubscription = async (
  operatorId: number,
  destinationId: number
): Promise<boolean> => {
  const result = await query(
    `SELECT subscribed FROM dest.subscriptions 
     WHERE operator_id = $1 AND destination_id = $2`,
    [operatorId, destinationId]
  );
  return result[0]?.subscribed || false;
};
