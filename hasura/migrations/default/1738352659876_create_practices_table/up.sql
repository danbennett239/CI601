CREATE TABLE IF NOT EXISTS practices (
    practice_id SERIAL PRIMARY KEY,
    practice_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    photo TEXT,
    address JSONB NOT NULL,
    opening_hours JSONB NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
