-- Add allowed_types and pricing_matrix to practices table
ALTER TABLE public.practices
  ADD COLUMN IF NOT EXISTS allowed_types text[] DEFAULT ARRAY[]::text[];
