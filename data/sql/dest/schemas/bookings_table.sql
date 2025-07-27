-- Create bookings table
CREATE TABLE IF NOT EXISTS dest.bookings (
    booking_id SERIAL PRIMARY KEY,
    destination_id INTEGER REFERENCES dest.destinations(destination_id) ON DELETE CASCADE,
    user_id INTEGER,
    booking_date TIMESTAMP NOT NULL,
    visitor_count INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);