CREATE OR REPLACE FUNCTION public.get_nearby_appointments(
  user_lon double precision,
  user_lat double precision,
  max_distance double precision,
  start_time timestamp,
  limit_num integer
) RETURNS TABLE (
  appointment_id uuid,
  practice_id uuid,
  user_id uuid,
  title text,
  start_time timestamp,
  end_time timestamp,
  booked boolean,
  created_at timestamp,
  updated_at timestamp,
  services jsonb,
  booked_service jsonb,
  practice_name varchar,
  email varchar,
  phone_number varchar,
  photo text,
  address jsonb,
  verified boolean,
  verified_at timestamp,
  location geometry,
  distance double precision
) LANGUAGE sql STABLE AS $$
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
  ST_Distance(
    ST_SetSRID(p.location, 4326)::geography,
    ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
  ) / 1000 AS distance -- Distance in kilometers
FROM
  appointments a
JOIN
  practices p ON a.practice_id = p.practice_id
WHERE
  a.booked = false
  AND a.start_time >= start_time
  AND ST_DWithin(
    ST_SetSRID(p.location, 4326)::geography,
    ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography,
    max_distance
  )
ORDER BY
  a.start_time ASC
LIMIT
  limit_num;
$$;
