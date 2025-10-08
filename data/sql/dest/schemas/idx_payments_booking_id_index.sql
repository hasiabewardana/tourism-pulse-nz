-- Create index on payments.booking_id
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON dest.payments(booking_id);
