/**
 * Spotify API client - fetches data from Spotify Web API
 */

import {
  SPOTIFY_API_BASE,
} from './config';
import type {
  SpotifyUser,
  SpotifyRecentlyPlayedResponse,
  SpotifyTopArtistsResponse,
  SpotifyTopTracksResponse,
  SpotifyAudioFeaturesResponse,
  SpotifyDevicesResponse,
  SpotifyTimeRange,
} from './types';

async function spotifyFetch<T>(
  accessToken: string,
  endpoint: string,
  params?: Record<string, string | number>
): Promise<T> {
  const url = new URL(`${SPOTIFY_API_BASE}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    );
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const err = await res.text();
    const msg = `Spotify API ${res.status} ${endpoint}: ${err}`;
    console.error('[Spotify]', msg);
    throw new Error(msg);
  }
  return res.json();
}

export async function getSpotifyProfile(
  accessToken: string
): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>(accessToken, '/me');
}

export async function getRecentlyPlayed(
  accessToken: string,
  limit = 50,
  before?: number,
  after?: number
): Promise<SpotifyRecentlyPlayedResponse> {
  const params: Record<string, string | number> = { limit };
  if (before != null) params.before = before;
  if (after != null) params.after = after; // Spotify: Unix timestamp (seconds)
  return spotifyFetch<SpotifyRecentlyPlayedResponse>(
    accessToken,
    '/me/player/recently-played',
    params
  );
}

export async function getAllRecentlyPlayed(
  accessToken: string,
  options?: { maxPages?: number; afterDays?: number }
): Promise<SpotifyRecentlyPlayedResponse['items']> {
  const maxPages = options?.maxPages ?? 25;
  const afterDays = options?.afterDays;
  const all: SpotifyRecentlyPlayedResponse['items'] = [];
  let before: number | undefined;
  let after: number | undefined;
  if (afterDays != null && afterDays > 0) {
    after = Date.now() - afterDays * 24 * 60 * 60 * 1000; // Spotify: milliseconds
  }
  for (let i = 0; i < maxPages; i++) {
    const data = await getRecentlyPlayed(accessToken, 50, before, after);
    if (data.items.length === 0) break;
    all.push(...data.items);
    if (!data.next) break;
    const oldest = data.items[data.items.length - 1];
    before = new Date(oldest.played_at).getTime(); // milliseconds
    after = undefined; // Spotify: after ve before aynı anda kullanılamaz
  }
  return all;
}

export async function getTopArtists(
  accessToken: string,
  timeRange: SpotifyTimeRange = 'short_term',
  limit = 50
): Promise<SpotifyTopArtistsResponse> {
  return spotifyFetch<SpotifyTopArtistsResponse>(
    accessToken,
    '/me/top/artists',
    { time_range: timeRange, limit }
  );
}

export async function getTopTracks(
  accessToken: string,
  timeRange: SpotifyTimeRange = 'short_term',
  limit = 50
): Promise<SpotifyTopTracksResponse> {
  return spotifyFetch<SpotifyTopTracksResponse>(
    accessToken,
    '/me/top/tracks',
    { time_range: timeRange, limit }
  );
}

export async function getAudioFeatures(
  accessToken: string,
  trackIds: string[]
): Promise<SpotifyAudioFeaturesResponse> {
  if (trackIds.length === 0) return { audio_features: [] };
  if (trackIds.length > 100) {
    const chunks: string[][] = [];
    for (let i = 0; i < trackIds.length; i += 100) {
      chunks.push(trackIds.slice(i, i + 100));
    }
    const results = await Promise.all(
      chunks.map((ids) =>
        spotifyFetch<SpotifyAudioFeaturesResponse>(
          accessToken,
          '/audio-features',
          { ids: ids.join(',') }
        )
      )
    );
    return {
      audio_features: results.flatMap((r) => r.audio_features),
    };
  }
  return spotifyFetch<SpotifyAudioFeaturesResponse>(
    accessToken,
    '/audio-features',
    { ids: trackIds.join(',') }
  );
}

export async function getDevices(
  accessToken: string
): Promise<SpotifyDevicesResponse> {
  return spotifyFetch<SpotifyDevicesResponse>(
    accessToken,
    '/me/player/devices'
  );
}
