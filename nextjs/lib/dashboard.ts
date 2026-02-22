/**
 * Dashboard data fetching — transforms raw Spotify data into analysis for the UI.
 *
 * Data pipeline:
 *   Spotify API → spotify_raw_data (JSONB) → transformRawToAnalysis → MockAnalysis → UI
 */

import { createServiceClient } from '@/lib/supabase/client';
import type { CurrentUser } from '@/lib/auth';
import type { MockAnalysis, MockFortune, SpotifyDevice, AudioProfile } from '@/types';
import { FORTUNE_MIN_REPEATS } from '@/lib/fortune/build-summary';

const COLORS = ['#7C3AED', '#A855F7', '#C084FC', '#E879F9', '#D97706', '#6B7280'];
const MOOD_KEYS = ['introspective', 'calm', 'aggressive', 'emotional', 'peaceful', 'mixed'] as const;

// ─── Local types for raw DB row ────────────────────────────────────────────────

interface ArtistItem { name: string; images?: { url: string }[]; genres?: string[] }

interface GenreAnalysis {
  genres?: Array<{ name: string; percentage: number }>;
  songGenres?: Array<{ song: string; artist: string; genre: string }>;
}

interface RawAudioFeature {
  id?: string;
  valence?: number;
  energy?: number;
  danceability?: number;
  tempo?: number;
  acousticness?: number;
  mode?: number;
}

