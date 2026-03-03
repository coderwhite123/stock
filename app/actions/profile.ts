'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(200),
  phone: z.string().min(1).max(50),
  address: z.string().max(500).optional(),
});

export async function updateProfile(input: z.infer<typeof profileUpdateSchema>) {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: { _form: ['Not authenticated'] } };

  const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
  if (!profile) return { error: { _form: ['Profile not found'] } };

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      address: parsed.data.address ?? null,
    })
    .eq('id', profile.id);

  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  return { success: true };
}
