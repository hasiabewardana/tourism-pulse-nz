-- Fix for trending score trigger error: "record new has no field destination_id"
-- The bookings table doesn't have destination_id directly.
-- We need to join through: bookings -> offers -> offer_items -> destinations

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS trigger_update_trending ON dest.bookings;

-- Drop and recreate the function with correct logic
DROP FUNCTION IF EXISTS dest.update_trending_score();

CREATE OR REPLACE FUNCTION dest.update_trending_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Update trending score for all destinations associated with this booking
    -- by joining through offers and offer_items
    UPDATE dest.destinations d
    SET trending_score = (
        SELECT COUNT(DISTINCT b.booking_id)
        FROM dest.bookings b
        JOIN dest.offers o ON b.offer_id = o.offer_id
        JOIN dest.offer_items oi ON o.offer_id = oi.offer_id
        WHERE oi.destination_id = d.destination_id
        AND b.booking_date >= CURRENT_DATE - INTERVAL '7 days'
        AND b.status IN ('confirmed', 'pending')
    )
    WHERE d.destination_id IN (
        SELECT DISTINCT oi.destination_id
        FROM dest.offers o
        JOIN dest.offer_items oi ON o.offer_id = oi.offer_id
        WHERE o.offer_id = NEW.offer_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_update_trending
AFTER INSERT OR UPDATE ON dest.bookings
FOR EACH ROW
EXECUTE FUNCTION dest.update_trending_score();

-- Verify the trigger was created
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'dest' 
  AND event_object_table = 'bookings'
  AND trigger_name = 'trigger_update_trending';

COMMENT ON FUNCTION dest.update_trending_score() IS 
'Updates destination trending_score based on bookings from the last 7 days. 
Handles the relationship: bookings -> offers -> offer_items -> destinations';
