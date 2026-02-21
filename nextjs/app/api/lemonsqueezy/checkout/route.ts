/**
 * Create Lemon Squeezy checkout for plan upgrade
 * POST /api/lemonsqueezy/checkout
 * Body: { plan: 'weekly' | 'monthly' | 'yearly' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createServiceClient } from '@/lib/supabase/client';
import { getCheckoutUrl } from '@/lib/lemonsqueezy/checkout';
import type { Plan } from '@/types';

export async function POST(request: NextRequest) {
  const userId = await getSession();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const plan = body.plan as Plan | undefined;
  if (plan !== 'weekly' && plan !== 'monthly' && plan !== 'yearly') {
    return NextResponse.json({ error: 'Invalid plan. Use weekly, monthly or yearly.' }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: user } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const locale = request.headers.get('accept-language')?.includes('de') ? 'de' : 'tr';
    const url = await getCheckoutUrl(plan, {
      userId,
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      locale,
    });
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Lemon Squeezy checkout error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Checkout failed' },
      { status: 500 }
    );
  }
}
