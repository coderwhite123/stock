'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deriveAddress } from '@/services/bitcoin';
import {
  sendWalletAssignedEmail,
  sendWalletRemovedEmail,
  sendWithdrawalApprovalEmail,
  sendWithdrawalRejectionEmail,
  sendBalanceCreditedEmail,
  sendBalanceDebitedEmail,
  sendKycApprovedEmail,
  sendManagerAssignedEmail,
} from '@/services/email';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Forbidden');
  return { user, supabase };
}

export async function assignBtcAddress(profileId: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const xpub = process.env.MASTER_BTC_XPUB;
  if (!xpub) return { error: 'MASTER_BTC_XPUB not configured' };

  const { data: profile } = await admin.from('profiles').select('id, btc_address_index, btc_deposit_address, email, full_name').eq('id', profileId).single();
  if (!profile) return { error: 'Profile not found' };
  if (profile.btc_deposit_address) return { error: 'Address already assigned' };

  const maxResult = await admin.from('profiles').select('btc_address_index').not('btc_address_index', 'is', null).order('btc_address_index', { ascending: false }).limit(1).single();
  const nextIndex = (maxResult.data?.btc_address_index ?? -1) + 1;
  const address = deriveAddress(xpub, nextIndex);

  const { error: updateError } = await admin
    .from('profiles')
    .update({ btc_deposit_address: address, btc_address_index: nextIndex })
    .eq('id', profileId);

  if (updateError) return { error: updateError.message };

  await admin.from('audit_logs').insert({
    actor_id: (await ensureAdmin()).user.id,
    action: 'assign_btc_address',
    resource_type: 'profile',
    resource_id: profileId,
    details: { address, index: nextIndex },
  });

  await sendWalletAssignedEmail(profile.email, address, profile.full_name);
  revalidatePath('/admin');
  revalidatePath('/admin/users');
  return { success: true };
}

export async function removeBtcAddress(profileId: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('id, email, full_name, btc_deposit_address').eq('id', profileId).single();
  if (!profile) return { error: 'Profile not found' };
  if (!profile.btc_deposit_address) return { error: 'No address to remove' };

  const { error: updateError } = await admin
    .from('profiles')
    .update({ btc_deposit_address: null, btc_address_index: null })
    .eq('id', profileId);

  if (updateError) return { error: updateError.message };

  const { user } = await ensureAdmin();
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'remove_btc_address',
    resource_type: 'profile',
    resource_id: profileId,
  });

  await sendWalletRemovedEmail(profile.email, profile.full_name);
  revalidatePath('/admin');
  revalidatePath('/admin/users');
  return { success: true };
}

export async function assignManager(profileId: string, managerId: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ manager_id: managerId }).eq('id', profileId);
  if (error) return { error: error.message };
  const { user } = await ensureAdmin();
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'assign_manager',
    resource_type: 'profile',
    resource_id: profileId,
    details: { manager_id: managerId },
  });
  const { data: profile } = await admin.from('profiles').select('email, full_name').eq('id', profileId).single();
  const { data: manager } = await admin.from('managers').select('name, email, phone').eq('id', managerId).single();
  if (profile?.email && manager?.name && manager?.email) {
    await sendManagerAssignedEmail(profile.email, manager.name, manager.email, manager.phone ?? null, profile.full_name);
  }
  revalidatePath('/admin');
  return { success: true };
}

export async function setWithdrawalsEnabled(profileId: string, enabled: boolean) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from('profiles').update({ withdrawals_enabled: enabled }).eq('id', profileId);
  if (error) return { error: error.message };
  const { user } = await ensureAdmin();
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: enabled ? 'withdrawals_enabled' : 'withdrawals_locked',
    resource_type: 'profile',
    resource_id: profileId,
  });
  revalidatePath('/admin');
  return { success: true };
}

export async function approveWithdrawal(requestId: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data: req } = await admin.from('withdrawal_requests').select('*, profiles(email, full_name)').eq('id', requestId).single();
  if (!req || req.status !== 'pending') return { error: 'Invalid request' };
  const { user } = await ensureAdmin();
  const { error } = await admin
    .from('withdrawal_requests')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', requestId);
  if (error) return { error: error.message };
  const profileData = req.profiles as { email?: string; full_name?: string } | null;
  await sendWithdrawalApprovalEmail(profileData?.email ?? '', req.amount_btc, profileData?.full_name);
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'withdrawal_approved',
    resource_type: 'withdrawal_request',
    resource_id: requestId,
  });
  revalidatePath('/admin');
  return { success: true };
}

