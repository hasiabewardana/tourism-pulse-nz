-- Create index on sessions.user_id
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.sessions(user_id);