/**
 * Dashboard data fetching - user, analysis from spotify_raw_data, fortune
 */

import { createServiceClient } from '@/lib/supabase/client';
import type { CurrentUser } from '@/lib/auth';
import type { MockAnalysis, MockFortune } from '@/types';

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
  top_tracks_short?: { items?: Array<{ id: string; name: string; artists?: { name: string }[]; album?: { images?: { url: string }[] }; popularity?: number }> } | null;
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
  const hasGenreAnalysis = (raw?.genre_analysis?.genres?.length ?? 0) > 0;
  if (allArtists.length === 0 && played.length === 0 && !hasGenreAnalysis) return null;

  const items = allArtists; // use all for genre aggregation
  const genreCounts: Record<string, number> = {};
  items.forEach((a) => {
    (a.genres || []).forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  let genres: Array<{ name: string; percentage: number; mood: string; moodKey: string; color: string }>;

  if (raw?.genre_analysis?.genres?.length) {
    genres = raw.genre_analysis.genres.slice(0, 6).map((g, i) => ({
      name: g.name,
      percentage: g.percentage,
      mood: '',
      moodKey: MOOD_KEYS[i % MOOD_KEYS.length],
      color: COLORS[i % COLORS.length],
    }));
    if (genres.length < 2) {
      genres.push({ name: 'Other', percentage: 100 - genres.reduce((s, g) => s + g.percentage, 0), mood: '', moodKey: 'mixed', color: COLORS[5] });
    }
  } else if (Object.keys(genreCounts).length > 0) {
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
  } else {
    // Spotify often returns empty genres for independent/niche artists - use top artist names as fallback
    const topForChart = (raw?.top_artists_short?.items ?? allArtists).slice(0, 6);
    const per = Math.floor(100 / topForChart.length);
    const remainder = 100 - per * topForChart.length;
    genres = topForChart.map((a, i) => ({
      name: a.name,
      percentage: i === 0 ? per + remainder : per,
      mood: '',
      moodKey: MOOD_KEYS[i % MOOD_KEYS.length],
      color: COLORS[i % COLORS.length],
    }));
  }

  const topArtistsList = (raw?.top_artists_short?.items ?? allArtists).slice(0, 10);
  const topArtists = topArtistsList.map((a, i) => ({
    rank: i + 1,
    name: a.name,
    playCount: 0,
    imageUrl: a.images?.[0]?.url ?? '',
    genre: a.genres?.[0] ?? '',
  }));

  const trackCounts: Record<string, { count: number; name: string; artist: string; albumArt: string }> = {};
  played.forEach((p) => {
    const t = p.track;
    if (!t?.id) return;
    const key = t.id;
    if (!trackCounts[key]) {
      trackCounts[key] = { count: 0, name: t.name, artist: t.artists?.[0]?.name ?? '', albumArt: t.album?.images?.[0]?.url ?? '' };
    }
    trackCounts[key].count++;
  });
  const topRepeated = Object.values(trackCounts)
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

  const timeSlots = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const slotGenreCounts: Record<string, Record<string, number>> = {
    morning: {},
    afternoon: {},
    evening: {},
    night: {},
  };
  const songGenres = raw?.genre_analysis?.songGenres ?? [];

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
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? genres[0]?.name ?? 'Unknown';
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
