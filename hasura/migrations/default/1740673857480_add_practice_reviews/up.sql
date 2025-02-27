CREATE TABLE practice_reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practice_id UUID NOT NULL,
    appointment_id UUID NOT NULL UNIQUE,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    CONSTRAINT fk_practice FOREIGN KEY (practice_id) REFERENCES practices(practice_id),
    CONSTRAINT fk_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
);
