/**
 * Dashboard data fetching - user, analysis from spotify_raw_data, fortune
 */

import { createServiceClient } from '@/lib/supabase/client';
import type { CurrentUser } from '@/lib/auth';
import type { MockAnalysis, MockFortune } from '@/types';
import { FORTUNE_MIN_REPEATS } from '@/lib/fortune/build-summary';

const COLORS = ['#7C3AED', '#A855F7', '#C084FC', '#E879F9', '#D97706', '#6B7280'];
const MOOD_KEYS = ['introspective', 'calm', 'aggressive', 'emotional', 'peaceful', 'mixed'] as const;

interface ARTIST_ITEM { name: string; images?: { url: string }[]; genres?: string[] }

interface GenreAnalysis {
  genres?: Array<{ name: string; percentage: number }>;
  songGenres?: Array<{ song: string; artist: string; genre: string }>;
}

interface SpotifyRawData {
  profile?: { id?: string; display_name?: string; email?: string; images?: { url: string }[] } | null;
  recently_played?: Array<{
    played_at?: string;
    track?: { id: string; name: string; artists?: { name: string }[]; album?: { images?: { url: string }[] } };
  }> | null;
  top_artists_short?: { items?: ARTIST_ITEM[] } | null;
  top_artists_medium?: { items?: ARTIST_ITEM[] } | null;
  top_artists_long?: { items?: ARTIST_ITEM[] } | null;
  top_tracks_short?: { items?: Array<{ id?: string; name?: string; artists?: { name: string }[]; album?: { images?: { url: string }[] }; popularity?: number }> } | null;
  genre_analysis?: GenreAnalysis | null;
  fetched_at?: string;
}

function getGenreForTrack(
  trackName: string,
  artistName: string,
  songGenres: Array<{ song: string; artist: string; genre: string }>
): string {
  const t = trackName.toLowerCase().trim();
  const a = artistName.toLowerCase().trim();
  const found = songGenres.find(
    (sg) => sg.song?.toLowerCase().trim() === t && sg.artist?.toLowerCase().trim() === a
  );
  return found?.genre ?? '';
}

function allArtistItems(raw: SpotifyRawData | null): ARTIST_ITEM[] {
  const short = raw?.top_artists_short?.items ?? [];
  const medium = raw?.top_artists_medium?.items ?? [];
  const long = raw?.top_artists_long?.items ?? [];
  return [...short, ...medium, ...long];
}

