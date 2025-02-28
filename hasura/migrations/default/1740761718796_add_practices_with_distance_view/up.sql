DROP VIEW IF EXISTS public.practices_with_distance CASCADE;

CREATE OR REPLACE VIEW public.practices_with_distance AS
SELECT
  p.practice_id,
  p.practice_name,
  p.email,
  p.phone_number,
  p.photo,
  p.address,
  p.opening_hours,
  p.verified,
  p.created_at,
  p.updated_at,
  p.verified_at,
  p.location,                   -- PostGIS geometry or geography
  0::double precision AS distance
FROM public.practices p;
