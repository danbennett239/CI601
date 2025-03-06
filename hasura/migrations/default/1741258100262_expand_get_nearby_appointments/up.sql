DROP FUNCTION IF EXISTS public.get_nearby_appointments;

CREATE OR REPLACE FUNCTION public.get_nearby_appointments(
  user_lon double precision DEFAULT NULL, -- Optional longitude
  user_lat double precision DEFAULT NULL, -- Optional latitude
  max_distance double precision DEFAULT 10000, -- Default 10km
  limit_num integer DEFAULT 10, -- Default limit
  appointment_type text[] DEFAULT NULL, -- Array of appointment types
  price_min numeric DEFAULT NULL, -- Optional min price
  price_max numeric DEFAULT NULL, -- Optional max price
  date_start timestamp without time zone DEFAULT NULL, -- Optional start date
  date_end timestamp without time zone DEFAULT NULL, -- Optional end date
  sort_by text DEFAULT 'soonest' -- Default sort by soonest
) RETURNS SETOF appointments_with_distance LANGUAGE sql STABLE AS $function$
SELECT
  a.appointment_id,
  a.practice_id,
  a.user_id,
  a.title,
  a.start_time,
  a.end_time,
  a.booked,
  a.created_at,
  a.updated_at,
  a.services,
  a.booked_service,
  p.practice_name,
  p.email,
  p.phone_number,
  p.photo,
  p.address,
  p.verified,
  p.verified_at,
  p.location,
  -- Always calculate distance, default to 0 if no coords
  CASE
    WHEN user_lon IS NOT NULL AND user_lat IS NOT NULL THEN
      ST_Distance(
        ST_SetSRID(p.location, 4326)::geography,
        ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
      ) / 1000
    ELSE
      0::double precision
  END AS distance
FROM
  appointments a
JOIN
  practices p ON a.practice_id = p.practice_id
WHERE
  a.booked = false
  -- Date filters
  AND (date_start IS NULL OR a.start_time >= date_start)
  AND (date_end IS NULL OR a.start_time <= date_end)
  -- Appointment type filter (array)
  AND (appointment_type IS NULL OR a.title = ANY(appointment_type))
  -- Price filter on services JSONB
  AND (price_min IS NULL OR (
    SELECT MIN((service->>'price')::numeric)
    FROM jsonb_object_keys(a.services) AS key,
    LATERAL jsonb_extract_path(a.services, key) AS service
    WHERE service->>'price' IS NOT NULL
  ) >= price_min)
  AND (price_max IS NULL OR (
    SELECT MAX((service->>'price')::numeric)
    FROM jsonb_object_keys(a.services) AS key,
    LATERAL jsonb_extract_path(a.services, key) AS service
    WHERE service->>'price' IS NOT NULL
  ) <= price_max)
  -- Distance filter only if coords provided
  AND (user_lon IS NULL OR user_lat IS NULL OR ST_DWithin(
    ST_SetSRID(p.location, 4326)::geography,
    ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
    max_distance
  ))
ORDER BY
  CASE WHEN sort_by = 'lowest_price' THEN (
    SELECT MIN((service->>'price')::numeric)
    FROM jsonb_object_keys(a.services) AS key,
    LATERAL jsonb_extract_path(a.services, key) AS service
    WHERE service->>'price' IS NOT NULL
  ) END ASC,
  CASE WHEN sort_by = 'highest_price' THEN (
    SELECT MAX((service->>'price')::numeric)
    FROM jsonb_object_keys(a.services) AS key,
    LATERAL jsonb_extract_path(a.services, key) AS service
    WHERE service->>'price' IS NOT NULL
  ) END DESC,
  CASE WHEN sort_by = 'closest' AND user_lon IS NOT NULL AND user_lat IS NOT NULL THEN
    ST_Distance(
      ST_SetSRID(p.location, 4326)::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    ) / 1000
  END ASC,
  CASE WHEN sort_by = 'soonest' THEN a.start_time END ASC
LIMIT
  limit_num;
$function$;