interface SpotifyRawData {
  recently_played?: Array<{
    played_at?: string;
    track?: { id?: string; name?: string; artists?: { name: string }[]; album?: { images?: { url: string }[] } };
  }> | null;
  top_artists_short?: { items?: ArtistItem[] } | null;
  top_tracks_short?: { items?: Array<{ id?: string; name?: string; artists?: { name: string }[]; album?: { images?: { url: string }[] } }> } | null;
  audio_features?: { audio_features?: Array<RawAudioFeature | null> } | null;
  genre_analysis?: GenreAnalysis | null;
  devices?: { devices?: Array<{ id?: string; name?: string; type?: string; is_active?: boolean; volume_percent?: number | null; supports_volume?: boolean }> } | null;
  fetched_at?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derives a mood key from avg energy + valence of tracks belonging to a genre.
 * Falls back to position-based index if no audio data.
 */
function genreMoodKey(
  genreName: string,
  topTracksItems: Array<{ id?: string; name?: string; artists?: { name: string }[] }>,
  songGenres: Array<{ song: string; artist: string; genre: string }>,
  featuresMap: Map<string, RawAudioFeature>,
  fallbackIndex: number
): string {
  const energies: number[] = [];
  const valences: number[] = [];
  topTracksItems.slice(0, 50).forEach((t) => {
    if (!t.id) return;
    const g = getGenreForTrack(t.name ?? '', t.artists?.[0]?.name ?? '', songGenres);
    if (g.toLowerCase().trim() !== genreName.toLowerCase().trim()) return;
    const af = featuresMap.get(t.id);
    if (!af) return;
    if (typeof af.energy === 'number') energies.push(af.energy);
    if (typeof af.valence === 'number') valences.push(af.valence);
  });
  if (energies.length === 0) return MOOD_KEYS[fallbackIndex % MOOD_KEYS.length];
  const avgE = energies.reduce((s, v) => s + v, 0) / energies.length;
  const avgV = valences.length > 0 ? valences.reduce((s, v) => s + v, 0) / valences.length : 0.5;
  if (avgE >= 0.7 && avgV < 0.4) return 'aggressive';
  if (avgE >= 0.65 && avgV >= 0.5) return 'emotional';
  if (avgE < 0.4 && avgV < 0.35) return 'introspective';
  if (avgE < 0.45 && avgV >= 0.5) return 'peaceful';
  if (avgE < 0.6) return 'calm';
  return 'mixed';
}

function getGenreForTrack(
  trackName: string,
  artistName: string,
  songGenres: Array<{ song: string; artist: string; genre: string }>
): string {
  const t = trackName.toLowerCase().trim();
  const a = artistName.toLowerCase().trim();
  return songGenres.find(
    (sg) => sg.song?.toLowerCase().trim() === t && sg.artist?.toLowerCase().trim() === a
  )?.genre ?? '';
}

/** Build a map from track ID → audio features for O(1) lookup */
function buildAudioFeaturesMap(raw: SpotifyRawData | null): Map<string, RawAudioFeature> {
  const map = new Map<string, RawAudioFeature>();
  (raw?.audio_features?.audio_features ?? []).forEach((f) => {
    if (f?.id) map.set(f.id, f);
  });
  return map;
}

/** Compute aggregate audio profile across a set of track IDs */
function computeAudioProfile(
  trackIds: string[],
  featuresMap: Map<string, RawAudioFeature>
): AudioProfile | null {
  const features = trackIds.map((id) => featuresMap.get(id)).filter(Boolean) as RawAudioFeature[];
  if (features.length === 0) return null;

  const avg = (key: keyof RawAudioFeature) => {
    const vals = features.map((f) => f[key] as number).filter((v) => typeof v === 'number');
    return vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100 : 0;
  };

  return {
    avgValence: avg('valence'),
    avgEnergy: avg('energy'),
    avgDanceability: avg('danceability'),
    avgTempo: Math.round(avg('tempo')),
    avgAcousticness: avg('acousticness'),
    trackCount: features.length,
  };
}

// ─── Main transform ────────────────────────────────────────────────────────────

function transformRawToAnalysis(raw: SpotifyRawData | null): MockAnalysis | null {
  const played = raw?.recently_played ?? [];
  const topArtistsList = (raw?.top_artists_short?.items ?? []).slice(0, 10);
  const topTracksItems = raw?.top_tracks_short?.items ?? [];
  const songGenres = raw?.genre_analysis?.songGenres ?? [];

  // Require at least some data
  const hasData = topArtistsList.length > 0 || played.length > 0 || topTracksItems.length > 0;
  if (!hasData) return null;

  const allArtistNames = new Set(
    (raw?.top_artists_short?.items ?? []).map((a) => a.name?.toLowerCase().trim()).filter(Boolean)
  );

  const isValidGenre = (name: string) => {
    const n = name?.trim().toLowerCase();
    return !!n && !allArtistNames.has(n);
  };

  // ── Audio features ────────────────────────────────────────────────────────
  const featuresMap = buildAudioFeaturesMap(raw);

  // Audio profile from top tracks (most representative of taste)
  const topTrackIds = topTracksItems.map((t) => t.id).filter(Boolean) as string[];
  const audioProfile = computeAudioProfile(topTrackIds, featuresMap);

  // ── Genres ────────────────────────────────────────────────────────────────
  let genres: Array<{ name: string; percentage: number; mood: string; moodKey: string; color: string }> = [];

  if (songGenres.length) {
    // Primary: rank-weighted from top_tracks_short (rank #1 = weight 50)
    const genreWeights: Record<string, number> = {};
    topTracksItems.slice(0, 50).forEach((t, i) => {
      const g = getGenreForTrack(t.name ?? '', t.artists?.[0]?.name ?? '', songGenres).trim();
      if (g && isValidGenre(g)) {
        genreWeights[g] = (genreWeights[g] ?? 0) + Math.max(1, 50 - i);
      }
    });
    // Supplement with recently_played (lower weight = 1 per play)
    played.forEach((p) => {
      const g = getGenreForTrack(p.track?.name ?? '', p.track?.artists?.[0]?.name ?? '', songGenres).trim();
      if (g && isValidGenre(g)) {
        genreWeights[g] = (genreWeights[g] ?? 0) + 1;
      }
    });
    const entries = Object.entries(genreWeights).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (entries.length > 0) {
      const total = entries.reduce((s, [, w]) => s + w, 0) || 1;
      genres = entries.map(([name, weight], i) => ({
        name,
        percentage: Math.round((weight / total) * 100),
        mood: '',
        moodKey: genreMoodKey(name, topTracksItems, songGenres, featuresMap, i),
        color: COLORS[i % COLORS.length],
      }));
    }
  }

  // Fallback 1: genre_analysis.genres (already computed percentages)
  if (genres.length === 0 && (raw?.genre_analysis?.genres?.length ?? 0) > 0) {
    const filtered = (raw?.genre_analysis?.genres ?? []).filter((g) => isValidGenre(g.name));
    genres = filtered.slice(0, 6).map((g, i) => ({
      name: g.name,
      percentage: g.percentage,
      mood: '',
      moodKey: genreMoodKey(g.name, topTracksItems, songGenres, featuresMap, i),
      color: COLORS[i % COLORS.length],
    }));
  }

  // Fallback 2: Spotify artist.genres
  if (genres.length === 0) {
    const artistGenreCounts: Record<string, number> = {};
    (raw?.top_artists_short?.items ?? []).forEach((a) => {
      (a.genres ?? []).filter(isValidGenre).forEach((g) => {
        artistGenreCounts[g] = (artistGenreCounts[g] ?? 0) + 1;
      });
    });
    const sorted = Object.entries(artistGenreCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (sorted.length > 0) {
      const total = sorted.reduce((s, [, c]) => s + c, 0) || 1;
      genres = sorted.map(([name], i) => ({
        name,
        percentage: Math.round((artistGenreCounts[name]! / total) * 100),
        mood: '',
        moodKey: genreMoodKey(name, topTracksItems, songGenres, featuresMap, i),
        color: COLORS[i % COLORS.length],
      }));
    }
  }

  // Final fallback: "Çeşitli"
  if (genres.length === 0) {
    genres = [{ name: 'Çeşitli', percentage: 100, mood: '', moodKey: 'mixed', color: COLORS[5] }];
  }

  // ── Top Artists ───────────────────────────────────────────────────────────
  const artistPlayCounts: Record<string, number> = {};
  played.forEach((p) => {
    const name = p.track?.artists?.[0]?.name?.trim();
    if (name) artistPlayCounts[name] = (artistPlayCounts[name] ?? 0) + 1;
  });

  const topArtists = topArtistsList.map((a, i) => ({
    rank: i + 1,
    name: a.name,
    playCount: artistPlayCounts[a.name] ?? 0,
    imageUrl: a.images?.[0]?.url ?? '',
    genre: a.genres?.[0] ?? songGenres.find((sg) => sg.artist?.toLowerCase() === a.name?.toLowerCase())?.genre ?? '',
  }));

  // ── Top Repeated (from recently_played — has timestamps) ──────────────────
  const trackCounts: Record<string, { count: number; id: string; name: string; artist: string; albumArt: string }> = {};
  played.forEach((p) => {
    const t = p.track;
    const id = t?.id ?? `${t?.name ?? ''}|${t?.artists?.[0]?.name ?? ''}`;
    if (!id) return;
    if (!trackCounts[id]) {
      trackCounts[id] = { count: 0, id: t?.id ?? '', name: t?.name ?? '', artist: t?.artists?.[0]?.name ?? '', albumArt: t?.album?.images?.[0]?.url ?? '' };
    }
    trackCounts[id].count++;
  });

  const topRepeated = Object.values(trackCounts)
    .filter((r) => r.count >= FORTUNE_MIN_REPEATS)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((r, i) => {
      const af = r.id ? featuresMap.get(r.id) : undefined;
      return {
        rank: i + 1,
        name: r.name,
        artist: r.artist,
        albumArt: r.albumArt,
        repeatCount: r.count,
        valence: af?.valence ?? 0,
        energy: af?.energy ?? 0,
        danceability: af?.danceability ?? 0,
      };
    });

  // ── Top 50 Songs (from top_tracks_short — ~4 week frequency ranking) ───────
  const top50Songs = topTracksItems.slice(0, 50).map((t, i) => ({
    rank: i + 1,
    name: t.name ?? '',
    artist: t.artists?.[0]?.name ?? '',
    albumArt: t.album?.images?.[0]?.url ?? '',
    playCount: 0,
  }));

  // ── Time of Day (from recently_played — has played_at timestamps) ─────────
  // played_at is UTC; add UTC+3 offset for Turkey local time
  const TZ_OFFSET_HOURS = 3;
  const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const slotGenres: Record<string, Record<string, number>> = { morning: {}, afternoon: {}, evening: {}, night: {} };

  played.forEach((p) => {
    const utcHour = new Date(p.played_at || 0).getUTCHours();
    const h = (utcHour + TZ_OFFSET_HOURS) % 24;
    const slot: keyof typeof timeSlots = h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : h >= 18 ? 'evening' : 'night';
    timeSlots[slot]++;
    const g = songGenres.length ? getGenreForTrack(p.track?.name ?? '', p.track?.artists?.[0]?.name ?? '', songGenres) : '';
    if (g && isValidGenre(g)) slotGenres[slot][g] = (slotGenres[slot][g] ?? 0) + 1;
  });

  const dominantGenre = (counts: Record<string, number>) =>
    Object.entries(counts).filter(([n]) => isValidGenre(n)).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const timeOfDay = {
    morning:   { genre: dominantGenre(slotGenres.morning),   mood: '', moodKey: 'focused',     trackCount: timeSlots.morning },
    afternoon: { genre: dominantGenre(slotGenres.afternoon), mood: '', moodKey: 'thoughtful',  trackCount: timeSlots.afternoon },
    evening:   { genre: dominantGenre(slotGenres.evening),   mood: '', moodKey: 'romantic',    trackCount: timeSlots.evening },
    night:     { genre: dominantGenre(slotGenres.night),     mood: '', moodKey: 'intense',     trackCount: timeSlots.night },
  };

  // ── Devices ───────────────────────────────────────────────────────────────
  const devices: SpotifyDevice[] = (raw?.devices?.devices ?? []).map((d) => ({
    id: d.id ?? '',
    name: d.name ?? '',
    type: d.type ?? 'Unknown',
    isActive: d.is_active ?? false,
    volumePercent: d.volume_percent ?? null,
    supportsVolume: d.supports_volume ?? false,
  }));

  return {
    period: 'last_14_days',
    genres,
    topArtists,
    timeOfDay,
    topRepeated,
    top50Songs,
    devices,
    audioProfile,
  };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export interface DashboardData {
  user: CurrentUser;
  analysis: MockAnalysis | null;
  fortune: MockFortune | null;
  rawFetchedAt: string | null;
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = createServiceClient();

  const { data: userRow } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, plan')
    .eq('id', userId)
    .single();

  const { count: tokenCount } = await supabase
    .from('spotify_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  const user: CurrentUser = userRow
    ? {
        id: userRow.id,
        name: userRow.name ?? null,
        email: userRow.email ?? null,
        avatarUrl: userRow.avatar_url ?? null,
        plan: (userRow.plan as CurrentUser['plan']) ?? 'free',
        spotifyConnected: (tokenCount ?? 0) > 0,
      }
    : { id: userId, name: null, email: null, avatarUrl: null, plan: 'free', spotifyConnected: false };

  const { data: rawRows } = await supabase
    .from('spotify_raw_data')
    .select('recently_played, top_artists_short, top_tracks_short, audio_features, genre_analysis, devices, fetched_at')
    .eq('user_id', userId)
    .order('fetched_at', { ascending: false })
    .limit(1);

  const raw = rawRows?.[0] as SpotifyRawData | null | undefined;
  const analysis = transformRawToAnalysis(raw ?? null);
  const rawFetchedAt = raw?.fetched_at ?? null;

  const { data: fortuneRow } = await supabase
    .from('fortunes')
    .select('text, language, generated_at')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false })
    .limit(1)
    .single();

  const fortune: MockFortune | null = fortuneRow
    ? {
        tr: fortuneRow.language === 'tr' ? fortuneRow.text : '',
        en: fortuneRow.language === 'en' ? fortuneRow.text : '',
        de: fortuneRow.language === 'de' ? fortuneRow.text : '',
        ru: fortuneRow.language === 'ru' ? fortuneRow.text : '',
        generatedAt: fortuneRow.generated_at,
        isPro: user.plan !== 'free',
      }
    : null;

  return { user, analysis, fortune, rawFetchedAt };
}
