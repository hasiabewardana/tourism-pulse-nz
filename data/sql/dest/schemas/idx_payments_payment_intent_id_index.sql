-- Create index on payments.payment_intent_id
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON dest.payments(payment_intent_id);
