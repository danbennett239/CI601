-- Rename the primary key column from 'id' to 'invite_id'
ALTER TABLE practice_invites RENAME COLUMN id TO invite_id;

-- Change expires_at to timestamp WITHOUT time zone (removing timezone)
ALTER TABLE practice_invites ALTER COLUMN expires_at TYPE timestamp WITHOUT time zone USING expires_at::timestamp WITHOUT time zone;

-- Add created_at column with default value NOW()
ALTER TABLE practice_invites ADD COLUMN created_at timestamp WITHOUT time zone DEFAULT now();

-- Add used_at column, which is nullable
ALTER TABLE practice_invites ADD COLUMN used_at timestamp WITHOUT time zone NULL;
