-- Migration: Add fields for advanced filtering and recommendations
-- Date: 2025-10-08
-- Purpose: Add necessary fields for recommendation system and advanced filtering

-- ============================================
-- Add fields to destinations table
-- ============================================

-- Category and classification
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS category VARCHAR(50);
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS subcategory VARCHAR(50);
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Pricing information
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS price_range VARCHAR(20);
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2) DEFAULT 0.0;

-- Accessibility and attributes
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS accessibility_features BOOLEAN DEFAULT false;
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false;
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS indoor BOOLEAN DEFAULT false;
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS outdoor BOOLEAN DEFAULT true;
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS family_friendly BOOLEAN DEFAULT true;
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false;

-- Operating information
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS operating_hours JSON;
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS seasonal_availability VARCHAR(50) DEFAULT 'Year-round';

-- Ratings and popularity
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE dest.destinations ADD COLUMN IF NOT EXISTS trending_score INTEGER DEFAULT 0;

-- Performance optimization: Add indexes
CREATE INDEX IF NOT EXISTS idx_destinations_category ON dest.destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_price ON dest.destinations(price_range);
CREATE INDEX IF NOT EXISTS idx_destinations_rating ON dest.destinations(rating);
CREATE INDEX IF NOT EXISTS idx_destinations_trending ON dest.destinations(trending_score);
CREATE INDEX IF NOT EXISTS idx_destinations_tags ON dest.destinations USING GIN(tags);

-- ============================================
-- Populate sample data for existing destinations
-- ============================================

-- Update categories based on destination names
UPDATE dest.destinations SET 
    category = CASE
        WHEN name ILIKE '%museum%' OR name ILIKE '%gallery%' THEN 'Cultural'
        WHEN name ILIKE '%beach%' OR name ILIKE '%bay%' THEN 'Beach'
        WHEN name ILIKE '%park%' OR name ILIKE '%forest%' OR name ILIKE '%reserve%' THEN 'Nature'
        WHEN name ILIKE '%mountain%' OR name ILIKE '%hiking%' OR name ILIKE '%trek%' THEN 'Adventure'
        WHEN name ILIKE '%sound%' OR name ILIKE '%fiord%' THEN 'Scenic'
        WHEN name ILIKE '%cave%' OR name ILIKE '%glowworm%' THEN 'Adventure'
        WHEN name ILIKE '%winery%' OR name ILIKE '%vineyard%' THEN 'Food & Wine'
        WHEN name ILIKE '%hot spring%' OR name ILIKE '%thermal%' THEN 'Relaxation'
        WHEN name ILIKE '%tower%' OR name ILIKE '%building%' THEN 'Urban'
        WHEN name ILIKE '%island%' THEN 'Nature'
        ELSE 'Scenic'
    END
WHERE category IS NULL;

-- Set default tags based on category
UPDATE dest.destinations SET 
    tags = CASE category
        WHEN 'Cultural' THEN ARRAY['educational', 'indoor', 'history', 'art']
        WHEN 'Beach' THEN ARRAY['outdoor', 'scenic', 'water-activities', 'family-friendly', 'photography']
        WHEN 'Nature' THEN ARRAY['outdoor', 'scenic', 'hiking', 'photography', 'wildlife']
        WHEN 'Adventure' THEN ARRAY['outdoor', 'active', 'adventure', 'thrilling', 'photography']
        WHEN 'Food & Wine' THEN ARRAY['culinary', 'relaxation', 'indoor', 'gourmet']
        WHEN 'Relaxation' THEN ARRAY['wellness', 'relaxation', 'outdoor', 'spa']
        WHEN 'Urban' THEN ARRAY['sightseeing', 'photography', 'entertainment']
        WHEN 'Scenic' THEN ARRAY['scenic', 'outdoor', 'photography', 'nature']
        ELSE ARRAY['scenic', 'outdoor', 'tourism']
    END
WHERE tags IS NULL OR tags = '{}';

-- Set price ranges based on capacity and type
UPDATE dest.destinations SET 
    price_range = CASE
        WHEN capacity < 100 THEN 'Premium'
        WHEN capacity < 300 THEN 'Moderate'
        WHEN category IN ('Nature', 'Beach') THEN 'Budget'
        ELSE 'Moderate'
    END,
    estimated_cost = CASE
        WHEN capacity < 100 THEN 120
        WHEN capacity < 300 THEN 60
        WHEN category IN ('Nature', 'Beach') THEN 15
        ELSE 45
    END
WHERE price_range IS NULL;

-- Set activity attributes based on category
UPDATE dest.destinations SET
    indoor = CASE 
        WHEN category IN ('Cultural', 'Urban', 'Food & Wine') THEN true
        ELSE false
    END,
    outdoor = CASE 
        WHEN category IN ('Beach', 'Nature', 'Adventure', 'Scenic') THEN true
        ELSE true
    END,
    family_friendly = CASE 
        WHEN category IN ('Beach', 'Nature', 'Cultural', 'Scenic') THEN true
        WHEN category = 'Adventure' THEN false
        ELSE true
    END,
    accessibility_features = CASE 
        WHEN category IN ('Urban', 'Cultural') THEN true
        ELSE false
    END
