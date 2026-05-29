CREATE TABLE chat_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  UUID        NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role        VARCHAR(10) NOT NULL,
    content     TEXT        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_chat_role CHECK (role IN ('USER', 'ASSISTANT'))
);

CREATE INDEX idx_chat_session_id ON chat_messages (session_id);
CREATE INDEX idx_chat_created_at ON chat_messages (session_id, created_at ASC);
