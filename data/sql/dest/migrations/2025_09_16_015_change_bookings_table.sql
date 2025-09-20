-- Change bookings table
ALTER TABLE dest.bookings
DROP CONSTRAINT bookings_destination_id_fkey; 

ALTER TABLE dest.bookings
DROP COLUMN destination_id;

ALTER TABLE dest.bookings
ADD COLUMN offer_id INTEGER REFERENCES dest.offers(offer_id) ON DELETE CASCADE;

ALTER TABLE dest.bookings
ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0.00;