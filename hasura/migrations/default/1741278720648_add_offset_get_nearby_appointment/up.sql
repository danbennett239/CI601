DROP FUNCTION IF EXISTS public.get_nearby_appointments;

CREATE OR REPLACE FUNCTION public.get_nearby_appointments(
  user_lon double precision DEFAULT NULL::double precision,
  user_lat double precision DEFAULT NULL::double precision,
  max_distance double precision DEFAULT 10,
  limit_num integer DEFAULT 20,
  offset_num integer DEFAULT 0,
  appointment_type text DEFAULT NULL::text,
  price_min numeric DEFAULT NULL::numeric,
  price_max numeric DEFAULT NULL::numeric,
  date_start timestamp without time zone DEFAULT NULL::timestamp without time zone,
  date_end timestamp without time zone DEFAULT NULL::timestamp without time zone,
  sort_by text DEFAULT 'soonest'::text
) RETURNS SETOF appointments_with_distance 
LANGUAGE sql 
STABLE 
AS $function$
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
  CASE
    WHEN user_lon IS NOT NULL AND user_lat IS NOT NULL THEN 
      ST_Distance(
        ST_SetSRID(p.location, 4326)::geography,
        ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
      ) / 1000 -- Distance in km
    ELSE 0::double precision
  END AS distance
FROM
  appointments a
  JOIN practices p ON a.practice_id = p.practice_id
WHERE
  a.booked = false
  AND (date_start IS NULL OR a.start_time >= date_start)
  AND (date_end IS NULL OR a.start_time <= date_end)
  AND (appointment_type IS NULL OR a.services ? appointment_type)
  AND (price_min IS NULL OR ((a.services->>appointment_type)::numeric >= price_min))
  AND (price_max IS NULL OR ((a.services->>appointment_type)::numeric <= price_max))
  AND (user_lon IS NULL OR user_lat IS NULL OR ST_DWithin(
    ST_SetSRID(p.location, 4326)::geography,
    ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
    max_distance * 1000 -- Convert km to meters
  ))
ORDER BY
  CASE WHEN sort_by = 'lowest_price' AND appointment_type IS NOT NULL THEN
    (a.services->>appointment_type)::numeric
  END ASC,
  CASE WHEN sort_by = 'highest_price' AND appointment_type IS NOT NULL THEN
    (a.services->>appointment_type)::numeric
  END DESC,
  CASE WHEN sort_by = 'closest' AND user_lon IS NOT NULL AND user_lat IS NOT NULL THEN
    ST_Distance(
      ST_SetSRID(p.location, 4326)::geography,
      ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    ) / 1000
  END ASC,
  CASE WHEN sort_by = 'soonest' THEN a.start_time END ASC
LIMIT
  limit_num
OFFSET
  offset_num;
$function$;
