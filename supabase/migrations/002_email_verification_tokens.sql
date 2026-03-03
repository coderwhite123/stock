-- Email verification tokens (for Resend-based verification, avoids Supabase email rate limits)
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- User can insert a token for their own user_id only (right after signup)
CREATE POLICY email_verification_tokens_insert_own ON email_verification_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Read/delete only via service role (verify route); no anon SELECT/DELETE
COMMENT ON TABLE email_verification_tokens IS 'One-time tokens for email verification via Resend (no Supabase auth email)';
