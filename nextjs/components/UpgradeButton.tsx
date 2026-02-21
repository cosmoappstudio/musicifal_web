'use client';

import { useCheckout } from '@/hooks/useCheckout';

interface UpgradeButtonProps {
  plan: 'weekly' | 'monthly' | 'yearly';
  children: React.ReactNode;
  className?: string;
  as?: 'button' | 'a';
}

export default function UpgradeButton({ plan, children, className = '', as = 'button' }: UpgradeButtonProps) {
  const { checkout, loading } = useCheckout();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    checkout(plan);
  };

  const sharedClass = `${className} ${loading ? 'opacity-70 pointer-events-none' : ''}`.trim();

  if (as === 'a') {
    return (
      <a href="#" onClick={handleClick} className={sharedClass}>
        {loading ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
            {children}
          </>
        ) : (
          children
        )}
      </a>
    );
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={sharedClass}>
      {loading ? (
        <>
          <span className="inline-block w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