export async function rejectWithdrawal(requestId: string, reason?: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data: req } = await admin.from('withdrawal_requests').select('*, profiles(email, full_name)').eq('id', requestId).single();
  if (!req || req.status !== 'pending') return { error: 'Invalid request' };
  const { user } = await ensureAdmin();
  const { error } = await admin
    .from('withdrawal_requests')
    .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', requestId);
  if (error) return { error: error.message };
  const profileData = req.profiles as { email?: string; full_name?: string } | null;
  await sendWithdrawalRejectionEmail(profileData?.email ?? '', req.amount_btc, reason, profileData?.full_name);
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'withdrawal_rejected',
    resource_type: 'withdrawal_request',
    resource_id: requestId,
    details: { reason },
  });
  revalidatePath('/admin');
  return { success: true };
}

const creditBalanceSchema = z.object({
  profileId: z.string().uuid(),
  amountBtc: z.string().refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0),
  note: z.string().optional(),
});

export async function creditBalance(input: z.infer<typeof creditBalanceSchema>) {
  await ensureAdmin();
  const parsed = creditBalanceSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid input' };
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('id, btc_balance, email, full_name').eq('id', parsed.data.profileId).single();
  if (!profile) return { error: 'Profile not found' };
  const newBalance = (parseFloat(profile.btc_balance || '0') + parseFloat(parsed.data.amountBtc)).toFixed(8);
  const { error: updateError } = await admin.from('profiles').update({ btc_balance: newBalance }).eq('id', parsed.data.profileId);
  if (updateError) return { error: updateError.message };
  const { user } = await ensureAdmin();
  await admin.from('transactions').insert({
    profile_id: parsed.data.profileId,
    type: 'credit',
    amount_btc: parsed.data.amountBtc,
    status: 'completed',
    metadata: { note: parsed.data.note, credited_by: user.id },
  });
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'credit_balance',
    resource_type: 'profile',
    resource_id: parsed.data.profileId,
    details: { amount: parsed.data.amountBtc, note: parsed.data.note },
  });

  if (profile.email) await sendBalanceCreditedEmail(profile.email, parsed.data.amountBtc, parsed.data.note, profile.full_name);

  revalidatePath('/admin');
  return { success: true };
}

const debitBalanceSchema = z.object({
  profileId: z.string().uuid(),
  amountBtc: z.string().refine((v) => !Number.isNaN(parseFloat(v)) && parseFloat(v) > 0),
  note: z.string().optional(),
});

export async function debitBalance(input: z.infer<typeof debitBalanceSchema>) {
  await ensureAdmin();
  const parsed = debitBalanceSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid input' };
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('id, btc_balance, email, full_name').eq('id', parsed.data.profileId).single();
  if (!profile) return { error: 'Profile not found' };
  const current = parseFloat(profile.btc_balance || '0');
  const amount = parseFloat(parsed.data.amountBtc);
  if (amount > current) return { error: 'Insufficient balance to debit' };
  const newBalance = (current - amount).toFixed(8);
  const { error: updateError } = await admin.from('profiles').update({ btc_balance: newBalance }).eq('id', parsed.data.profileId);
  if (updateError) return { error: updateError.message };
  const { user } = await ensureAdmin();
  await admin.from('transactions').insert({
    profile_id: parsed.data.profileId,
    type: 'fee',
    amount_btc: parsed.data.amountBtc,
    status: 'completed',
    metadata: { note: parsed.data.note, debited_by: user.id, debit: true },
  });
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'debit_balance',
    resource_type: 'profile',
    resource_id: parsed.data.profileId,
    details: { amount: parsed.data.amountBtc, note: parsed.data.note },
  });
  if (profile.email) await sendBalanceDebitedEmail(profile.email, parsed.data.amountBtc, parsed.data.note, profile.full_name);
  revalidatePath('/admin');
  return { success: true };
}

const createManagerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(50).optional(),
});

