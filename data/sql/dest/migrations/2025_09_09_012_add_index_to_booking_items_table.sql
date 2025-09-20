-- Create index on booking_items.user_id
CREATE INDEX IF NOT EXISTS idx_booking_items_user ON dest.booking_items(user_id);