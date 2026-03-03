-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'credit', 'fee');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed', 'rejected', 'completed');
CREATE TYPE withdrawal_status AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- Managers table (refund managers)
CREATE TABLE managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  role user_role DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  btc_balance NUMERIC(20, 8) DEFAULT 0,
  btc_deposit_address TEXT,
  btc_address_index INTEGER,
  manager_id UUID REFERENCES managers(id),
  withdrawals_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount_btc NUMERIC(20, 8) NOT NULL,
  amount_usd NUMERIC(20, 2),
  status transaction_status DEFAULT 'pending',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Withdrawal requests
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_btc NUMERIC(20, 8) NOT NULL,
  amount_usd NUMERIC(20, 2),
  status withdrawal_status DEFAULT 'pending',
  bank_name TEXT NOT NULL,
  bank_account TEXT NOT NULL,
  bank_routing TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Fees (e.g. processing fees user must pay before withdrawal)
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_btc NUMERIC(20, 8) NOT NULL,
  amount_usd NUMERIC(20, 2),
  type TEXT NOT NULL DEFAULT 'processing',
  paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User activity log
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_manager_id ON profiles(manager_id);
CREATE INDEX idx_transactions_profile_id ON transactions(profile_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_withdrawal_requests_profile_id ON withdrawal_requests(profile_id);
CREATE INDEX idx_fees_profile_id ON fees(profile_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_user_activity_logs_profile_id ON user_activity_logs(profile_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER managers_updated_at BEFORE UPDATE ON managers
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER withdrawal_requests_updated_at BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER fees_updated_at BEFORE UPDATE ON fees
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: users see own, admins see all
CREATE POLICY profiles_select_own ON profiles FOR SELECT
  USING (user_id = auth.uid() OR is_admin());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
CREATE POLICY profiles_insert_admin ON profiles FOR INSERT
  WITH CHECK (true);
CREATE POLICY profiles_all_admin ON profiles FOR ALL
  USING (is_admin());

-- Managers: users see assigned manager, admins see all
CREATE POLICY managers_select ON managers FOR SELECT
  USING (
    is_admin() OR
    id IN (SELECT manager_id FROM profiles WHERE user_id = auth.uid() AND manager_id IS NOT NULL)
  );
CREATE POLICY managers_all_admin ON managers FOR ALL
  USING (is_admin());

-- Transactions: users see own, admins see all
CREATE POLICY transactions_select ON transactions FOR SELECT
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
  );
CREATE POLICY transactions_insert_admin ON transactions FOR INSERT
  WITH CHECK (is_admin());
CREATE POLICY transactions_update_admin ON transactions FOR UPDATE
  USING (is_admin());

-- Withdrawal requests: users see own + insert/update own pending, admins all
CREATE POLICY withdrawal_requests_select ON withdrawal_requests FOR SELECT
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
  );
CREATE POLICY withdrawal_requests_insert ON withdrawal_requests FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY withdrawal_requests_update ON withdrawal_requests FOR UPDATE
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
  );

-- Fees: users see own, admins all
CREATE POLICY fees_select ON fees FOR SELECT
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
  );
CREATE POLICY fees_all_admin ON fees FOR ALL
  USING (is_admin());

-- Audit logs: admin only
CREATE POLICY audit_logs_admin ON audit_logs FOR ALL
  USING (is_admin());

-- User activity: users see own, admins see all
CREATE POLICY user_activity_select ON user_activity_logs FOR SELECT
  USING (
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR is_admin()
  );
CREATE POLICY user_activity_insert ON user_activity_logs FOR INSERT
  WITH CHECK (true);

-- Create profile on signup (trigger via Edge Function or handle in app)
-- For simplicity we create profile in app after signup; optional: use auth.users trigger

COMMENT ON TABLE profiles IS 'User profiles linked to auth.users';
COMMENT ON TABLE managers IS 'Refund managers assigned to users';
COMMENT ON TABLE transactions IS 'BTC transactions (deposits, withdrawals, credits)';
COMMENT ON TABLE withdrawal_requests IS 'User withdrawal requests with bank details';
COMMENT ON TABLE fees IS 'Fees (e.g. processing) that user must pay before withdrawal';
