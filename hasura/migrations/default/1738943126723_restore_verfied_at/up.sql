ALTER TABLE practices 
ALTER COLUMN verified_at TYPE timestamp USING verified_at::timestamp;
