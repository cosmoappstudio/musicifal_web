import { NextRequest, NextResponse } from 'next/server';
import { SPOTIFY_AUTH_URL, SPOTIFY_SCOPES } from '@/lib/spotify/config';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

export function GET(request: NextRequest) {
  if (!CLIENT_ID || !REDIRECT_URI) {
    return NextResponse.json(
      { error: 'Spotify auth not configured' },
      { status: 500 }
    );
  }

  const state = crypto.randomUUID();
  const searchParams = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    scope: SPOTIFY_SCOPES,
    redirect_uri: REDIRECT_URI,
    state,
    show_dialog: 'false',
  });

  const response = NextResponse.redirect(
    `${SPOTIFY_AUTH_URL}?${searchParams.toString()}`
  );
  response.cookies.set('spotify_auth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
