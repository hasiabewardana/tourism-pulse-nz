import { query } from "../services/db";

export interface Payment {
  payment_id: number;
  booking_id: number;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method?: string;
  stripe_customer_id?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

/**
 * Create a new payment record
 */
export const createPayment = async (
  bookingId: number,
  paymentIntentId: string,
  amount: number,
  currency: string = "NZD",
  status: string = "pending"
): Promise<Payment> => {
  const result = await query(
    `INSERT INTO dest.payments 
     (booking_id, payment_intent_id, amount, currency, status) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [bookingId, paymentIntentId, amount, currency, status]
  );
  return result[0];
};

/**
 * Get payment by payment_intent_id
 */
export const getPaymentByIntentId = async (
  paymentIntentId: string
): Promise<Payment | null> => {
  const result = await query(
    "SELECT * FROM dest.payments WHERE payment_intent_id = $1",
    [paymentIntentId]
  );
  return result[0] || null;
};

/**
 * Get payment by booking_id
 */
export const getPaymentByBookingId = async (
  bookingId: number
): Promise<Payment | null> => {
  const result = await query(
    "SELECT * FROM dest.payments WHERE booking_id = $1 ORDER BY created_at DESC LIMIT 1",
    [bookingId]
  );
  return result[0] || null;
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  paymentIntentId: string,
  status: string,
  paymentMethod?: string,
  metadata?: any
): Promise<Payment> => {
  const updates: string[] = ["status = $2", "updated_at = CURRENT_TIMESTAMP"];
  const values: any[] = [paymentIntentId, status];
  let paramIndex = 3;

  if (paymentMethod) {
    updates.push(`payment_method = $${paramIndex++}`);
    values.push(paymentMethod);
  }

  if (metadata) {
    updates.push(`metadata = $${paramIndex++}`);
    values.push(JSON.stringify(metadata));
  }

  const result = await query(
    `UPDATE dest.payments 
     SET ${updates.join(", ")} 
     WHERE payment_intent_id = $1 
     RETURNING *`,
    values
  );
  return result[0];
};

/**
 * Get all payments for a user (via bookings)
 */
export const getPaymentsByUserId = async (
  userId: number
): Promise<Payment[]> => {
  const result = await query(
    `SELECT p.* FROM dest.payments p
     JOIN dest.bookings b ON p.booking_id = b.booking_id
     WHERE b.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return result;
};

/**
 * Update booking payment status
 */
export const updateBookingPaymentStatus = async (
  bookingId: number,
  paymentIntentId: string,
  paymentStatus: string,
  amountPaid?: number,
  currency?: string,
  paymentMethod?: string
): Promise<void> => {
  const updates: string[] = ["payment_intent_id = $2", "payment_status = $3"];
  const values: any[] = [bookingId, paymentIntentId, paymentStatus];
  let paramIndex = 4;

  if (amountPaid !== undefined) {
    updates.push(`amount_paid = $${paramIndex++}`);
    values.push(amountPaid);
  }

  if (currency !== undefined) {
    updates.push(`currency = $${paramIndex++}`);
    values.push(currency);
  }

  if (paymentMethod !== undefined) {
    updates.push(`payment_method = $${paramIndex++}`);
    values.push(paymentMethod);
  }

  if (paymentStatus === "paid") {
    updates.push("paid_at = CURRENT_TIMESTAMP");
    updates.push("status = 'confirmed'");
  }

  await query(
    `UPDATE dest.bookings 
     SET ${updates.join(", ")} 
     WHERE booking_id = $1`,
    values
  );
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId: number): Promise<any> => {
  const result = await query(
    "SELECT * FROM dest.bookings WHERE booking_id = $1",
    [bookingId]
  );
  return result[0] || null;
};
