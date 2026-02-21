/**
 * Lemon Squeezy webhook handler
 * Updates user plan on subscription/order events
 * @see https://docs.lemonsqueezy.com/guides/developer-guide/webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/lemonsqueezy/verify-webhook';
import { createServiceClient } from '@/lib/supabase/client';
import type { LemonSqueezyWebhookPayload, Plan } from '@/lib/lemonsqueezy/types';

function getPlanFromVariantOrProduct(variantName?: string, productName?: string): Plan | null {
  const s = (variantName ?? productName ?? '').toLowerCase();
  if (s.includes('pro')) return 'pro';
  if (s.includes('starter')) return 'starter';
  return null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (!secret) {
    console.error('LEMONSQUEEZY_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: LemonSqueezyWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName = payload.meta.event_name;
  const customData = payload.meta.custom_data;
  const attrs = payload.data?.attributes as Record<string, unknown> | undefined;

  if (!attrs) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // custom_data from checkout arrives in meta.custom_data
  const userId = String(customData?.user_id ?? (attrs.custom_data as Record<string, unknown>)?.user_id ?? '').trim() || undefined;
  const supabase = createServiceClient();

  const updateUserPlan = async (userId: string, plan: Plan) => {
    await supabase
      .from('users')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('id', userId);
  };

  const setPlanFree = async (userId: string) => {
    await supabase
      .from('users')
      .update({ plan: 'free', updated_at: new Date().toISOString() })
      .eq('id', userId);
  };

  try {
    switch (eventName) {
      case 'order_created':
      case 'subscription_created':
      case 'subscription_updated':
      case 'subscription_resumed':
      case 'subscription_payment_success':
      case 'subscription_payment_recovered': {
        const uid = userId;
        if (uid) {
          const plan = (customData?.plan as Plan) ?? getPlanFromVariantOrProduct(
            attrs.variant_name as string,
            attrs.product_name as string
          );
          if (plan) await updateUserPlan(uid, plan);
        }
        break;
      }

      case 'subscription_cancelled':
      case 'subscription_expired':
      case 'subscription_payment_failed': {
        const uid = userId;
        if (uid) await setPlanFree(uid);
        break;
      }

      default:
        // order_refunded, subscription_paused, etc. - log but don't change plan
        break;
    }

    return new NextResponse(null, { status: 200 });
  } catch (err) {
    console.error('Lemon Squeezy webhook error:', err);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
