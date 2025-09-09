-- Create index on offers.operator_id
CREATE INDEX IF NOT EXISTS idx_offers_operator_id ON dest.offers(operator_id);