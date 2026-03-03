export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string | null;
  role: UserRole;
  email_verified: boolean;
  btc_balance: string;
  btc_deposit_address: string | null;
  btc_address_index: number | null;
  manager_id: string | null;
  withdrawals_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'deposit' | 'withdrawal' | 'credit' | 'fee';
export type TransactionStatus = 'pending' | 'confirmed' | 'failed' | 'rejected' | 'completed';

export interface Transaction {
  id: string;
  profile_id: string;
  type: TransactionType;
  amount_btc: string;
  amount_usd: string | null;
  status: TransactionStatus;
  tx_hash: string | null;
  created_at: string;
  metadata: Json | null;
}

export type WithdrawalRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface WithdrawalRequest {
  id: string;
  profile_id: string;
  amount_btc: string;
  amount_usd: string | null;
  status: WithdrawalRequestStatus;
  bank_name: string;
  bank_account: string;
  bank_routing: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface Fee {
  id: string;
  profile_id: string;
  amount_btc: string;
  amount_usd: string | null;
  type: string;
  paid: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Json | null;
  created_at: string;
}

export interface UserActivityLog {
  id: string;
  profile_id: string;
  action: string;
  details: Json | null;
  ip_address: string | null;
  created_at: string;
}
