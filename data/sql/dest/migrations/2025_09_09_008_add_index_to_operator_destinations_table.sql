-- Create index on operator_destinations.user_id
CREATE INDEX IF NOT EXISTS idx_operator_destinations_user ON dest.operator_destinations(user_id);