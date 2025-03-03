-- Add services column without NOT NULL first
ALTER TABLE appointments
ADD COLUMN services JSONB;

-- Populate existing rows (e.g., with an empty object or from practice_services)
UPDATE appointments
SET services = '{}'
WHERE services IS NULL;

-- Make NOT NULL
ALTER TABLE appointments
ALTER COLUMN services SET NOT NULL;

-- Add booked_service and indexes
ALTER TABLE appointments
ADD COLUMN booked_service JSONB;
