ALTER TABLE practices 
ALTER COLUMN verified_at TYPE timestamptz USING verified_at::timestamptz;
