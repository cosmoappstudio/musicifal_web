/**
 * Lemon Squeezy API client
 */

const LEMONSQUEEZY_API = 'https://api.lemonsqueezy.com/v1';

async function lsFetch<T>(
  endpoint: string,
  init: RequestInit = {},
  jsonBody?: object
): Promise<T> {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY;
  if (!apiKey) {
    throw new Error('LEMONSQUEEZY_API_KEY is not set');
  }

  const res = await fetch(`${LEMONSQUEEZY_API}${endpoint}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers as Record<string, string>),
    },
    body: jsonBody ? JSON.stringify(jsonBody) : init.body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Lemon Squeezy API ${res.status}: ${err}`);
  }

  return res.json();
}

export interface CreateCheckoutParams {
  storeId: string;
  variantId: string;
  customData?: Record<string, string | number>;
  redirectUrl?: string;
  email?: string;
  name?: string;
  locale?: string;
}

export interface CreateCheckoutResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      url: string;
      [key: string]: unknown;
    };
  };
}

export async function createCheckout(params: CreateCheckoutParams): Promise<string> {
  const storeId = process.env.LEMONSQUEEZY_STORE_ID ?? params.storeId;
  const body = {
    data: {
      type: 'checkouts',
      attributes: {
        product_options: {
          redirect_url: params.redirectUrl,
        },
        checkout_data: {
          custom: params.customData,
          email: params.email,
          name: params.name,
        },
        checkout_options: params.locale ? { locale: params.locale } : undefined,
      },
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
        variant: { data: { type: 'variants', id: params.variantId } },
      },
    },
  };

  const res = await lsFetch<CreateCheckoutResponse>('/checkouts', { method: 'POST' }, body);

  return res.data.attributes.url as string;
}
