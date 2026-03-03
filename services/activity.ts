'use server';

import { createClient } from '@/lib/supabase/server';

export async function logUserActivity(action: string, details?: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return;
  await supabase.from('user_activity_logs').insert({
    profile_id: profile.id,
    action,
    details: details ?? null,
  });
}
