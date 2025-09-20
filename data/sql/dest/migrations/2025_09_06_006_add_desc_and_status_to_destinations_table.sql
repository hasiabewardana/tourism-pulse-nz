-- Alter dest.destinations table to incorporate description
ALTER TABLE dest.destinations
ADD COLUMN IF NOT EXISTS description VARCHAR DEFAULT NULL;

-- Alter dest.destinations table to incorporate status
ALTER TABLE dest.destinations
ADD COLUMN IF NOT EXISTS status VARCHAR(100) DEFAULT 'Open';