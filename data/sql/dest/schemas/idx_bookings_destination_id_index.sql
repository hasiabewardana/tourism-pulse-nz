-- Create index on bookings.destination_id
CREATE INDEX IF NOT EXISTS idx_bookings_destination_id ON dest.bookings(destination_id);