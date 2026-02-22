/**
 * Generate fortune text using Replicate AI.
 * Always loads full raw data and computes fresh analysis params for a personalized prompt.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { generateText } from '@/lib/replicate/client';
import { getSession } from '@/lib/session';
import { computeFortuneParams, getFortuneDataParamsDescription, paramsToPromptText } from '@/lib/fortune/build-summary';

export interface FortuneGenerateBody {
  locale?: string;
}

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  let body: FortuneGenerateBody = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Always load full raw data so the prompt is as rich and personalized as possible
  const { data: raw } = await supabase
    .from('spotify_raw_data')
    .select('recently_played, genre_analysis, top_artists_short, top_tracks_short, audio_features, devices')
    .eq('user_id', userId)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single();

  if (!raw?.recently_played?.length) {
    return NextResponse.json({ error: 'No Spotify data. Önce Verilerimi Getir yap.' }, { status: 400 });
  }

  // Compute fresh analysis params — includes audio profile, devices, rhythm, repeated tracks
  const freshParams = computeFortuneParams({
    recentlyPlayed: raw.recently_played as Parameters<typeof computeFortuneParams>[0]['recentlyPlayed'],
    genreAnalysis: raw.genre_analysis as Parameters<typeof computeFortuneParams>[0]['genreAnalysis'],
    topArtistsShort: raw.top_artists_short as Parameters<typeof computeFortuneParams>[0]['topArtistsShort'],
    audioFeatures: raw.audio_features as Parameters<typeof computeFortuneParams>[0]['audioFeatures'],
    devices: raw.devices as Parameters<typeof computeFortuneParams>[0]['devices'],
  });

  const analysisSummary = paramsToPromptText(freshParams);

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

  const locale = (body.locale ?? 'tr') as 'tr' | 'en' | 'de' | 'ru';

  const systemPrompt = (settings.fortune_prompt_template as string).replace(
    '{{DATA_PARAMS}}',
    getFortuneDataParamsDescription()
  );

  try {
    const text = await generateText({
      modelId: settings.replicate_model_id,
      systemPrompt,
      userPrompt: analysisSummary,
      maxTokens: settings.fortune_max_tokens ?? 1024,
      temperature: Number(settings.fortune_temperature ?? 0.85),
    });

    const { error: insertErr } = await supabase.from('fortunes').insert({
      user_id: userId,
      text,
      language: locale,
      featured: false,
      generated_at: new Date().toISOString(),
    });
    if (insertErr) console.error('Fortune save error:', insertErr);

    return NextResponse.json({ text });
  } catch (err) {
    console.error('Fortune generate error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    );
  }
}
