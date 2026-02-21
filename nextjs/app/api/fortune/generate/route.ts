/**
 * Generate fortune text using Replicate AI
 * Expects analysis summary as JSON body
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { generateText } from '@/lib/replicate/client';
import { getSession } from '@/lib/session';

export interface FortuneGenerateBody {
  /** Analysis summary (genres, top artists, time of day, etc.) */
  analysisSummary: string;
  /** Optional override locale for output language hint */
  locale?: string;
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: FortuneGenerateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { analysisSummary } = body;
  if (!analysisSummary || typeof analysisSummary !== 'string') {
    return NextResponse.json({ error: 'analysisSummary required' }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Load AI settings
  const { data: settings, error: settingsErr } = await supabase
    .from('app_settings')
    .select('replicate_model_id, fortune_prompt_template, fortune_max_tokens, fortune_temperature, fortune_test_mode')
    .eq('id', 'default')
    .single();

  if (settingsErr || !settings) {
    console.error('App settings load error:', settingsErr);
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
  }

  if (settings.fortune_test_mode) {
    return NextResponse.json({
      text: `[Test mode] Fal yorumu burada görünecek. Gerçek analiz:\n\n${analysisSummary.slice(0, 500)}...`,
    });
  }

  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Replicate API not configured' }, { status: 500 });
  }

  try {
    const text = await generateText({
      modelId: settings.replicate_model_id,
      systemPrompt: settings.fortune_prompt_template,
      userPrompt: analysisSummary,
      maxTokens: settings.fortune_max_tokens ?? 1024,
      temperature: Number(settings.fortune_temperature ?? 0.85),
    });

    // Optional: save fortune to DB for history (future)
    return NextResponse.json({ text });
  } catch (err) {
    console.error('Fortune generate error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
