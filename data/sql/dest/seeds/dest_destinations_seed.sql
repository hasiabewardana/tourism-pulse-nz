INSERT INTO dest.destinations (name, location, capacity) VALUES
('Milford Sound', ST_SetSRID(ST_MakePoint(-44.6721, 167.9265), 4326), 500),
('Bay of Islands', ST_SetSRID(ST_MakePoint(-35.2671, 174.1055), 4326), 300);