export async function createManager(input: z.infer<typeof createManagerSchema>) {
  await ensureAdmin();
  const parsed = createManagerSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid input' };
  const admin = createAdminClient();
  const { error } = await admin.from('managers').insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
  });
  if (error) return { error: error.message };
  revalidatePath('/admin');
  revalidatePath('/admin/managers');
  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteManager(managerId: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  await admin.from('profiles').update({ manager_id: null }).eq('manager_id', managerId);
  const { error } = await admin.from('managers').delete().eq('id', managerId);
  if (error) return { error: error.message };
  revalidatePath('/admin');
  revalidatePath('/admin/managers');
  revalidatePath('/admin/users');
  return { success: true };
}

const addTransactionSchema = z.object({
  profileId: z.string().uuid(),
  type: z.enum(['deposit', 'withdrawal', 'credit', 'fee']),
  amountBtc: z.string(),
  amountUsd: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'failed', 'rejected', 'completed']),
  txHash: z.string().optional(),
});

export async function addTransactionRecord(input: z.infer<typeof addTransactionSchema>) {
  await ensureAdmin();
  const parsed = addTransactionSchema.safeParse(input);
  if (!parsed.success) return { error: 'Invalid input' };
  const admin = createAdminClient();
  const { error } = await admin.from('transactions').insert({
    profile_id: parsed.data.profileId,
    type: parsed.data.type,
    amount_btc: parsed.data.amountBtc,
    amount_usd: parsed.data.amountUsd || null,
    status: parsed.data.status,
    tx_hash: parsed.data.txHash || null,
  });
  if (error) return { error: error.message };
  const { user } = await ensureAdmin();
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'add_transaction',
    resource_type: 'transaction',
    details: parsed.data,
  });
  revalidatePath('/admin');
  return { success: true };
}

export async function approveKycDocument(documentId: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data: doc } = await admin
    .from('kyc_documents')
    .select('id, profile_id, status')
    .eq('id', documentId)
    .single();
  if (!doc || doc.status !== 'pending') return { error: 'Document not found or already reviewed' };

  const { user } = await ensureAdmin();
  const { error: updateDoc } = await admin
    .from('kyc_documents')
    .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: user.id })
    .eq('id', documentId);
  if (updateDoc) return { error: updateDoc.message };

  const { error: updateProfile } = await admin
    .from('profiles')
    .update({ kyc_verified: true })
    .eq('id', doc.profile_id);
  if (updateProfile) return { error: updateProfile.message };

  const { data: profile } = await admin.from('profiles').select('email, full_name').eq('id', doc.profile_id).single();
  if (profile?.email) await sendKycApprovedEmail(profile.email, profile.full_name);

  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'kyc_approved',
    resource_type: 'kyc_document',
    resource_id: documentId,
  });
  revalidatePath('/admin');
  revalidatePath('/admin/kyc');
  return { success: true };
}

export async function rejectKycDocument(documentId: string, reason?: string) {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data: doc } = await admin.from('kyc_documents').select('id, status').eq('id', documentId).single();
  if (!doc || doc.status !== 'pending') return { error: 'Document not found or already reviewed' };

  const { user } = await ensureAdmin();
  const { error } = await admin
    .from('kyc_documents')
    .update({
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      rejection_reason: reason || null,
    })
    .eq('id', documentId);
  if (error) return { error: error.message };
  await admin.from('audit_logs').insert({
    actor_id: user.id,
    action: 'kyc_rejected',
    resource_type: 'kyc_document',
    resource_id: documentId,
    details: { reason },
  });
  revalidatePath('/admin');
  revalidatePath('/admin/kyc');
  return { success: true };
}

export async function getKycDocumentViewUrl(documentId: string): Promise<{ url?: string; error?: string }> {
  await ensureAdmin();
  const admin = createAdminClient();
  const { data: doc } = await admin.from('kyc_documents').select('file_path').eq('id', documentId).single();
  if (!doc?.file_path) return { error: 'Document not found' };
  const { data: signed } = await admin.storage.from('kyc-documents').createSignedUrl(doc.file_path, 3600);
  if (!signed?.signedUrl) return { error: 'Could not generate view URL' };
  return { url: signed.signedUrl };
}
