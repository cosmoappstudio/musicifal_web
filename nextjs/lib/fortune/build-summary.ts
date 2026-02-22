/**
 * Build analysis summary for fortune generation
 * Veri parametreleri tek yerden; prompt'ta {{DATA_PARAMS}} ile dinamik kullanılır.
 */

/** Son N gün (analiz penceresi) */
export const FORTUNE_LAST_DAYS = 14;
/** Fal için kullanılan son şarkı sayısı */
export const FORTUNE_SONGS_COUNT = 50;
/** Tekrar listesine girmesi için minimum dinlenme sayısı */
export const FORTUNE_MIN_REPEATS = 15;
/** Fal için en çok tekrar dinlenen şarkı sayısı (min FORTUNE_MIN_REPEATS koşulunu sağlayanlardan) */
export const FORTUNE_TOP_REPEATED_COUNT = 10;

/** Prompt şablonunda {{DATA_PARAMS}} yerine konacak metin */
export function getFortuneDataParamsDescription(): string {
  return `- Son ${FORTUNE_LAST_DAYS} günde dinlediği ${FORTUNE_SONGS_COUNT} şarkı (isim, sanatçı, dinleme saati)
- En az ${FORTUNE_MIN_REPEATS} kez tekrar dinlediği ilk ${FORTUNE_TOP_REPEATED_COUNT} şarkı (isim, sanatçı, tekrar sayısı)
- En çok dinlediği müzik türleri (yüzdelik dağılım)
- Günün ritmi: Sabah (06-12), Öğleden sonra (12-18), Akşam (18-23), Gece (23-06) saat dilimlerinde kaç parça dinlemiş ve her dilimdeki dominant tür
- Ses profili: ortalama valence (mutluluk/hüzün), energy (enerji), danceability (dans edebilirlik), tempo (BPM), acousticness (akustiklik) — 0-1 arası Spotify audio features
- Kayıtlı Spotify cihazları (bilgisayar, telefon, TV gibi; hangi ortamda müzik dinlendiğine dair bağlam)`;
}

/** Saklanan hesaplanmış parametreler (spotify_raw_data.computed_params) */
export interface ComputedParams {
  last50Songs: Array<{ name: string; artist: string; playedAt: string }>;
  top10Repeated: Array<{ name: string; artist: string; count: number }>;
  topGenres: string;
  rhythmOfDay: {
    morning: { count: number; dominantGenre: string };
    afternoon: { count: number; dominantGenre: string };
    evening: { count: number; dominantGenre: string };
    night: { count: number; dominantGenre: string };
  };
  audioProfile?: {
    avgValence: number;
    avgEnergy: number;
    avgDanceability: number;
    avgTempo: number;
    avgAcousticness: number;
    trackCount: number;
  };
  devices?: Array<{ name: string; type: string; isActive: boolean }>;
}

/** Raw veriden hesaplanmış parametreleri üretir (DB'ye kaydedilir) */
export function computeFortuneParams(params: {
  recentlyPlayed: RawRecentlyPlayed[];
  genreAnalysis?: RawGenreAnalysis | null;
  topArtistsShort?: { items?: Array<{ name?: string; genres?: string[] }> };
  audioFeatures?: { audio_features?: Array<{ id?: string; valence?: number; energy?: number; danceability?: number; tempo?: number; acousticness?: number } | null> };
  devices?: { devices?: Array<{ name?: string; type?: string; is_active?: boolean }> };
}): ComputedParams {
  const { recentlyPlayed, genreAnalysis, topArtistsShort, audioFeatures, devices } = params;
  const played = recentlyPlayed ?? [];
  const lastSongs = played.slice(0, FORTUNE_SONGS_COUNT);
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
    .filter((r) => r.count >= FORTUNE_MIN_REPEATS)
    .sort((a, b) => b.count - a.count)
    .slice(0, FORTUNE_TOP_REPEATED_COUNT);

  const topGenres = genreAnalysis?.genres ?? [];
  const fallbackGenres = (topArtistsShort?.items ?? []).flatMap((a) => a.genres ?? []).slice(0, 5);
  const topGenresStr = topGenres.length > 0 ? topGenres.map((g) => `${g.name} %${g.percentage}`).join(', ') : fallbackGenres.join(', ') || '-';

  const slots: Record<string, { count: number; genres: Record<string, number> }> = {
    morning: { count: 0, genres: {} },
    afternoon: { count: 0, genres: {} },
    evening: { count: 0, genres: {} },
    night: { count: 0, genres: {} },
  };
  lastSongs.forEach((p) => {
    const utcH = new Date(p.played_at ?? 0).getUTCHours();
    const h = (utcH + 3) % 24; // UTC+3 (Turkey)
    const slot = hourToSlot(h);
    slots[slot].count++;
    const genre = songGenres.length ? getGenreFor(p.track?.name ?? '', p.track?.artists?.[0]?.name ?? '', songGenres) : '';
    if (genre) slots[slot].genres[genre] = (slots[slot].genres[genre] ?? 0) + 1;
  });

  const dominantGenre = (genres: Record<string, number>) =>
    Object.entries(genres).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';

  // Audio profile: compute averages from all available audio features
  const allFeatures = (audioFeatures?.audio_features ?? []).filter(Boolean) as Array<{ id?: string; valence?: number; energy?: number; danceability?: number; tempo?: number; acousticness?: number }>;
  let audioProfile: ComputedParams['audioProfile'];
  if (allFeatures.length > 0) {
    const avg = (key: keyof typeof allFeatures[0]) => {
      const vals = allFeatures.map((f) => f[key] as number).filter((v) => typeof v === 'number' && !isNaN(v));
      return vals.length ? Math.round((vals.reduce((s, v) => s + v, 0) / vals.length) * 100) / 100 : 0;
    };
    audioProfile = {
      avgValence: avg('valence'),
      avgEnergy: avg('energy'),
      avgDanceability: avg('danceability'),
      avgTempo: Math.round(avg('tempo')),
      avgAcousticness: avg('acousticness'),
      trackCount: allFeatures.length,
    };
  }

  const deviceList = (devices?.devices ?? []).map((d) => ({
    name: d.name ?? '',
    type: d.type ?? '',
    isActive: d.is_active ?? false,
  }));

  return {
    last50Songs: lastSongs.map((p) => ({
      name: p.track?.name ?? '',
      artist: p.track?.artists?.[0]?.name ?? '',
      playedAt: p.played_at ?? '',
    })),
    top10Repeated: topRepeated.map((r) => ({ name: r.name, artist: r.artist, count: r.count })),
    topGenres: topGenresStr,
    rhythmOfDay: {
      morning: { count: slots.morning.count, dominantGenre: dominantGenre(slots.morning.genres) },
      afternoon: { count: slots.afternoon.count, dominantGenre: dominantGenre(slots.afternoon.genres) },
      evening: { count: slots.evening.count, dominantGenre: dominantGenre(slots.evening.genres) },
      night: { count: slots.night.count, dominantGenre: dominantGenre(slots.night.genres) },
    },
    audioProfile,
    devices: deviceList.length > 0 ? deviceList : undefined,
  };
}