WHERE indoor IS NULL;

-- Set default ratings (simulate real data - will be updated by actual reviews)
UPDATE dest.destinations SET
    rating = 3.5 + (RANDOM() * 1.5)::DECIMAL(3,2),
    review_count = (RANDOM() * 300 + 50)::INTEGER,
    trending_score = (RANDOM() * 50)::INTEGER
WHERE rating = 0.0;

-- Set operating hours (default 9 AM to 5 PM)
UPDATE dest.destinations SET
    operating_hours = '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "10:00-16:00", "sunday": "10:00-16:00"}'::JSON
WHERE operating_hours IS NULL;

-- ============================================
-- Create user preferences table (PostgreSQL)
-- ============================================

CREATE TABLE IF NOT EXISTS dest.user_preferences (
    preference_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    preferred_categories TEXT[],
    preferred_regions TEXT[],
    budget_range VARCHAR(20),
    interests TEXT[],
    accessibility_required BOOLEAN DEFAULT false,
    travel_style VARCHAR(50), -- 'adventure', 'relaxation', 'cultural', 'luxury'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user ON dest.user_preferences(user_id);

-- ============================================
-- Create destination associations table
-- ============================================

CREATE TABLE IF NOT EXISTS dest.destination_associations (
    association_id SERIAL PRIMARY KEY,
    destination_id INTEGER REFERENCES dest.destinations(destination_id) ON DELETE CASCADE,
    related_destination_id INTEGER REFERENCES dest.destinations(destination_id) ON DELETE CASCADE,
    association_strength DECIMAL(3,2) CHECK (association_strength >= 0 AND association_strength <= 1),
    association_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(destination_id, related_destination_id)
);

CREATE INDEX IF NOT EXISTS idx_dest_associations_dest ON dest.destination_associations(destination_id);
CREATE INDEX IF NOT EXISTS idx_dest_associations_related ON dest.destination_associations(related_destination_id);

-- ============================================
-- Create sample associations
-- ============================================

-- Associate destinations in same region
INSERT INTO dest.destination_associations (destination_id, related_destination_id, association_strength, association_type)
SELECT 
    d1.destination_id,
    d2.destination_id,
    0.7,
    'same_region'
FROM dest.destinations d1
CROSS JOIN dest.destinations d2
WHERE d1.region = d2.region 
  AND d1.destination_id < d2.destination_id
  AND NOT EXISTS (
      SELECT 1 FROM dest.destination_associations 
      WHERE destination_id = d1.destination_id 
      AND related_destination_id = d2.destination_id
  )
LIMIT 50;

-- Associate destinations with same category
INSERT INTO dest.destination_associations (destination_id, related_destination_id, association_strength, association_type)
SELECT 
    d1.destination_id,
    d2.destination_id,
    0.6,
    'same_category'
FROM dest.destinations d1
CROSS JOIN dest.destinations d2
WHERE d1.category = d2.category 
  AND d1.destination_id < d2.destination_id
  AND NOT EXISTS (
      SELECT 1 FROM dest.destination_associations 
      WHERE destination_id = d1.destination_id 
      AND related_destination_id = d2.destination_id
  )
LIMIT 50;

-- ============================================
-- Add triggers for automatic updates
-- ============================================

-- Trigger to update trending_score based on recent bookings
CREATE OR REPLACE FUNCTION dest.update_trending_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dest.destinations 
    SET trending_score = (
        SELECT COUNT(*) 
        FROM dest.bookings 
        WHERE destination_id = NEW.destination_id 
        AND booking_date >= CURRENT_DATE - INTERVAL '7 days'
    )
    WHERE destination_id = NEW.destination_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_trending ON dest.bookings;
CREATE TRIGGER trigger_update_trending
AFTER INSERT ON dest.bookings
FOR EACH ROW
EXECUTE FUNCTION dest.update_trending_score();

-- ============================================
-- Create materialized view for popular destinations
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS dest.popular_destinations AS
SELECT 
    d.*,
    COUNT(b.booking_id) as recent_bookings,
    AVG(o.price) as avg_booking_price
FROM dest.destinations d
LEFT JOIN dest.offer_items oi ON d.destination_id = oi.destination_id
LEFT JOIN dest.offers o ON oi.offer_id = o.offer_id
LEFT JOIN dest.bookings b ON o.offer_id = b.offer_id 
    AND b.booking_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY d.destination_id
ORDER BY recent_bookings DESC, d.rating DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_destinations_id ON dest.popular_destinations(destination_id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION dest.refresh_popular_destinations()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY dest.popular_destinations;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE dest.user_preferences IS 'Stores user preferences for personalized recommendations';
COMMENT ON TABLE dest.destination_associations IS 'Stores relationships between destinations for recommendations';
COMMENT ON MATERIALIZED VIEW dest.popular_destinations IS 'Cached view of popular destinations for performance';
