import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SubscriptionTier = 'free' | 'starter' | 'pro';

interface SubscriptionState {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  features: {
    canSeeFullFortune: boolean;
    canSeeHistory: boolean;
    canShareStory: boolean;
    allowedLanguages: string[];
    fortuneLimit: number;
  };
}

const TIER_FEATURES = {
  free: {
    canSeeFullFortune: false,
    canSeeHistory: false,
    canShareStory: false,
    allowedLanguages: ['tr'],
    fortuneLimit: 1,
  },
  starter: {
    canSeeFullFortune: true,
    canSeeHistory: false,
    canShareStory: true,
    allowedLanguages: ['tr', 'en', 'de', 'ru'], // User chose 3, but we'll allow all for simplicity in code
    fortuneLimit: 3,
  },
  pro: {
    canSeeFullFortune: true,
    canSeeHistory: true,
    canShareStory: true,
    allowedLanguages: ['tr', 'en', 'de', 'ru'],
    fortuneLimit: 9999,
  },
};

export const useSubscription = create<SubscriptionState>()(
  persist(
    (set) => ({
      tier: 'free',
      features: TIER_FEATURES.free,
      setTier: (tier) => set({ tier, features: TIER_FEATURES[tier] }),
    }),
    {
      name: 'musicifal-subscription',
    }
  )
);
