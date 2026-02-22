/**
 * Fetches ALL available data from Spotify API for a user
 * Used when user first connects or refreshes analysis
 */

import {
  getSpotifyProfile,
  getRecentlyPlayed,
  getAllRecentlyPlayed,
  getTopArtists,
  getTopTracks,
  getAudioFeatures,
  getDevices,
} from './client';
import type { SpotifyTimeRange } from './types';

export interface SpotifyAllData {
  profile: Awaited<ReturnType<typeof getSpotifyProfile>>;
  recentlyPlayed: Awaited<ReturnType<typeof getAllRecentlyPlayed>>;
  topArtistsShort: Awaited<ReturnType<typeof getTopArtists>>;
  topArtistsMedium: Awaited<ReturnType<typeof getTopArtists>>;
  topArtistsLong: Awaited<ReturnType<typeof getTopArtists>>;
  topTracksShort: Awaited<ReturnType<typeof getTopTracks>>;
  topTracksMedium: Awaited<ReturnType<typeof getTopTracks>>;
  topTracksLong: Awaited<ReturnType<typeof getTopTracks>>;
  audioFeatures: Awaited<ReturnType<typeof getAudioFeatures>>;
  devices: Awaited<ReturnType<typeof getDevices>>;
}

export async function fetchAllSpotifyData(
  accessToken: string
): Promise<SpotifyAllData> {
  const [
    profile,
    recentlyPlayed,
    topArtistsShort,
    topArtistsMedium,
    topArtistsLong,
    topTracksShort,
    topTracksMedium,
    topTracksLong,
    devices,
  ] = await Promise.all([
    getSpotifyProfile(accessToken),
    getAllRecentlyPlayed(accessToken),
    getTopArtists(accessToken, 'short_term', 50),
    getTopArtists(accessToken, 'medium_term', 50),
    getTopArtists(accessToken, 'long_term', 50),
    getTopTracks(accessToken, 'short_term', 50),
    getTopTracks(accessToken, 'medium_term', 50),
    getTopTracks(accessToken, 'long_term', 50),
    getDevices(accessToken),
  ]);

  // Collect unique track IDs from recently played and top tracks
  const trackIds = new Set<string>();
  recentlyPlayed.forEach((i) => trackIds.add(i.track.id));
  [topTracksShort, topTracksMedium, topTracksLong].forEach((res) =>
    res.items.forEach((t) => trackIds.add(t.id))
  );

  // audio-features can 403 in some Spotify setups (e.g. certain regions/accounts)
  // make it non-fatal so user still gets profile, top artists, top tracks, etc.
  let audioFeatures: Awaited<ReturnType<typeof getAudioFeatures>>;
  try {
    audioFeatures = await getAudioFeatures(accessToken, [...trackIds]);
  } catch (e) {
    console.warn('[Spotify] audio-features failed, continuing without:', e instanceof Error ? e.message : e);
    audioFeatures = { audio_features: [] };
  }

  return {
    profile,
    recentlyPlayed,
    topArtistsShort,
    topArtistsMedium,
    topArtistsLong,
    topTracksShort,
    topTracksMedium,
    topTracksLong,
    audioFeatures,
    devices,
  };
}
