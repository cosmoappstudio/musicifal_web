import { MusicAnalysis, FortuneResult } from '@/types';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// Note: In a real app, this should be initialized with the API key from environment variables
// and handled securely on the server side (Next.js API routes).
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateFortune(analysis: MusicAnalysis): Promise<FortuneResult> {
  const prompt = `
    You are a mystical, insightful fortune teller who reads music data instead of coffee grounds or tarot cards.
    Your name is "Musicifal". You speak in a mystical, warm, personal tone - like a whispered letter.
    Address the user directly as "sen" (TR), "you" (EN), "du" (DE), "tu" (FR).

    Analyze the following user music data (last 14 days):
    ${JSON.stringify(analysis, null, 2)}

    Generate a fortune reading in 4 languages (Turkish, English, German, Russian).
    
    Structure for EACH language:
    1. **Emotional State**: Interpret mood from genre distribution + time patterns.
    2. **The Repeated Song Revelation**: Reference the top repeated songs symbolically.
    3. **Device & Volume Insight**: Read personality from device behavior + volume.
    4. **Mystical Prediction**: A short, striking prediction about the near future.

    Format Rules:
    - 4 paragraphs per language.
    - Total 180-220 words per language.
    - NO emojis in the text.
    - Start with: "Müziğin konuşuyor..." (TR) / "Your music speaks..." (EN) / "Deine Musik spricht..." (DE) / "Твоя музыка говорит..." (RU).
    - End with a single powerful prediction sentence.
    
    Return ONLY a raw JSON object with keys: "tr", "en", "de", "ru". Do not include markdown formatting or code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-latest", // Using Gemini Flash for speed/cost, or Pro for quality
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as FortuneResult;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}
