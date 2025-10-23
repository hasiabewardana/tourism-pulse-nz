-- Add payment tracking fields to bookings table
-- Migration: Add payment support to bookings
-- Date: 2025-10-08

ALTER TABLE dest.bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid' 
    CHECK (payment_status IN ('unpaid', 'processing', 'paid', 'refunded', 'failed')),
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'NZD',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;

-- Create index for payment_intent_id lookups
CREATE INDEX IF NOT EXISTS idx_bookings_payment_intent ON dest.bookings(payment_intent_id);

-- Create index for payment_status
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON dest.bookings(payment_status);

COMMENT ON COLUMN dest.bookings.payment_status IS 'Payment status: unpaid, processing, paid, refunded, failed';
COMMENT ON COLUMN dest.bookings.payment_intent_id IS 'Stripe Payment Intent ID';
COMMENT ON COLUMN dest.bookings.amount_paid IS 'Amount paid in the specified currency';
COMMENT ON COLUMN dest.bookings.currency IS 'Currency code (e.g., NZD, USD)';
COMMENT ON COLUMN dest.bookings.payment_method IS 'Payment method used (e.g., card, bank_transfer)';
COMMENT ON COLUMN dest.bookings.paid_at IS 'Timestamp when payment was completed';
