/**
 * Replicate-based genre analysis for user's 50 most recent tracks
 * Takes song titles + artists, returns genre breakdown and per-song genres
 */

import { generateText } from './client';

export interface GenreAnalysisResult {
  genres: Array<{ name: string; percentage: number }>;
  songGenres: Array<{ song: string; artist: string; genre: string }>;
}

const GENRE_ANALYSIS_SYSTEM = `Sen bir müzik uzmanısın. Verilen şarkı listesindeki her parçayı analiz edip müzik türü (genre) tahmini yapıyorsun.
KURALLAR:
- Sadece geçerli JSON döndür, başka metin yazma.
- "genres" array: Genel tür dağılımı. Örn: [{"name":"Pop","percentage":35},{"name":"Rock","percentage":25}]. Toplam %100 olmalı.
- "songGenres" array: Her şarkı için. Örn: [{"song":"Şarkı Adı","artist":"Sanatçı","genre":"Pop"}].
- Tür isimleri: Pop, Rock, Hip Hop, R&B, Electronic, Jazz, Folk, Classical, Metal, Indie, Alternative, Punk, Country, Soul, Reggae, Lo-fi, Phonk, House, Techno vb. (Türkçe veya İngilizce olabilir)`;

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

Yanıt sadece şu formatta JSON olsun:
{"genres":[{"name":"Tür1","percentage":X},{"name":"Tür2","percentage":Y}],"songGenres":[{"song":"Şarkı Adı","artist":"Sanatçı","genre":"Tür"}]}`;

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
