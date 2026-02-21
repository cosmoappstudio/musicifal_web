import { useState, useEffect } from 'react';
import { useSubscription } from '@/lib/subscription';

export function useFeatureGating() {
  const { tier, features } = useSubscription();
  
  return {
    tier,
    ...features,
    isPro: tier === 'pro',
    isStarter: tier === 'starter',
    isFree: tier === 'free',
  };
}
