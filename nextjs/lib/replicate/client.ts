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

  // Replicate LLMs vary: some use prompt only, some use prompt + system_prompt
  const input: Record<string, unknown> = {
    prompt: userPrompt,
    max_tokens: maxTokens,
    temperature: Math.min(2, Math.max(0, temperature)),
  };
  if (systemPrompt) {
    input.system_prompt = systemPrompt;
  }

  const output = (await replicate.run(modelId as `${string}/${string}`, { input })) as unknown;

  // Output can be: string, string[], or { output: string }
  if (typeof output === 'string') return output.trim();
  if (Array.isArray(output) && output.length > 0) {
    const first = output[0];
    return typeof first === 'string' ? first.trim() : String(first).trim();
  }
  if (output && typeof output === 'object' && 'output' in output) {
    const out = (output as { output: unknown }).output;
    return typeof out === 'string' ? out.trim() : String(out ?? '').trim();
  }

  return String(output ?? '').trim();
}
