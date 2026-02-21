import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/spotify/auth';
import { getSpotifyProfile } from '@/lib/spotify/client';
import { createServiceClient } from '@/lib/supabase/client';

const SESSION_COOKIE = 'musicifal_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const DEFAULT_LOCALE = 'tr';

function getBaseUrl(request: NextRequest): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function GET(request: NextRequest) {
  const BASE_URL = getBaseUrl(request);
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${BASE_URL}?error=${encodeURIComponent(error)}`
    );
  }

  const storedState = request.cookies.get('spotify_auth_state')?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${BASE_URL}?error=state_mismatch`);
  }

  if (!code || !CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    return NextResponse.redirect(`${BASE_URL}?error=invalid_config`);
  }

  try {
    const tokens = await exchangeCodeForTokens(
      code,
      REDIRECT_URI,
      CLIENT_ID,
      CLIENT_SECRET
    );

    const profile = await getSpotifyProfile(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const supabase = createServiceClient();

    // Upsert user
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          spotify_user_id: profile.id,
          email: profile.email ?? null,
          name: profile.display_name ?? null,
          avatar_url: profile.images?.[0]?.url ?? null,
          plan: 'free',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'spotify_user_id' }
      )
      .select('id')
      .single();

    if (userError || !user) {
      console.error('User upsert error:', userError);
      return NextResponse.redirect(`${BASE_URL}?error=user_create_failed`);
    }

    // Upsert tokens
    const { error: tokenError } = await supabase.from('spotify_tokens').upsert(
      {
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? null,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

    if (tokenError) {
      console.error('Token upsert error:', tokenError);
      return NextResponse.redirect(`${BASE_URL}?error=token_save_failed`);
    }

    const response = NextResponse.redirect(`${BASE_URL}/${DEFAULT_LOCALE}/dashboard`);
    response.cookies.set(SESSION_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    response.cookies.delete('spotify_auth_state');
    return response;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('Spotify callback error:', errMsg, err);
    // Redirect with error - user will see ?error=... on homepage
    return NextResponse.redirect(
      `${BASE_URL}?error=${encodeURIComponent(errMsg)}`
    );
  }
}
