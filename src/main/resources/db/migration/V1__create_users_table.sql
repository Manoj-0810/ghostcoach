CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL,
    password_hash   VARCHAR(255)  NOT NULL,
    sport           VARCHAR(20)   NOT NULL,
    position_role   VARCHAR(100)  NOT NULL,
    experience_level VARCHAR(20)  NOT NULL,
    age             INTEGER       NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_sport CHECK (sport IN ('CRICKET', 'FOOTBALL', 'BASKETBALL', 'BADMINTON')),
    CONSTRAINT chk_users_experience CHECK (experience_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    CONSTRAINT chk_users_age CHECK (age >= 5 AND age <= 120)
);

CREATE INDEX idx_users_email ON users (email);
