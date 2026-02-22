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
    const cleaned = text.replace(/```json\s?/g, '').replace(/```\s?/g, '').trim();
    const parsed = JSON.parse(cleaned) as GenreAnalysisResult;
    if (!Array.isArray(parsed.genres) || !Array.isArray(parsed.songGenres)) {
      return { genres: [], songGenres: [] };
    }
    return parsed;
  } catch {
    return { genres: [], songGenres: [] };
  }
}

export async function analyzeGenres(
  songs: Array<{ name: string; artist: string; playedAt?: string }>,
  modelId: string = 'meta/meta-llama-3-8b-instruct'
): Promise<GenreAnalysisResult> {
  if (songs.length === 0) {
    return { genres: [], songGenres: [] };
  }

  const list = songs
    .slice(0, 50)
    .map((s, i) => `${i + 1}. "${s.name}" - ${s.artist}`)
    .join('\n');

  const userPrompt = `Bu şarkı listesini analiz et ve JSON döndür:

${list}

Yanıt sadece şu formatta JSON olsun. genre/name SADECE müzik türü (Pop, Rock, Trap vb.), SANATÇI ADI DEĞİL:
{"genres":[{"name":"Pop","percentage":35},{"name":"Hip Hop","percentage":25}],"songGenres":[{"song":"Şarkı","artist":"Sanatçı","genre":"Pop"}]}`;

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    console.warn('[GenreAnalysis] REPLICATE_API_TOKEN not set, skipping');
    return { genres: [], songGenres: [] };
  }

  try {
    const output = await generateText({
      modelId,
      systemPrompt: GENRE_ANALYSIS_SYSTEM,
      userPrompt,
      maxTokens: 2048,
      temperature: 0.3,
    });
    return parseGenreAnalysis(output);
  } catch (err) {
    console.error('[GenreAnalysis] error:', err);
    return { genres: [], songGenres: [] };
  }
}
