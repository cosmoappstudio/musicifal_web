/**
 * Lemon Squeezy webhook and API types
 * @see https://docs.lemonsqueezy.com
 */

export type Plan = 'free' | 'weekly' | 'monthly' | 'yearly';

export type LemonSqueezyWebhookEvent =
  | 'order_created'
  | 'order_refunded'
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'subscription_resumed'
  | 'subscription_expired'
  | 'subscription_paused'
  | 'subscription_unpaused'
  | 'subscription_payment_success'
  | 'subscription_payment_failed'
  | 'subscription_payment_recovered';

export interface LemonSqueezyWebhookPayload {
  meta: {
    event_name: LemonSqueezyWebhookEvent;
    custom_data?: {
      user_id?: string;
      plan?: Plan;
    };
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}

export interface LemonSqueezyCheckoutAttributes {
  store_id: number;
  variant_id: number;
  custom_price?: number | null;
  product_options?: {
    redirect_url?: string;
    enabled_variants?: number[];
    [key: string]: unknown;
  };
  checkout_options?: {
    locale?: string;
    button_color?: string;
    [key: string]: unknown;
  };
  checkout_data?: {
    email?: string;
    name?: string;
    custom?: Record<string, string | number>;
  };
  url?: string;
}
