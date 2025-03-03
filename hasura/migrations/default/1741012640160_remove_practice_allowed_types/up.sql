ALTER TABLE practices
DROP COLUMN IF EXISTS allowed_types;

-- Rename pricing_matrix to practice_services
ALTER TABLE practices
RENAME COLUMN pricing_matrix TO practice_services;
