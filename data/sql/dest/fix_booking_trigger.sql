-- Fix for booking trigger error: "record new has no field destination_id"
-- This drops and recreates the trigger with the correct logic

-- First, check what triggers exist on bookings table
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'dest' 
  AND event_object_table = 'bookings';

-- Drop the problematic trigger if it exists
DROP TRIGGER IF EXISTS trigger_log_booking_analytics ON dest.bookings;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS log_booking_to_analytics();

-- Note: Analytics logging removed because analytics data is stored in MongoDB,
-- not PostgreSQL. The analytics-service microservice handles logging to MongoDB.
-- This trigger function is kept minimal to allow bookings to succeed.

CREATE OR REPLACE FUNCTION log_booking_to_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Analytics logging should be handled by the analytics-service microservice
    -- which uses MongoDB, not PostgreSQL
    -- This trigger simply allows the booking to complete successfully
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger (kept for compatibility, does nothing harmful)
CREATE TRIGGER trigger_log_booking_analytics
    AFTER INSERT ON dest.bookings
    FOR EACH ROW
    EXECUTE FUNCTION log_booking_to_analytics();

-- Verify the trigger was created
SELECT trigger_name, event_manipulation, event_object_table 
FROM information_schema.triggers 
WHERE event_object_schema = 'dest' 
  AND event_object_table = 'bookings';
