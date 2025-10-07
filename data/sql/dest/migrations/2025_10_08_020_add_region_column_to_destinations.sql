-- Migration: Add region column to destinations table
-- Date: 2025-10-08
-- Purpose: Add region/state column for improved filtering and analytics

-- Add region column
ALTER TABLE dest.destinations 
ADD COLUMN region VARCHAR(50);

-- Populate region based on existing location names
UPDATE dest.destinations 
SET region = CASE
    WHEN name LIKE '%Milford%' OR name LIKE '%Queenstown%' OR name LIKE '%Dunedin%' THEN 'Otago'
    WHEN name LIKE '%Bay of Islands%' OR name LIKE '%Northland%' THEN 'Northland'
    WHEN name LIKE '%Auckland%' THEN 'Auckland'
    WHEN name LIKE '%Wellington%' THEN 'Wellington'
    WHEN name LIKE '%Christchurch%' OR name LIKE '%Canterbury%' THEN 'Canterbury'
    WHEN name LIKE '%Rotorua%' OR name LIKE '%Taupo%' THEN 'Bay of Plenty'
    WHEN name LIKE '%Hawke%' THEN 'Hawke''s Bay'
    WHEN name LIKE '%Nelson%' THEN 'Nelson'
    WHEN name LIKE '%Marlborough%' THEN 'Marlborough'
    WHEN name LIKE '%Taranaki%' THEN 'Taranaki'
    WHEN name LIKE '%Waikato%' THEN 'Waikato'
    WHEN name LIKE '%Gisborne%' THEN 'Gisborne'
    WHEN name LIKE '%Manawatu%' OR name LIKE '%Whanganui%' THEN 'Manawatū-Whanganui'
    WHEN name LIKE '%West Coast%' THEN 'West Coast'
    WHEN name LIKE '%Southland%' THEN 'Southland'
    WHEN name LIKE '%Tasman%' THEN 'Tasman'
    ELSE 'Unknown'
END;

-- Make region NOT NULL after population
ALTER TABLE dest.destinations 
ALTER COLUMN region SET NOT NULL;

-- Create index for fast filtering
CREATE INDEX idx_destinations_region ON dest.destinations(region);

-- Add comment to document the column
COMMENT ON COLUMN dest.destinations.region IS 'New Zealand region/state for the destination (e.g., Auckland, Canterbury, Otago)';
