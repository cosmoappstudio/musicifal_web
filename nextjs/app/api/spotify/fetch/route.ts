/**
 * Fetches all Spotify data for the current user and stores in Supabase
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServiceClient } from '@/lib/supabase/client';
import { refreshAccessToken } from '@/lib/spotify/auth';
import { fetchAllSpotifyData } from '@/lib/spotify/fetch-all';

export async function POST() {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: tokenRow, error: tokenErr } = await supabase
    .from('spotify_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single();

  if (tokenErr || !tokenRow) {
    return NextResponse.json({ error: 'No Spotify connection' }, { status: 400 });
  }

  let accessToken = tokenRow.access_token;
  const expiresAt = new Date(tokenRow.expires_at).getTime();

  // Refresh if expires in < 5 min
  if (expiresAt - Date.now() < 5 * 60 * 1000) {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret || !tokenRow.refresh_token) {
      return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
    }
    const tokens = await refreshAccessToken(
      tokenRow.refresh_token,
      clientId,
      clientSecret
    );
    accessToken = tokens.access_token;
    const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await supabase
      .from('spotify_tokens')
      .update({
        access_token: tokens.access_token,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  try {
    const data = await fetchAllSpotifyData(accessToken);
    const fetchedAt = new Date().toISOString();

    const { error: insertErr } = await supabase.from('spotify_raw_data').insert({
      user_id: userId,
      profile: data.profile as unknown as Record<string, unknown>,
      recently_played: data.recentlyPlayed as unknown as Record<string, unknown>[],
      top_artists_short: data.topArtistsShort as unknown as Record<string, unknown>,
      top_artists_medium: data.topArtistsMedium as unknown as Record<string, unknown>,
      top_artists_long: data.topArtistsLong as unknown as Record<string, unknown>,
      top_tracks_short: data.topTracksShort as unknown as Record<string, unknown>,
      top_tracks_medium: data.topTracksMedium as unknown as Record<string, unknown>,
      top_tracks_long: data.topTracksLong as unknown as Record<string, unknown>,
      audio_features: data.audioFeatures as unknown as Record<string, unknown>,
      devices: data.devices as unknown as Record<string, unknown>,
      fetched_at: fetchedAt,
    });

    if (insertErr) {
      console.error('spotify_raw_data insert error:', insertErr);
      return NextResponse.json(
        { error: 'Failed to store data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      fetchedAt,
      counts: {
        recentlyPlayed: data.recentlyPlayed.length,
        topArtists: data.topArtistsShort.items.length,
        topTracks: data.topTracksShort.items.length,
        audioFeatures: data.audioFeatures.audio_features.filter(Boolean).length,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Fetch failed';
    console.error('Spotify fetch error:', msg, err);
    // 403 = user not in Spotify allowlist or scope issue
    const is403 = msg.includes('403');
    return NextResponse.json(
      {
        error: is403
          ? 'spotify_403'
          : msg,
        detail: is403
          ? 'Spotify hesabın izin listesinde olmayabilir. Spotify Dashboard → User Management\'dan ekleyip spotify.com/account/apps üzerinden yeniden bağlan.'
          : undefined,
      },
      { status: is403 ? 403 : 500 }
    );
  }
}
