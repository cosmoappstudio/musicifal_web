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

const MOOD_LABELS_TR: Record<string, string> = {
  introspective: 'İçedönük',
  calm: 'Sakin',
  aggressive: 'Agresif',
  emotional: 'Duygusal',
  peaceful: 'Dingin',
  energetic: 'Enerjik',
  mixed: 'Karışık',
};

/**
 * Keyword-based mood classifier for Spotify genre strings.
 * Used as last-resort when audio features and Gemini analysis are both unavailable.
 */
function spotifyGenreToMoodKey(genre: string, fallbackIdx: number): string {
  const g = genre.toLowerCase();
  if (/metal|punk|hardcore|rage|agresif/.test(g)) return 'aggressive';
  if (/hip.?hop|rap|trap|drill|gangsta|grime/.test(g)) return 'introspective';
  if (/dance|edm|electro|house|techno|club|rave/.test(g)) return 'energetic';
  if (/r.?b|soul|neo.soul|indie|alternative|alternative/.test(g)) return 'emotional';
  if (/jazz|classical|ambient|folk|acoustic|country|bossa|lofi|chill/.test(g)) return 'peaceful';
  if (/pop|k.?pop|latin|reggaeton/.test(g)) return 'calm';
  return MOOD_KEYS[fallbackIdx % MOOD_KEYS.length];
}

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

/**
 * Classifies a single track into a mood bucket using energy + valence.
 * This is OUR interpretation, independent of Spotify genre tags.
 */
function trackMoodKey(energy: number, valence: number): string {
  if (energy >= 0.72 && valence < 0.38) return 'aggressive';
  if (energy >= 0.68 && valence >= 0.52) return 'energetic';
  if (energy >= 0.55 && valence >= 0.62) return 'emotional';
  if (energy < 0.38 && valence < 0.38) return 'introspective';
  if (energy < 0.42 && valence >= 0.52) return 'peaceful';
  if (energy < 0.58) return 'calm';
  return 'mixed';
}

/**
 * Derives a mood distribution directly from audio features — no genre names needed.
 * Primary: top_tracks rank-weighted (rank #1 = 50pts). Backup: recently_played play-count weighted.
 * Returns null if fewer than 8 unique tracks have audio features (not enough signal).
 */
