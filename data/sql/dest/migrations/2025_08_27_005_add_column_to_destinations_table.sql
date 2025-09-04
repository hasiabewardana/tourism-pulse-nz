-- Alter dest.destinations table to incorporate photos
ALTER TABLE dest.destinations
ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '["https://default-destination-thumbnail.jpg"]';