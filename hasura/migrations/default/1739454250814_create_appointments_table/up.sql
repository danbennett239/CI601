CREATE TABLE appointments (
  appointment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id uuid NOT NULL,
  user_id uuid,
  title text NOT NULL,
  start_time timestamp without time zone NOT NULL,
  end_time timestamp without time zone NOT NULL,
  booked boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT fk_practice
    FOREIGN KEY (practice_id)
      REFERENCES practices (practice_id)
      ON DELETE CASCADE,
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
      REFERENCES users (user_id)
      ON DELETE SET NULL
);
