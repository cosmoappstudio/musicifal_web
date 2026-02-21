/**
 * Server-side auth helpers
 */

import { getSession } from '@/lib/session';
import { createServiceClient } from '@/lib/supabase/client';

export interface CurrentUser {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  plan: 'free' | 'weekly' | 'monthly' | 'yearly';
  spotifyConnected: boolean;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const userId = await getSession();
  if (!userId) return null;

  const supabase = createServiceClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('id, name, email, avatar_url, plan')
    .eq('id', userId)
    .single();

  if (error || !user) return null;

  const { count } = await supabase
    .from('spotify_tokens')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return {
    id: user.id,
    name: user.name ?? null,
    email: user.email ?? null,
    avatarUrl: user.avatar_url ?? null,
    plan: (user.plan as CurrentUser['plan']) ?? 'free',
    spotifyConnected: (count ?? 0) > 0,
  };
}
