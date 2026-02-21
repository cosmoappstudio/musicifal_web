/**
 * Admin app settings - GET (read) and PATCH (update)
 * TODO: Add admin auth check (e.g. admin role or secret header)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';

export interface AISettings {
  replicateModelId: string;
  fortunePromptTemplate: string;
  fortuneMaxTokens: number;
  fortuneTemperature: number;
  fortuneTestMode: boolean;
}

export async function GET() {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('app_settings')
    .select('replicate_model_id, fortune_prompt_template, fortune_max_tokens, fortune_temperature, fortune_test_mode')
    .eq('id', 'default')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
  }

  return NextResponse.json({
    ai: {
      replicateModelId: data.replicate_model_id ?? 'meta/meta-llama-3-8b-instruct',
      fortunePromptTemplate: data.fortune_prompt_template ?? '',
      fortuneMaxTokens: data.fortune_max_tokens ?? 1024,
      fortuneTemperature: Number(data.fortune_temperature ?? 0.85),
      fortuneTestMode: data.fortune_test_mode ?? false,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const ai = body.ai as Partial<AISettings> | undefined;

  if (!ai) {
    return NextResponse.json({ error: 'ai object required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof ai.replicateModelId === 'string') updates.replicate_model_id = ai.replicateModelId.trim();
  if (typeof ai.fortunePromptTemplate === 'string') updates.fortune_prompt_template = ai.fortunePromptTemplate;
  if (typeof ai.fortuneMaxTokens === 'number') updates.fortune_max_tokens = ai.fortuneMaxTokens;
  if (typeof ai.fortuneTemperature === 'number') updates.fortune_temperature = ai.fortuneTemperature;
  if (typeof ai.fortuneTestMode === 'boolean') updates.fortune_test_mode = ai.fortuneTestMode;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from('app_settings')
    .update(updates)
    .eq('id', 'default');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