function transformRawToAnalysis(raw: SpotifyRawData | null): MockAnalysis | null {
  const allArtists = allArtistItems(raw);
  const played = raw?.recently_played ?? [];
  const hasGenreAnalysis = (raw?.genre_analysis?.genres?.length ?? 0) > 0 || (raw?.genre_analysis?.songGenres?.length ?? 0) > 0;
  if (allArtists.length === 0 && played.length === 0 && !hasGenreAnalysis) return null;

  const items = allArtists; // use all for genre aggregation
  const genreCounts: Record<string, number> = {};
  items.forEach((a) => {
    (a.genres || []).forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const topArtistsList = (raw?.top_artists_short?.items ?? allArtists).slice(0, 10);
  const allArtistNames = new Set(allArtists.map((a) => a.name?.toLowerCase().trim()).filter(Boolean));

  const isValidGenre = (name: string) => {
    const n = name?.trim().toLowerCase();
    if (!n) return false;
    if (allArtistNames.has(n)) return false; // sanatçı adı değil
    return true;
  };

  let genres: Array<{ name: string; percentage: number; mood: string; moodKey: string; color: string }> = [];
  const songGenres = raw?.genre_analysis?.songGenres ?? [];
  const topTracksItems = raw?.top_tracks_short?.items ?? [];

  if (songGenres.length && topTracksItems.length) {
    // top_tracks_short rank-ağırlıklı: #1 = ağırlık 50, #50 = ağırlık 1
    const genreWeights: Record<string, number> = {};
    topTracksItems.slice(0, 50).forEach((t, i) => {
      const g = getGenreForTrack(t.name ?? '', t.artists?.[0]?.name ?? '', songGenres).trim();
      if (g && isValidGenre(g)) {
        const weight = Math.max(1, 50 - i); // rank weight
        genreWeights[g] = (genreWeights[g] ?? 0) + weight;
      }
    });
    // Eşleşmeyen top track'lere ek olarak recently_played üzerinden de say (düşük ağırlık)
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
        moodKey: MOOD_KEYS[i % MOOD_KEYS.length],
        color: COLORS[i % COLORS.length],
      }));
      if (genres.length < 2) {
        genres.push({ name: 'Other', percentage: 100 - genres.reduce((s, g) => s + g.percentage, 0), mood: '', moodKey: 'mixed', color: COLORS[5] });
      }
    }
  }
  if (genres.length === 0 && raw?.genre_analysis?.genres?.length) {
    const filtered = raw.genre_analysis.genres.filter((g) => isValidGenre(g.name));
    genres = filtered.slice(0, 6).map((g, i) => ({
      name: g.name,
      percentage: g.percentage,
      mood: '',
      moodKey: MOOD_KEYS[i % MOOD_KEYS.length],
      color: COLORS[i % COLORS.length],
    }));
    if (genres.length < 2 && filtered.length > 0) {
      genres.push({ name: 'Other', percentage: 100 - genres.reduce((s, g) => s + g.percentage, 0), mood: '', moodKey: 'mixed', color: COLORS[5] });
    }
  }
  if (genres.length === 0 && Object.keys(genreCounts).length > 0) {
    const totalGenre = Object.values(genreCounts).reduce((a, b) => a + b, 0) || 1;
    genres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name], i) => ({
        name,
        percentage: Math.round((genreCounts[name] / totalGenre) * 100),
        mood: '',
        moodKey: MOOD_KEYS[i % MOOD_KEYS.length],
        color: COLORS[i % COLORS.length],
      }));
    if (genres.length < 2) {
      genres.push({ name: 'Other', percentage: 100 - genres.reduce((s, g) => s + g.percentage, 0), mood: '', moodKey: 'mixed', color: COLORS[5] });
    }
  }
  if (genres.length === 0) {
    // genre_analysis yok: Spotify artist.genres kullan, yoksa "Çeşitli"
    const spotifyGenres = allArtists.flatMap((a) => (a.genres ?? []).filter((g) => isValidGenre(g)));
    const genreCountsFallback: Record<string, number> = {};
    spotifyGenres.forEach((g) => { genreCountsFallback[g] = (genreCountsFallback[g] ?? 0) + 1; });
    const sorted = Object.entries(genreCountsFallback).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (sorted.length >= 1) {
      const total = sorted.reduce((s, [, c]) => s + c, 0) || 1;
      genres = sorted.map(([name], i) => ({
        name,
        percentage: Math.round((genreCountsFallback[name]! / total) * 100),
        mood: '',
        moodKey: MOOD_KEYS[i % MOOD_KEYS.length],
        color: COLORS[i % COLORS.length],
      }));
    } else {
      genres = [{ name: 'Çeşitli', percentage: 100, mood: '', moodKey: 'mixed', color: COLORS[5] }];
    }
  }

  const artistPlayCounts: Record<string, number> = {};
  played.forEach((p) => {
    const artistName = p.track?.artists?.[0]?.name?.trim();
    if (artistName) {
      artistPlayCounts[artistName] = (artistPlayCounts[artistName] ?? 0) + 1;
    }
  });

  const topArtists = topArtistsList.map((a, i) => ({
    rank: i + 1,
    name: a.name,
    playCount: artistPlayCounts[a.name] ?? 0,
    imageUrl: a.images?.[0]?.url ?? '',
    genre: a.genres?.[0] ?? raw?.genre_analysis?.songGenres?.find((sg) => sg.artist?.toLowerCase() === a.name?.toLowerCase())?.genre ?? '',
  }));

  const trackCounts: Record<string, { count: number; name: string; artist: string; albumArt: string }> = {};
  played.forEach((p) => {
    const t = p.track;
    const name = t?.name ?? '';
    const artist = t?.artists?.[0]?.name ?? '';
    const key = (t as { id?: string })?.id ?? `${name}|${artist}`;
    if (!key) return;
    if (!trackCounts[key]) {
      trackCounts[key] = { count: 0, name, artist, albumArt: t?.album?.images?.[0]?.url ?? '' };
    }
    trackCounts[key].count++;
  });
  const topRepeated = Object.values(trackCounts)
    .filter((r) => r.count >= FORTUNE_MIN_REPEATS)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((r, i) => ({
      rank: i + 1,
      name: r.name,
      artist: r.artist,
      albumArt: r.albumArt,
      repeatCount: r.count,
      valence: 0.5,
      energy: 0.5,
      danceability: 0.5,
    }));

  // top_tracks_short = son ~4 haftanın gerçek sıklık sıralaması
  // recently_played max 50 kayıt döndürdüğü için trackCounts güvenilmez
  const top50Songs = topTracksItems.slice(0, 50).map((t, i) => ({
    rank: i + 1,
    name: t.name ?? '',
    artist: t.artists?.[0]?.name ?? '',
    albumArt: t.album?.images?.[0]?.url ?? '',
    playCount: 0, // Spotify API play count sağlamıyor; rank = frekans göstergesi
  }));

  const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const slotGenreCounts: Record<string, Record<string, number>> = {
    morning: {},
    afternoon: {},
    evening: {},
    night: {},
  };

  played.forEach((p) => {
    const h = new Date(p.played_at || 0).getHours();
    let slot: keyof typeof timeSlots = 'morning';
    if (h >= 6 && h < 12) slot = 'morning';
    else if (h >= 12 && h < 18) slot = 'afternoon';
    else if (h >= 18 && h < 24) slot = 'evening';
    else slot = 'night';
    timeSlots[slot]++;
    const genre = songGenres.length
      ? getGenreForTrack(p.track?.name ?? '', p.track?.artists?.[0]?.name ?? '', songGenres)
      : '';
    if (genre) {
      slotGenreCounts[slot][genre] = (slotGenreCounts[slot][genre] ?? 0) + 1;
    }
  });

  const dominantGenre = (counts: Record<string, number>) => {
    const entries = Object.entries(counts)
      .filter(([name]) => isValidGenre(name))
      .sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? '—';
  };
  const timeOfDay = {
    morning: { genre: dominantGenre(slotGenreCounts.morning), mood: '', moodKey: 'focused', trackCount: timeSlots.morning },
    afternoon: { genre: dominantGenre(slotGenreCounts.afternoon), mood: '', moodKey: 'thoughtful', trackCount: timeSlots.afternoon },
    evening: { genre: dominantGenre(slotGenreCounts.evening), mood: '', moodKey: 'romantic', trackCount: timeSlots.evening },
    night: { genre: dominantGenre(slotGenreCounts.night), mood: '', moodKey: 'intense', trackCount: timeSlots.night },
  };

  return {
    period: 'last_14_days',
    genres,
    topArtists,
    timeOfDay,
    topRepeated,
    top50Songs,
  };
}

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
    .select('profile, recently_played, top_artists_short, top_artists_medium, top_artists_long, top_tracks_short, genre_analysis, fetched_at')
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
