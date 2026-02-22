/**
 * Mevcut recently_played verisiyle genre analizini yeniden çalıştırır.
 * Spotify'dan yeniden çekme yapmaz, sadece Replicate ile genre analizi günceller.
 */
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServiceClient } from '@/lib/supabase/client';
import { analyzeGenres } from '@/lib/replicate/genre-analysis';
import { computeFortuneParams, type ComputedParams } from '@/lib/fortune/build-summary';

export async function POST() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServiceClient();

  const { data: row } = await supabase
    .from('spotify_raw_data')
    .select('id, recently_played, top_tracks_short, top_artists_short, audio_features, devices')
    .eq('user_id', userId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single();

  if (!row?.recently_played?.length && !row?.top_tracks_short?.items?.length) {
    return NextResponse.json({ error: 'Veri bulunamadı. Önce Verilerimi Getir yapın.' }, { status: 400 });
  }

  const { data: appSettings } = await supabase
    .from('app_settings')
    .select('replicate_model_id')
    .eq('id', 'default')
    .single();
  const modelId = (appSettings?.replicate_model_id as string) || 'google/gemini-2.5-flash';

  // top_tracks_short + recently_played birleşik, deduplicate
  const seen = new Set<string>();
  const songsForAnalysis: Array<{ name: string; artist: string; playedAt?: string }> = [];
  (row.top_tracks_short?.items ?? []).forEach((t: { name?: string; artists?: { name?: string }[] }) => {
    const key = `${t.name ?? ''}|${t.artists?.[0]?.name ?? ''}`.toLowerCase();
    if (!seen.has(key)) { seen.add(key); songsForAnalysis.push({ name: t.name ?? '', artist: t.artists?.[0]?.name ?? '' }); }
  });
  (row.recently_played as Array<{ played_at?: string; track?: { name?: string; artists?: { name?: string }[] } }> ?? [])
    .slice(0, 50).forEach((p) => {
      const key = `${p.track?.name ?? ''}|${p.track?.artists?.[0]?.name ?? ''}`.toLowerCase();
      if (!seen.has(key)) { seen.add(key); songsForAnalysis.push({ name: p.track?.name ?? '', artist: p.track?.artists?.[0]?.name ?? '', playedAt: p.played_at }); }
    });
  // analyzeGenres internally caps to 30; no need to send more
  const songs = songsForAnalysis.slice(0, 30);
  console.log(`[reanalyze-genres] userId=${userId}, songs=${songs.length}, model=${modelId}`);

  try {
    const genreAnalysis = await analyzeGenres(songs, modelId);
    const computedParams = computeFortuneParams({
      recentlyPlayed: row.recently_played as Array<{ played_at?: string; track?: { id?: string; name?: string; artists?: { name?: string }[] } }>,
      genreAnalysis: genreAnalysis as { genres?: Array<{ name: string; percentage: number }>; songGenres?: Array<{ song: string; artist: string; genre: string }> },
      topArtistsShort: row.top_artists_short as { items?: Array<{ name?: string; genres?: string[] }> },
      audioFeatures: row.audio_features as { audio_features?: Array<{ id?: string; valence?: number; energy?: number; danceability?: number; tempo?: number; acousticness?: number } | null> },
      devices: row.devices as { devices?: Array<{ name?: string; type?: string; is_active?: boolean }> },
    });
    await supabase
      .from('spotify_raw_data')
      .update({
        genre_analysis: genreAnalysis as unknown as Record<string, unknown>,
        computed_params: computedParams as unknown as Record<string, unknown>,
      })
      .eq('id', row.id);

    return NextResponse.json({
      ok: true,
      genres: genreAnalysis.genres.length,
      songGenres: genreAnalysis.songGenres.length,
    });
  } catch (err) {
    console.error('[reanalyze-genres]', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Analiz başarısız' }, { status: 500 });
  }
}
