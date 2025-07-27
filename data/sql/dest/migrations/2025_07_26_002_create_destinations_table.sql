-- Create destinations table
CREATE TABLE IF NOT EXISTS dest.destinations (
    destination_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT),
    capacity INTEGER NOT NULL,
    current_visitors INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);