function computeMoodDistribution(
  topTracksItems: Array<{ id?: string }>,
  recentlyPlayedItems: Array<{ track?: { id?: string } }>,
  featuresMap: Map<string, RawAudioFeature>,
): Array<{ name: string; percentage: number; moodKey: string; color: string; mood: string }> | null {
  const seenIds = new Set<string>();
  const moodWeights: Record<string, number> = {};
  let totalWeight = 0;
  let tracksWithFeatures = 0;

  // Primary: top_tracks with rank weighting
  topTracksItems.slice(0, 50).forEach((t, i) => {
    if (!t.id || seenIds.has(t.id)) return;
    const af = featuresMap.get(t.id);
    if (!af || typeof af.energy !== 'number' || typeof af.valence !== 'number') return;
    seenIds.add(t.id);
    tracksWithFeatures++;
    const mood = trackMoodKey(af.energy, af.valence);
    const weight = Math.max(1, 50 - i);
    moodWeights[mood] = (moodWeights[mood] ?? 0) + weight;
    totalWeight += weight;
  });

  // Backup: recently_played play-count weighting (always has audio features in the map)
  if (tracksWithFeatures < 8) {
    const playCounts: Record<string, number> = {};
    recentlyPlayedItems.forEach((p) => {
      const id = p.track?.id;
      if (id) playCounts[id] = (playCounts[id] ?? 0) + 1;
    });
    Object.entries(playCounts).forEach(([id, count]) => {
      if (seenIds.has(id)) return;
      const af = featuresMap.get(id);
      if (!af || typeof af.energy !== 'number' || typeof af.valence !== 'number') return;
      seenIds.add(id);
      tracksWithFeatures++;
      const mood = trackMoodKey(af.energy, af.valence);
      moodWeights[mood] = (moodWeights[mood] ?? 0) + count;
      totalWeight += count;
    });
  }

  if (tracksWithFeatures < 8 || totalWeight === 0) return null;

  const entries = Object.entries(moodWeights).sort((a, b) => b[1] - a[1]).slice(0, 6);
  return entries.map(([moodKey, weight], i) => ({
    name: MOOD_LABELS_TR[moodKey] ?? moodKey,
    percentage: Math.round((weight / totalWeight) * 100),
    moodKey,
    color: COLORS[i % COLORS.length],
    mood: '',
  }));
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

  // Build artist name → mood key map from Spotify artist genres (always available)
  const artistMoodMap = new Map<string, string>();
  topArtistsList.forEach((a, i) => {
    const firstGenre = a.genres?.[0];
    if (firstGenre) {
      artistMoodMap.set(a.name?.toLowerCase().trim() ?? '', spotifyGenreToMoodKey(firstGenre, i));
    }
  });

  // Build track ID → artist mood (used as slot fallback)
  const trackArtistMoodMap = new Map<string, string>();
  played.forEach((p) => {
    const id = p.track?.id;
    const artistName = p.track?.artists?.[0]?.name?.toLowerCase().trim() ?? '';
    if (id && !trackArtistMoodMap.has(id)) {
      const mk = artistMoodMap.get(artistName);
      if (mk) trackArtistMoodMap.set(id, mk);
    }
  });
  topTracksItems.forEach((t) => {
    const id = t.id;
    const artistName = t.artists?.[0]?.name?.toLowerCase().trim() ?? '';
    if (id && !trackArtistMoodMap.has(id)) {
      const mk = artistMoodMap.get(artistName);
      if (mk) trackArtistMoodMap.set(id, mk);
    }
  });

  // ── Audio features ────────────────────────────────────────────────────────
  const featuresMap = buildAudioFeaturesMap(raw);

  // Audio profile from top tracks (most representative of taste)
  const topTrackIds = topTracksItems.map((t) => t.id).filter(Boolean) as string[];
  const audioProfile = computeAudioProfile(topTrackIds, featuresMap);

  // ── Genres (shown as mood profile, not Spotify genre tags) ─────────────
  let genres: Array<{ name: string; percentage: number; mood: string; moodKey: string; color: string }> = [];

  // Helper: build final genre list from a moodWeights map
  const moodWeightsToGenres = (moodWeights: Record<string, number>) => {
    const total = Object.values(moodWeights).reduce((s, v) => s + v, 0) || 1;
    return Object.entries(moodWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([moodKey, weight], i) => ({
        name: MOOD_LABELS_TR[moodKey] ?? moodKey,
        percentage: Math.round((weight / total) * 100),
        mood: '',
        moodKey,
        color: COLORS[i % COLORS.length],
      }));
  };

  // Tier 1: audio features → exact energy/valence mood classification
  const moodDist = computeMoodDistribution(topTracksItems, played, featuresMap);
  if (moodDist && moodDist.length >= 2) {
    genres = moodDist;
  }

  // Tier 2: Gemini genre analysis → aggregate genre weights by moodKey
  if (genres.length === 0 && songGenres.length) {
    const genreWeights: Record<string, number> = {};
    topTracksItems.slice(0, 50).forEach((t, i) => {
      const g = getGenreForTrack(t.name ?? '', t.artists?.[0]?.name ?? '', songGenres).trim();
      if (g && isValidGenre(g)) genreWeights[g] = (genreWeights[g] ?? 0) + Math.max(1, 50 - i);
    });
    played.forEach((p) => {
      const g = getGenreForTrack(p.track?.name ?? '', p.track?.artists?.[0]?.name ?? '', songGenres).trim();
      if (g && isValidGenre(g)) genreWeights[g] = (genreWeights[g] ?? 0) + 1;
    });
    const entries = Object.entries(genreWeights).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (entries.length > 0) {
      const total = entries.reduce((s, [, w]) => s + w, 0) || 1;
      const moodAgg: Record<string, number> = {};
      entries.forEach(([name, weight], i) => {
        const mk = genreMoodKey(name, topTracksItems, songGenres, featuresMap, i);
        moodAgg[mk] = (moodAgg[mk] ?? 0) + weight;
      });
      genres = moodWeightsToGenres(moodAgg).map((g) => ({
        ...g,
        percentage: Math.round((moodAgg[g.moodKey]! / total) * 100),
      }));
    }
  }

  // Tier 3: Spotify artist genres → keyword-based mood (always available, no extra API)
  if (genres.length === 0) {
    const moodFromArtists: Record<string, number> = {};
    // Weight top tracks by rank, using their artist's genre-derived mood
    topTracksItems.slice(0, 50).forEach((t, i) => {
      const mk = trackArtistMoodMap.get(t.id ?? '');
      if (mk) moodFromArtists[mk] = (moodFromArtists[mk] ?? 0) + Math.max(1, 50 - i);
    });
    // Supplement with recently played (1pt per play)
    played.forEach((p) => {
      const mk = trackArtistMoodMap.get(p.track?.id ?? '');
      if (mk) moodFromArtists[mk] = (moodFromArtists[mk] ?? 0) + 1;
    });
    if (Object.keys(moodFromArtists).length > 0) {
      genres = moodWeightsToGenres(moodFromArtists);
    }
  }

  // Final fallback: should almost never reach here
  if (genres.length === 0) {
    genres = [{ name: 'Karışık', percentage: 100, mood: '', moodKey: 'mixed', color: COLORS[5] }];
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
  const slotTrackIds: Record<string, string[]> = { morning: [], afternoon: [], evening: [], night: [] };

  played.forEach((p) => {
    const utcHour = new Date(p.played_at || 0).getUTCHours();
    const h = (utcHour + TZ_OFFSET_HOURS) % 24;
    const slot: keyof typeof timeSlots = h >= 6 && h < 12 ? 'morning' : h >= 12 && h < 18 ? 'afternoon' : h >= 18 ? 'evening' : 'night';
    timeSlots[slot]++;
    if (p.track?.id) slotTrackIds[slot].push(p.track.id);
    const g = songGenres.length ? getGenreForTrack(p.track?.name ?? '', p.track?.artists?.[0]?.name ?? '', songGenres) : '';
    if (g && isValidGenre(g)) slotGenres[slot][g] = (slotGenres[slot][g] ?? 0) + 1;
  });

  // Dominant mood per slot — 3-tier fallback: audio features → Gemini genre → artist genre
  const slotMoodKey = (ids: string[], genreCounts: Record<string, number>, fallbackIdx: number): string => {
    // Tier 1: audio features
    const afCounts: Record<string, number> = {};
    ids.forEach((id) => {
      const af = featuresMap.get(id);
      if (!af || typeof af.energy !== 'number' || typeof af.valence !== 'number') return;
      afCounts[trackMoodKey(af.energy, af.valence)] = (afCounts[trackMoodKey(af.energy, af.valence)] ?? 0) + 1;
    });
    const afTop = Object.entries(afCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (afTop) return afTop;

    // Tier 2: dominant genre from Gemini analysis → moodKey
    const topGenre = Object.entries(genreCounts)
      .filter(([n]) => isValidGenre(n))
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    if (topGenre) return genreMoodKey(topGenre, topTracksItems, songGenres, featuresMap, fallbackIdx);

    // Tier 3: artist genre keyword mapping (always available)
    const agCounts: Record<string, number> = {};
    ids.forEach((id) => {
      const mk = trackArtistMoodMap.get(id);
      if (mk) agCounts[mk] = (agCounts[mk] ?? 0) + 1;
    });
    return Object.entries(agCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  };

  const slotMoods = {
    morning:   slotMoodKey(slotTrackIds.morning,   slotGenres.morning,   0),
    afternoon: slotMoodKey(slotTrackIds.afternoon, slotGenres.afternoon, 1),
    evening:   slotMoodKey(slotTrackIds.evening,   slotGenres.evening,   2),
    night:     slotMoodKey(slotTrackIds.night,     slotGenres.night,     3),
  };

  const slotLabel = (mk: string) => (mk ? MOOD_LABELS_TR[mk] ?? '—' : '—');

  const timeOfDay = {
    morning:   { genre: slotLabel(slotMoods.morning),   mood: '', moodKey: slotMoods.morning   || '', trackCount: timeSlots.morning },
    afternoon: { genre: slotLabel(slotMoods.afternoon), mood: '', moodKey: slotMoods.afternoon || '', trackCount: timeSlots.afternoon },
    evening:   { genre: slotLabel(slotMoods.evening),   mood: '', moodKey: slotMoods.evening   || '', trackCount: timeSlots.evening },
    night:     { genre: slotLabel(slotMoods.night),     mood: '', moodKey: slotMoods.night     || '', trackCount: timeSlots.night },
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
