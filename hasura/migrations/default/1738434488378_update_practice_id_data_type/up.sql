ALTER TABLE practices DROP COLUMN practice_id;
ALTER TABLE practices ADD COLUMN practice_id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
