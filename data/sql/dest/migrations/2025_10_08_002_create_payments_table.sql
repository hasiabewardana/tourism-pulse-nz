-- Create payments table for detailed payment tracking
-- Migration: Create payments table
-- Date: 2025-10-08

CREATE TABLE IF NOT EXISTS dest.payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES dest.bookings(booking_id) ON DELETE CASCADE,
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NZD',
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded')),
    payment_method VARCHAR(50),
    stripe_customer_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON dest.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON dest.payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON dest.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON dest.payments(created_at DESC);

-- Add comments
COMMENT ON TABLE dest.payments IS 'Tracks all payment transactions for bookings';
COMMENT ON COLUMN dest.payments.payment_intent_id IS 'Stripe Payment Intent ID';
COMMENT ON COLUMN dest.payments.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN dest.payments.status IS 'Payment status from Stripe';
COMMENT ON COLUMN dest.payments.stripe_customer_id IS 'Stripe Customer ID for repeat customers';
COMMENT ON COLUMN dest.payments.metadata IS 'Additional payment metadata in JSON format';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_payments_updated_at
    BEFORE UPDATE ON dest.payments
    FOR EACH ROW
    EXECUTE FUNCTION update_payments_updated_at();
