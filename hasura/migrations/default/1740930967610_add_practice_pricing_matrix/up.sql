-- Add allowed_types and pricing_matrix to practices table
ALTER TABLE public.practices
  ADD COLUMN IF NOT EXISTS pricing_matrix jsonb DEFAULT '{}'::jsonb;
