'use client';

import { useState, useCallback } from 'react';
import type { Plan } from '@/types';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = useCallback(async (plan: 'weekly' | 'monthly' | 'yearly') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError('Lütfen giriş yapın');
          window.location.href = '/api/auth/spotify';
          return;
        }
        throw new Error(data.error ?? 'Checkout failed');
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beklenmeyen hata');
    } finally {
      setLoading(false);
    }
  }, []);

  return { checkout, loading, error };
}
