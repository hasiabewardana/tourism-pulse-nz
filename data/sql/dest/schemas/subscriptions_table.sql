-- Create subscriptions table
CREATE TABLE IF NOT EXISTS dest.subscriptions (
    subscription_id SERIAL PRIMARY KEY,
    operator_id INTEGER NOT NULL,
    destination_id INTEGER NOT NULL,
    subscribed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_destination FOREIGN KEY (destination_id) REFERENCES dest.destinations(destination_id),
    CONSTRAINT unique_subscription UNIQUE (operator_id, destination_id)
);