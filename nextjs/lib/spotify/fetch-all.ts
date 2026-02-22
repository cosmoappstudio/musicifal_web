/**
 * Fetches all relevant Spotify data for music analysis (last ~14 days focus)
 */

import {
  getAllRecentlyPlayed,
  getTopArtists,
  getTopTracks,
  getAudioFeatures,
  getDevices,
  getSpotifyProfile,
} from './client';

export interface SpotifyAllData {
  profile: Awaited<ReturnType<typeof getSpotifyProfile>>;
  recentlyPlayed: Awaited<ReturnType<typeof getAllRecentlyPlayed>>;
  topArtistsShort: Awaited<ReturnType<typeof getTopArtists>>;
  topTracksShort: Awaited<ReturnType<typeof getTopTracks>>;
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
    topTracksShort,
    devices,
  ] = await Promise.all([
    getSpotifyProfile(accessToken),
    getAllRecentlyPlayed(accessToken, { maxPages: 25, afterDays: 14 }),
    getTopArtists(accessToken, 'short_term', 50),
    getTopTracks(accessToken, 'short_term', 50),
    getDevices(accessToken),
  ]);

  // Collect unique track IDs from recently played + top tracks
  const trackIds = new Set<string>();
  recentlyPlayed.forEach((i) => trackIds.add(i.track.id));
  topTracksShort.items.forEach((t) => trackIds.add(t.id));

  // audio-features can 403 on some Spotify accounts — non-fatal
  let audioFeatures: Awaited<ReturnType<typeof getAudioFeatures>>;
  try {
    audioFeatures = await getAudioFeatures(accessToken, [...trackIds]);
  } catch (e) {
    console.warn('[Spotify] audio-features failed:', e instanceof Error ? e.message : e);
    audioFeatures = { audio_features: [] };
  }

  return {
    profile,
    recentlyPlayed,
    topArtistsShort,
    topTracksShort,
    audioFeatures,
    devices,
  };
}
