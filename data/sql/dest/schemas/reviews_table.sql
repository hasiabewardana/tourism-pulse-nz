CREATE TABLE IF NOT EXISTS dest.reviews (
    review_id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES dest.bookings(booking_id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,
    destination_id INTEGER REFERENCES dest.destinations(destination_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_booking_id ON dest.reviews(booking_id);
CREATE INDEX idx_reviews_destination_id ON dest.reviews(destination_id);
CREATE INDEX idx_reviews_featured ON dest.reviews(is_featured) WHERE is_featured = TRUE;
