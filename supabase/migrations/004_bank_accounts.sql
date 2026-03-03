-- Bank accounts saved by users (for withdrawals and notifications on change)
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name TEXT NOT NULL,
  bank_account TEXT NOT NULL,
  bank_routing TEXT,
  account_holder_name TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bank_accounts_profile_id ON bank_accounts(profile_id);

CREATE TRIGGER bank_accounts_updated_at BEFORE UPDATE ON bank_accounts
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY bank_accounts_select_own ON bank_accounts FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY bank_accounts_insert_own ON bank_accounts FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY bank_accounts_update_own ON bank_accounts FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY bank_accounts_delete_own ON bank_accounts FOR DELETE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

COMMENT ON TABLE bank_accounts IS 'User-saved bank accounts for withdrawals; add/edit/delete triggers email notifications';
