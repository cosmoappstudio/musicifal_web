/**
 * Simple cookie-based session (user_id)
 * For production, consider JWT or Supabase Auth
 */

import { cookies } from 'next/headers';

const SESSION_COOKIE = 'musicifal_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setSession(userId: string) {
  const c = await cookies();
  c.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

export async function getSession(): Promise<string | null> {
  const c = await cookies();
  return c.get(SESSION_COOKIE)?.value ?? null;
}

export async function clearSession() {
  const c = await cookies();
  c.delete(SESSION_COOKIE);
}
