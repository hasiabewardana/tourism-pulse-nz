-- Create offers table
CREATE TABLE IF NOT EXISTS dest.offers (
    offer_id SERIAL PRIMARY KEY,
    operator_id INTEGER NOT NULL CHECK (operator_id > 0),  -- Logical ref
    destination_id INTEGER NOT NULL REFERENCES dest.destinations(destination_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    max_slots INTEGER NOT NULL DEFAULT 1 CHECK (max_slots > 0),
    available_from TIMESTAMP NOT NULL,
    available_to TIMESTAMP NOT NULL CHECK (available_to > available_from),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(operator_id, destination_id, name)
);