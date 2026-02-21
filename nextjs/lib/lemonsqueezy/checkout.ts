/**
 * Create Lemon Squeezy checkout URLs for Musicifal plans
 */

import { createCheckout } from './client';
import type { Plan } from './types';

// Variant IDs from Lemon Squeezy Dashboard (Products > Variants)
const VARIANT_IDS: Record<Exclude<Plan, 'free'>, string> = {
  starter: process.env.LEMONSQUEEZY_VARIANT_STARTER ?? '',
  pro: process.env.LEMONSQUEEZY_VARIANT_PRO ?? '',
};

export async function getCheckoutUrl(
  plan: Exclude<Plan, 'free'>,
  options: {
    userId: string;
    email?: string;
    name?: string;
    locale?: string;
  }
): Promise<string> {
  const variantId = VARIANT_IDS[plan];
  if (!variantId) {
    throw new Error(`Lemon Squeezy variant not configured for plan: ${plan}`);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://musicifal.app';
  const redirectUrl = `${baseUrl}/tr/dashboard?upgraded=1`;

  return createCheckout({
    storeId: process.env.LEMONSQUEEZY_STORE_ID ?? '',
    variantId,
    customData: {
      user_id: options.userId,
      plan,
    },
    redirectUrl,
    email: options.email,
    name: options.name,
    locale: options.locale ?? 'tr',
  });
}
