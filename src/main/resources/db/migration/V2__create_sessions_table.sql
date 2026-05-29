CREATE TABLE sessions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_path        VARCHAR(500)  NOT NULL,
    image_filename    VARCHAR(255)  NOT NULL,
    overall_score     INTEGER       NOT NULL,
    strengths         JSONB         NOT NULL DEFAULT '[]'::jsonb,
    areas_to_improve  JSONB         NOT NULL DEFAULT '[]'::jsonb,
    priority_fix      TEXT          NOT NULL,
    drill_suggestion  TEXT          NOT NULL,
    confidence_level  VARCHAR(10)   NOT NULL,
    body_annotations  JSONB         DEFAULT '[]'::jsonb,
    uploaded_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_sessions_score CHECK (overall_score >= 1 AND overall_score <= 10),
    CONSTRAINT chk_sessions_confidence CHECK (confidence_level IN ('LOW', 'MEDIUM', 'HIGH'))
);

CREATE INDEX idx_sessions_user_id ON sessions (user_id);
CREATE INDEX idx_sessions_uploaded_at ON sessions (uploaded_at DESC);
