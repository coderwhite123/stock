-- KYC: add verified flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN DEFAULT FALSE;

-- KYC documents: user uploads (e.g. government ID)
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  document_type TEXT NOT NULL DEFAULT 'government_id',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_kyc_documents_profile_id ON kyc_documents(profile_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status) WHERE status = 'pending';

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY kyc_documents_select_own ON kyc_documents FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY kyc_documents_insert_own ON kyc_documents FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY kyc_documents_all_admin ON kyc_documents FOR ALL
  USING (is_admin());

-- Support tickets
CREATE TYPE ticket_status AS ENUM ('open', 'answered', 'closed');

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status ticket_status DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_profile_id ON support_tickets(profile_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);

CREATE TRIGGER support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY support_tickets_select_own ON support_tickets FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY support_tickets_insert_own ON support_tickets FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY support_tickets_update_own ON support_tickets FOR UPDATE
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));
CREATE POLICY support_tickets_all_admin ON support_tickets FOR ALL
  USING (is_admin());

CREATE POLICY support_ticket_messages_select ON support_ticket_messages FOR SELECT
  USING (
    is_admin() OR
    ticket_id IN (SELECT id FROM support_tickets WHERE profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()))
  );
CREATE POLICY support_ticket_messages_insert ON support_ticket_messages FOR INSERT
  WITH CHECK (true);
CREATE POLICY support_ticket_messages_all_admin ON support_ticket_messages FOR ALL
  USING (is_admin());

-- Storage bucket for KYC (create via Supabase dashboard or API; policy allows upload for own folder)
-- Bucket name: kyc-documents, private. Path: {profile_id}/{document_id}.{ext}
-- RLS: users can upload to their profile_id folder; admins can read all.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: user can upload to own profile folder; admin can read all
-- Run these only if your Supabase project has storage schema; otherwise create bucket + policies in Dashboard
CREATE POLICY "kyc_upload_own" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = (SELECT id::text FROM profiles WHERE user_id = auth.uid() LIMIT 1)
  );
CREATE POLICY "kyc_select_own" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents' AND (
      (storage.foldername(name))[1] = (SELECT id::text FROM profiles WHERE user_id = auth.uid() LIMIT 1)
      OR (SELECT role FROM profiles WHERE user_id = auth.uid() LIMIT 1) = 'admin'
    )
  );

COMMENT ON TABLE kyc_documents IS 'KYC document uploads (e.g. government ID) for verification';
COMMENT ON TABLE support_tickets IS 'User support tickets';
COMMENT ON TABLE support_ticket_messages IS 'Messages in support ticket threads';
