-- Flexible banking for Canada, Australia, New Zealand, Europe (IBAN, SWIFT, BSB, etc.)
ALTER TABLE bank_accounts
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS swift_bic TEXT,
  ADD COLUMN IF NOT EXISTS iban TEXT,
  ADD COLUMN IF NOT EXISTS branch_code TEXT;

COMMENT ON COLUMN bank_accounts.country IS 'ISO 2-letter e.g. CA, AU, NZ, GB, DE';
COMMENT ON COLUMN bank_accounts.swift_bic IS 'SWIFT/BIC code (international)';
COMMENT ON COLUMN bank_accounts.iban IS 'International Bank Account Number (Europe etc.)';
COMMENT ON COLUMN bank_accounts.branch_code IS 'Branch / transit code (region-specific)';
