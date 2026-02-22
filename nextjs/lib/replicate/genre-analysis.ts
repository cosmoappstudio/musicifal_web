/**
 * Replicate-based genre analysis for user's 50 most recent tracks
 * Takes song titles + artists, returns genre breakdown and per-song genres
 */

import { generateText } from './client';

export interface GenreAnalysisResult {
  genres: Array<{ name: string; percentage: number }>;
  songGenres: Array<{ song: string; artist: string; genre: string }>;
}

const GENRE_ANALYSIS_SYSTEM = `Sen bir müzik uzmanısın. Verilen şarkı listesindeki her parçayı analiz edip SADECE müzik türü (genre) tahmini yapıyorsun.
ÖNEMLİ KURALLAR:
- "genres" ve "songGenres" içindeki "name" / "genre" alanları SADECE müzik türü olmalı (Pop, Rock, Hip Hop, Trap, R&B, K-Pop, C-Pop, Türkçe Pop, Akustik, Duygusal, Indie, Lo-fi vb.)
- ASLA sanatçı adı yazma. "Wegh", "Malfine" gibi sanatçı isimleri KESINLIKLE yasak.
- Şarkı türünü bilmiyorsan "Other" veya genel kategori kullan (örn. Pop, Rock).
- Sadece geçerli JSON döndür, başka metin yazma.`;

function parseGenreAnalysis(text: string): GenreAnalysisResult {
  try {
    // Strip markdown code fences and any leading/trailing prose
    let cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    // If model added prose before/after JSON, extract the first {...} block
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      cleaned = cleaned.slice(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleaned) as GenreAnalysisResult;
    if (!Array.isArray(parsed.genres) || !Array.isArray(parsed.songGenres)) {
      console.warn('[GenreAnalysis] parsed JSON missing genres or songGenres arrays');
      return { genres: [], songGenres: [] };
    }
    return {
      genres: parsed.genres.filter((g) => g.name && typeof g.percentage === 'number'),
      songGenres: parsed.songGenres.filter((sg) => sg.song && sg.artist && sg.genre),
    };
  } catch (e) {
    console.error('[GenreAnalysis] JSON parse failed. Raw output (first 500 chars):', text?.slice(0, 500), 'Error:', e);
    return { genres: [], songGenres: [] };
  }
}

// Max songs to send — keep response small to avoid token truncation
const MAX_SONGS_FOR_ANALYSIS = 30;

export async function analyzeGenres(
  songs: Array<{ name: string; artist: string; playedAt?: string }>,
  modelId: string = 'google/gemini-2.5-flash'
): Promise<GenreAnalysisResult> {
  if (songs.length === 0) {
    return { genres: [], songGenres: [] };
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.warn('[GenreAnalysis] REPLICATE_API_TOKEN not set, skipping');
    return { genres: [], songGenres: [] };
  }

  const selected = songs.slice(0, MAX_SONGS_FOR_ANALYSIS);
  const list = selected.map((s, i) => `${i + 1}. "${s.name}" - ${s.artist}`).join('\n');

  const userPrompt = `Aşağıdaki şarkı listesini analiz et. SADECE geçerli JSON döndür, başka metin yazma.

${list}

Beklenen format (genre alanları SADECE müzik türü: Pop, Rock, Hip Hop, Trap, R&B, Indie, Lo-fi, K-Pop, Türkçe Pop vb.):
{"genres":[{"name":"Hip Hop","percentage":40},{"name":"Pop","percentage":30}],"songGenres":[{"song":"${selected[0]?.name ?? 'Şarkı'}","artist":"${selected[0]?.artist ?? 'Sanatçı'}","genre":"Hip Hop"}]}`;

  try {
    const output = await generateText({
      modelId,
      systemPrompt: GENRE_ANALYSIS_SYSTEM,
      userPrompt,
      maxTokens: 4096,
      temperature: 0.2,
    });
    const result = parseGenreAnalysis(output);
    console.log(`[GenreAnalysis] OK — ${result.genres.length} genres, ${result.songGenres.length} songGenres`);
    return result;
  } catch (err) {
    console.error('[GenreAnalysis] error:', err instanceof Error ? err.message : err);
    return { genres: [], songGenres: [] };
  }
}
