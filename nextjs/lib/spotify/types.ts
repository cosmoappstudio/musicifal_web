/**
 * Spotify Web API response types
 * @see https://developer.spotify.com/documentation/web-api/reference
 */

// ─── User ─────────────────────────────────────────────────────────────────────

export interface SpotifyUser {
  id: string;
  display_name: string | null;
  email?: string | null;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  followers?: { total: number };
  country?: string;
  product?: string;
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

// ─── Recently Played ──────────────────────────────────────────────────────────

export interface SpotifyRecentlyPlayedResponse {
  href: string;
  limit: number;
  next: string | null;
  cursors: { after?: string; before?: string };
  total?: number;
  items: SpotifyPlayHistoryItem[];
}

export interface SpotifyPlayHistoryItem {
  track: SpotifyTrack;
  played_at: string; // ISO 8601
  context: SpotifyContext | null;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  artists: SpotifySimplifiedArtist[];
  album: SpotifySimplifiedAlbum;
  external_urls: { spotify: string };
  popularity?: number;
}

export interface SpotifySimplifiedArtist {
  id: string;
  name: string;
  type: 'artist';
}

export interface SpotifySimplifiedAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
  artists: SpotifySimplifiedArtist[];
}

export interface SpotifyContext {
  type: 'playlist' | 'artist' | 'album' | 'show';
  href: string;
  external_urls: { spotify: string };
  uri: string;
}

// ─── Top Items ────────────────────────────────────────────────────────────────

export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface SpotifyTopArtistsResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyArtist[];
}

export interface SpotifyTopTracksResponse {
  href: string;
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
  items: SpotifyTrackFull[];
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: SpotifyImage[];
  popularity?: number;
  external_urls: { spotify: string };
}

export interface SpotifyTrackFull extends SpotifyTrack {
  album: SpotifyAlbumFull;
}

export interface SpotifyAlbumFull extends SpotifySimplifiedAlbum {
  total_tracks: number;
  album_type: string;
}

// ─── Audio Features ───────────────────────────────────────────────────────────

export interface SpotifyAudioFeatures {
  id: string;
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  key: number;
  liveness: number;
  loudness: number;
  mode: number;
  speechiness: number;
  tempo: number;
  time_signature: number;
  valence: number;
  duration_ms: number;
}

export interface SpotifyAudioFeaturesResponse {
  audio_features: (SpotifyAudioFeatures | null)[];
}

// ─── Devices (optional) ───────────────────────────────────────────────────────

export interface SpotifyDevicesResponse {
  devices: SpotifyDevice[];
}

export interface SpotifyDevice {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: 'Computer' | 'Smartphone' | 'Speaker' | 'TV' | 'AVR' | 'STB' | 'AudioDongle' | 'GameConsole' | 'CastVideo' | 'CastAudio' | 'Automobile' | 'Unknown';
  volume_percent: number | null;
}
