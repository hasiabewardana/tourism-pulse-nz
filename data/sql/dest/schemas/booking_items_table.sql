-- Create booking items table
CREATE TABLE IF NOT EXISTS dest.booking_items (
    booking_item_id SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES dest.bookings(booking_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL CHECK (user_id > 0),  -- Logical ref
    offer_id INTEGER REFERENCES dest.offers(offer_id) ON DELETE SET NULL,
    destination_id INTEGER NOT NULL REFERENCES dest.destinations(destination_id) ON DELETE CASCADE,
    visitor_count INTEGER NOT NULL CHECK (visitor_count > 0),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL CHECK (end_time > start_time),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),  -- Per-item status
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);