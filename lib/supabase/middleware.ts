import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );

  // Use getSession() (reads JWT from cookie) to avoid Auth API call and 429 rate limits.
  // Server components use getCurrentUser() (cached once per request) for verified user.
  let user: { id: string } | null = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    user = session?.user ?? null;
  } catch {
    user = null;
  }

  const path = request.nextUrl.pathname;
  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup') || path === '/auth/callback';
  const isAdminPage = path.startsWith('/admin');
  const isProtected = path.startsWith('/dashboard') || path.startsWith('/transactions') || path.startsWith('/withdraw') || isAdminPage;

  // Logged-in user on login/signup: send to verify-email if not verified, else dashboard
  if (user && isAuthPage && !path.startsWith('/auth/callback')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_verified')
      .eq('user_id', user.id)
      .single();
    const url = request.nextUrl.clone();
    url.pathname = profile?.email_verified ? '/dashboard' : '/verify-email';
    return NextResponse.redirect(url);
  }

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  if (user && isProtected && !isAdminPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_verified')
      .eq('user_id', user.id)
      .single();

    if (profile && !profile.email_verified) {
      const url = request.nextUrl.clone();
      url.pathname = '/verify-email';
      return NextResponse.redirect(url);
    }
  }

  if (user && isAdminPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
