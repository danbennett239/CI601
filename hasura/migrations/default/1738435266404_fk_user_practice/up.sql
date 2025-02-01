ALTER TABLE users
ADD COLUMN practice_id UUID REFERENCES practices(practice_id) ON DELETE SET NULL;
