CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE practices
  ADD COLUMN location geometry(Point, 4326);
