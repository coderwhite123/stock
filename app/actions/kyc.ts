'use server';

import { getCurrentUser } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadKycDocument(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('file') as File | null;
  if (!file?.size) return { error: 'Please select a file' };
  if (!ALLOWED_TYPES.includes(file.type)) return { error: 'Allowed types: JPEG, PNG, WebP, or PDF' };
  if (file.size > MAX_SIZE) return { error: 'File must be under 10MB' };

  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return { error: 'Profile not found' };

  const ext = file.name.split('.').pop() || 'bin';
  const path = `${profile.id}/${crypto.randomUUID()}.${ext}`;

  const buf = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage.from('kyc-documents').upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });

  if (uploadError) return { error: uploadError.message || 'Upload failed' };

  const { error: insertError } = await admin.from('kyc_documents').insert({
    profile_id: profile.id,
    file_path: path,
    document_type: 'government_id',
    status: 'pending',
  });

  if (insertError) return { error: insertError.message || 'Failed to record document' };

  revalidatePath('/dashboard');
  revalidatePath('/kyc');
  return { success: true };
}
