CREATE OR REPLACE VIEW "public"."appointments_with_distance" AS
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
  0::double precision AS distance -- Default distance
FROM
  appointments a
JOIN
  practices p ON a.practice_id = p.practice_id;
