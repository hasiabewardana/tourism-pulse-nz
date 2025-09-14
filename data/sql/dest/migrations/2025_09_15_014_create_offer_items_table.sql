-- Create dest.offer_items table
CREATE TABLE IF NOT EXISTS dest.offer_items (
    offer_item_id SERIAL PRIMARY KEY,
    offer_id INTEGER NOT NULL,
    destination_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT offer_items_offer_id_destination_id_key UNIQUE (offer_id, destination_id),
    CONSTRAINT offer_items_offer_id_fkey FOREIGN KEY (offer_id)
        REFERENCES dest.offers (offer_id)
        ON DELETE CASCADE,
    CONSTRAINT offer_items_destination_id_fkey FOREIGN KEY (destination_id)
        REFERENCES dest.destinations (destination_id)
        ON DELETE CASCADE
);