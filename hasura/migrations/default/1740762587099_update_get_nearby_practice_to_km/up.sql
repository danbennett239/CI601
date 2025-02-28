-- Drop the old version of the function if it exists
DROP FUNCTION IF EXISTS public.get_nearby_practices(
  double precision,
  double precision,
  double precision
);

-- Create or replace the function returning distance in KM
CREATE OR REPLACE FUNCTION public.get_nearby_practices(
  user_lon double precision,
  user_lat double precision,
  max_distance double precision
)
RETURNS SETOF public.practices_with_distance
LANGUAGE sql
STABLE
AS $$
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
    p.location,

    -- Return distance in kilometers
    ST_Distance(
      ST_SetSRID(p.location, 4326)::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    ) / 1000 AS distance

  FROM public.practices p
  WHERE ST_DWithin(
    ST_SetSRID(p.location, 4326)::geography,
    ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
    max_distance
  );
$$;
