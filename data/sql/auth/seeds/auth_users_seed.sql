-- Add seeds to auth.users
INSERT INTO auth.users (email, password_hash, role) VALUES
('admin1@tourismpulsenz.nz', '$2b$10$BWsfPyWOCaD8yRZRuJfUiO3AcSO2FSjN/e6fQ/uaxLxNjNq/gQfL6', 'admin'),
('operator1@tourismpulsenz.nz', '$2b$10$0SYH/l24piDd8bHEjfFqFuIthshaCYMG0CXngBbDHpCY.VpmBPNUa', 'operator'),
('user1@gmail.com', '$2b$10$xwBEG9m1Elaupz4NVlmueOfJzj8n/6VRuAIXL/szf3aCf7d.2xvE.', 'public');