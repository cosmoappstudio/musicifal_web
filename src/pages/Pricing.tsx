import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/lib/subscription';
import { useNavigate } from 'react-router-dom';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: '₺0',
    description: 'Basic music analysis',
    features: [
      'Connect Spotify only',
      'Last 14 days basic analysis',
      'Fortune teaser (1st paragraph)',
      '1 Fortune per month',
      'Watermarked sharing'
    ],
    cta: 'Current Plan',
    variant: 'outline' as const,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '₺49',
    period: '/month',
    description: 'Unlock your full fortune',
    features: [
      'Connect Spotify + YouTube Music',
      'Full 14-day analysis',
      'Full Fortune (4 paragraphs)',
      '4 Languages (TR, EN, DE, RU)',
      '3 Fortunes per month',
      'No watermark'
    ],
    cta: 'Upgrade to Starter',
    variant: 'musicifal' as const,
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₺99',
    period: '/month',
    description: 'For the music obsessed',
    features: [
      'Everything in Starter',
      'Unlimited Fortunes',
      'Fortune History (6 months)',
      'Compare with a friend',
      'Custom Story Themes',
      'Priority AI Generation'
    ],
    cta: 'Go Pro',
    variant: 'outline' as const,
  },
];

export default function Pricing() {
  const { tier, setTier } = useSubscription();
  const navigate = useNavigate();

  const handleUpgrade = (newTier: 'free' | 'starter' | 'pro') => {
    // In a real app, this would redirect to Stripe
    // For prototype, we just update the state
    setTier(newTier);
    alert(`Successfully upgraded to ${newTier.toUpperCase()}!`);
    navigate('/wrapped');
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold mb-4">Choose Your Destiny</h1>
        <p className="text-gray-400 text-lg">Unlock deeper insights into your musical soul.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {TIERS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`bg-[#1A1535] border-white/10 relative flex flex-col ${plan.popular ? 'border-[#7C3AED] shadow-lg shadow-[#7C3AED]/20' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7C3AED] text-white px-3 py-1 rounded-full text-sm font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-400 text-sm">{plan.period}</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="w-4 h-4 text-[#10B981] mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.variant} 
                className="w-full"
                onClick={() => handleUpgrade(plan.id as any)}
                disabled={tier === plan.id}
              >
                {tier === plan.id ? 'Current Plan' : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
