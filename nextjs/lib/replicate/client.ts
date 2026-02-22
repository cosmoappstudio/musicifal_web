/**
 * Replicate API client for AI text generation (fortune interpretation)
 * @see https://replicate.com/docs/get-started/nodejs
 */

import Replicate from 'replicate';

export interface GenerateFortuneParams {
  /** Replicate model ID e.g. meta/meta-llama-3-8b-instruct */
  modelId: string;
  /** System prompt (fortune persona + instructions) */
  systemPrompt: string;
  /** User prompt with analysis context */
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generateText(params: GenerateFortuneParams): Promise<string> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN is not set');
  }

  const replicate = new Replicate({ auth: token });
  const {
    modelId,
    systemPrompt,
    userPrompt,
    maxTokens = 1024,
    temperature = 0.85,
  } = params;

  const isGemini = modelId.startsWith('google/gemini');
  const temp = Math.min(2, Math.max(0, temperature));

  const input: Record<string, unknown> = isGemini
    ? {
        prompt: userPrompt,
        max_output_tokens: maxTokens,
        temperature: temp,
        ...(systemPrompt ? { system_instruction: systemPrompt } : {}),
      }
    : {
        prompt: userPrompt,
        max_tokens: maxTokens,
        temperature: temp,
        ...(systemPrompt ? { system_prompt: systemPrompt } : {}),
      };

  const output = (await replicate.run(modelId as `${string}/${string}`, { input })) as unknown;

  // Output can be: string, string[], or { output: string }
  if (typeof output === 'string') return output.trim();
  if (Array.isArray(output)) {
    return output.map((c) => (typeof c === 'string' ? c : String(c ?? ''))).join('').trim();
  }
  if (output && typeof output === 'object' && 'output' in output) {
    const out = (output as { output: unknown }).output;
    if (Array.isArray(out)) {
      return out.map((c) => (typeof c === 'string' ? c : String(c ?? ''))).join('').trim();
    }
    return typeof out === 'string' ? out.trim() : String(out ?? '').trim();
  }

  return String(output ?? '').trim();
}