/** Saklanmış computed_params'i Gemini için yorumlanmış prompt metnine çevirir.
 *  Bu fonksiyon veri ile yapay zeka arasındaki "yorum katmanı"dır:
 *  Ham sayıları insan ve AI için anlamlı bağlama dönüştürür.
 */
export function paramsToPromptText(params: ComputedParams): string {
  const TYPE_TR: Record<string, string> = { Computer: 'Bilgisayar', Smartphone: 'Telefon', TV: 'TV', Speaker: 'Hoparlör', Automobile: 'Araç' };
  const SLOT_TR: Record<string, string> = { morning: 'Sabah (06-12)', afternoon: 'Öğleden Sonra (12-18)', evening: 'Akşam (18-23)', night: 'Gece (23-06)' };

  // ── Ses Profili yorumu ───────────────────────────────────────────────────
  const ap = params.audioProfile;
  let audioInterpretation = 'Ses profili verisi yok.';
  if (ap && ap.trackCount > 0) {
    const valenceLabel = ap.avgValence >= 0.65 ? 'pozitif ve mutlu' : ap.avgValence <= 0.35 ? 'melankolik ve karanlık' : 'nötr/duygusal denge';
    const energyLabel = ap.avgEnergy >= 0.7 ? 'yüksek tempolu, güçlü ve yoğun' : ap.avgEnergy <= 0.35 ? 'sakin, dingin ve yumuşak' : 'orta enerji düzeyinde';
    const danceLabel = ap.avgDanceability >= 0.65 ? 'dans edilebilir, ritimli' : ap.avgDanceability <= 0.4 ? 'dans edilemez, akış odaklı' : 'orta dans edilebilirlikte';
    const acousticLabel = ap.avgAcousticness >= 0.5 ? 'akustik/doğal enstrümantasyon' : ap.avgAcousticness <= 0.2 ? 'tamamen elektronik/sentetik' : 'elektronik ağırlıklı';
    audioInterpretation = `${ap.trackCount} şarkı analiz edildi.
  - Duygu tonu (valence): ${ap.avgValence.toFixed(2)}/1.0 → ${valenceLabel}
  - Enerji seviyesi: ${ap.avgEnergy.toFixed(2)}/1.0 → ${energyLabel}
  - Dans edilebilirlik: ${ap.avgDanceability.toFixed(2)}/1.0 → ${danceLabel}
  - Tempo: ~${ap.avgTempo} BPM
  - Akustiklik: ${ap.avgAcousticness.toFixed(2)}/1.0 → ${acousticLabel}`;
  }

  // ── Günün ritmi yorumu ───────────────────────────────────────────────────
  const slots = ['morning', 'afternoon', 'evening', 'night'] as const;
  const totalPlays = slots.reduce((s, k) => s + params.rhythmOfDay[k].count, 0);
  const busiest = slots.reduce((a, b) => params.rhythmOfDay[a].count >= params.rhythmOfDay[b].count ? a : b);
  const rhythmLines = slots.map((s) => {
    const { count, dominantGenre } = params.rhythmOfDay[s];
    const pct = totalPlays > 0 ? Math.round((count / totalPlays) * 100) : 0;
    return `  ${SLOT_TR[s]}: ${count} parça (%${pct}) — dominant tür: ${dominantGenre || '—'}`;
  });
  const busiestLabel = SLOT_TR[busiest] ?? busiest;

  // ── Cihazlar ─────────────────────────────────────────────────────────────
  const deviceList = params.devices ?? [];
  const activeDevice = deviceList.find((d) => d.isActive);
  const devicesLine = deviceList.length > 0
    ? deviceList.map((d) => `${TYPE_TR[d.type] ?? d.type} "${d.name}"${d.isActive ? ' (şu an aktif)' : ''}`).join(', ')
    : 'Cihaz bilgisi yok';
  const deviceContext = activeDevice
    ? `Kullanıcı şu an ${TYPE_TR[activeDevice.type] ?? activeDevice.type} cihazında dinliyor.`
    : `Kayıtlı cihazlar: ${devicesLine}`;

  // ── Tekrar şarkıları ─────────────────────────────────────────────────────
  const repeatedList = params.top10Repeated.length > 0
    ? params.top10Repeated.map((r, i) => `  ${i + 1}. "${r.name}" - ${r.artist} (${r.count} kez tekrar)`)
      .join('\n')
    : '  Yok (hiçbir şarkı çok tekrar edilmemiş)';

  // ── Son dinlenenler (zaman bilgisiyle) ───────────────────────────────────
  const songsList = params.last50Songs.length > 0
    ? params.last50Songs
        .map((p, i) => {
          const timeStr = p.playedAt
            ? new Date(new Date(p.playedAt).getTime() + 3 * 3600000)
                .toISOString().slice(11, 16) // UTC+3
            : '-';
          return `  ${i + 1}. "${p.name}" - ${p.artist} (${timeStr})`;
        })
        .join('\n')
    : '  Veri yok';

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÜZİK ANALİZ RAPORU — Son ${FORTUNE_LAST_DAYS} Gün
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1. MÜZİK TÜRLERİ (Spotify Top Charts ağırlıklı)
${params.topGenres || 'Tür verisi yok'}

## 2. SES PROFİLİ (Spotify Audio Features)
${audioInterpretation}
→ Yorumlama ipucu: Yüksek enerji + düşük valence = yoğun/karanlık. Düşük enerji + yüksek valence = sakin/mutlu.

## 3. DİNLEME RİTMİ (Türkiye saatiyle UTC+3)
En yoğun dilim: ${busiestLabel} (${params.rhythmOfDay[busiest].count} parça)
${rhythmLines.join('\n')}

## 4. TEKRAR DİNLENEN ŞARKILAR (obsesyon göstergesi)
${repeatedList}

## 5. SON ${FORTUNE_SONGS_COUNT} ŞARKI (dinleme zamanıyla)
${songsList}

## 6. CİHAZ BAĞLAMI
${deviceContext}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}

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
  const lastSongs = played.slice(0, FORTUNE_SONGS_COUNT);
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
    .filter((r) => r.count >= FORTUNE_MIN_REPEATS)
    .sort((a, b) => b.count - a.count)
    .slice(0, FORTUNE_TOP_REPEATED_COUNT);

  const topGenres = genreAnalysis?.genres ?? [];
  const fallbackGenres = (topArtistsShort?.items ?? []).flatMap((a) => a.genres ?? []).slice(0, 5);
  const genreLabels = topGenres.length > 0 ? topGenres.map((g) => `${g.name} %${g.percentage}`).join(', ') : fallbackGenres.join(', ') || '-';

  const slots: Record<string, { count: number; genres: Record<string, number> }> = {
    morning: { count: 0, genres: {} },
    afternoon: { count: 0, genres: {} },
    evening: { count: 0, genres: {} },
    night: { count: 0, genres: {} },
  };
  lastSongs.forEach((p) => {
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

  const songsList = lastSongs
    .map((p, i) => `${i + 1}. "${p.track?.name ?? ''}" - ${p.track?.artists?.[0]?.name ?? ''} (${new Date(p.played_at ?? 0).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })})`)
    .join('\n');

  const repeatedList = topRepeated.map((r, i) => `${i + 1}. "${r.name}" - ${r.artist} (${r.count} kez)`).join('\n');

  return `
KULLANICI MÜZİK ANALİZİ (Son ${FORTUNE_LAST_DAYS} gün)

## Dinlenen ${FORTUNE_SONGS_COUNT} Şarkı (son dinlenenler)
${songsList || '-'}

## En Az ${FORTUNE_MIN_REPEATS} Kez Tekrar Dinlenen İlk ${FORTUNE_TOP_REPEATED_COUNT} Şarkı
${repeatedList || '-'}

## En Çok Dinlenen Müzik Türleri
${genreLabels}

## Günün Ritmi (saat dilimlerine göre dinleme + tür)
${rhythmLines.join('\n')}
`.trim();
}
