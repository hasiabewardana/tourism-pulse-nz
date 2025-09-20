-- Create operator destinations table
CREATE TABLE IF NOT EXISTS dest.operator_destinations (
    operator_destination_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,  -- Logical ref to auth.users.user_id (validate in app)
    destination_id INTEGER NOT NULL REFERENCES dest.destinations(destination_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, destination_id),
    CHECK (user_id > 0)  -- Basic sanity check
);