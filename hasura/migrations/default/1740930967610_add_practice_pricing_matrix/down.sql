-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- -- Add allowed_types and pricing_matrix to practices table
-- ALTER TABLE public.practices
--   ADD COLUMN IF NOT EXISTS pricing_matrix jsonb DEFAULT '{}'::jsonb;
