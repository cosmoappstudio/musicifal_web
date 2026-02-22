/**
 * Build analysis summary for fortune generation
 * Uses: 50 songs, top 10 repeated, top genres, rhythm of day with genre per slot
 */

interface RawRecentlyPlayed {
  played_at?: string;
  track?: { id?: string; name?: string; artists?: { name?: string }[]; album?: { images?: { url?: string }[] } };
}

interface RawGenreAnalysis {
  genres?: Array<{ name: string; percentage: number }>;
  songGenres?: Array<{ song: string; artist: string; genre: string }>;
}

function getGenreFor(song: string, artist: string, songGenres: Array<{ song: string; artist: string; genre: string }>): string {
  const s = (song ?? '').toLowerCase().trim();
  const a = (artist ?? '').toLowerCase().trim();
  return songGenres.find((g) => g.song?.toLowerCase().trim() === s && g.artist?.toLowerCase().trim() === a)?.genre ?? '';
}

function hourToSlot(h: number): 'morning' | 'afternoon' | 'evening' | 'night' {
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 24) return 'evening';
  return 'night';
}

export function buildFortuneAnalysisSummary(params: {
  recentlyPlayed: RawRecentlyPlayed[];
  genreAnalysis?: RawGenreAnalysis | null;
  topArtistsShort?: { items?: Array<{ name?: string; genres?: string[] }> };
}): string {
  const { recentlyPlayed, genreAnalysis, topArtistsShort } = params;
  const played = recentlyPlayed ?? [];
  const last50 = played.slice(0, 50);
  const songGenres = genreAnalysis?.songGenres ?? [];

  const trackCounts: Record<string, { count: number; name: string; artist: string }> = {};
  played.forEach((p) => {
    const t = p.track;
    if (!t?.id) return;
    if (!trackCounts[t.id]) {
      trackCounts[t.id] = { count: 0, name: t.name ?? '', artist: t.artists?.[0]?.name ?? '' };
    }
    trackCounts[t.id].count++;
  });
  const topRepeated = Object.values(trackCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topGenres = genreAnalysis?.genres ?? [];
  const fallbackGenres = (topArtistsShort?.items ?? []).flatMap((a) => a.genres ?? []).slice(0, 5);
  const genreLabels = topGenres.length > 0 ? topGenres.map((g) => `${g.name} %${g.percentage}`).join(', ') : fallbackGenres.join(', ') || '-';

  const slots: Record<string, { count: number; genres: Record<string, number> }> = {
    morning: { count: 0, genres: {} },
    afternoon: { count: 0, genres: {} },
    evening: { count: 0, genres: {} },
    night: { count: 0, genres: {} },
  };
  last50.forEach((p) => {
    const h = new Date(p.played_at ?? 0).getHours();
    const slot = hourToSlot(h);
    slots[slot].count++;
    const genre = songGenres.length ? getGenreFor(p.track?.name ?? '', p.track?.artists?.[0]?.name ?? '', songGenres) : '';
    if (genre) {
      slots[slot].genres[genre] = (slots[slot].genres[genre] ?? 0) + 1;
    }
  });

  const slotLabel = (k: string) => (k === 'morning' ? '06-12' : k === 'afternoon' ? '12-18' : k === 'evening' ? '18-23' : '23-06');
  const dominantGenre = (genres: Record<string, number>) =>
    Object.entries(genres).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';

  const rhythmLines = (['morning', 'afternoon', 'evening', 'night'] as const).map(
    (s) => `  ${slotLabel(s)}: ${slots[s].count} parça, dominant tür: ${dominantGenre(slots[s].genres)}`
  );

  const songsList = last50
    .map((p, i) => `${i + 1}. "${p.track?.name ?? ''}" - ${p.track?.artists?.[0]?.name ?? ''} (${new Date(p.played_at ?? 0).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})`)
    .join('\n');

  const repeatedList = topRepeated.map((r, i) => `${i + 1}. "${r.name}" - ${r.artist} (${r.count} kez)`).join('\n');

  return `
KULLANICI MÜZİK ANALİZİ (Son 14 gün)

## Dinlenen 50 Şarkı (son dinlenenler)
${songsList || '-'}

## En Çok Tekrar Dinlenen 10 Şarkı
${repeatedList || '-'}

## En Çok Dinlenen Müzik Türleri
${genreLabels}

## Günün Ritmi (saat dilimlerine göre dinleme + tür)
${rhythmLines.join('\n')}
`.trim();
}
