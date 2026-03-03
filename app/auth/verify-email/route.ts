import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const admin = createAdminClient();
  const { data: row, error: fetchError } = await admin
    .from('email_verification_tokens')
    .select('user_id')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (fetchError || !row) {
    return NextResponse.redirect(`${origin}/login?error=invalid_or_expired`);
  }

  const { error: updateError } = await admin
    .from('profiles')
    .update({ email_verified: true })
    .eq('user_id', row.user_id);

  if (updateError) {
    return NextResponse.redirect(`${origin}/login?error=verify_failed`);
  }

  await admin.from('email_verification_tokens').delete().eq('token', token);

  return NextResponse.redirect(`${origin}/login?verified=1`);
}
