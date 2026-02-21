'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Users, CreditCard, Sparkles, DollarSign, RotateCcw } from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  users: Users,
  creditCard: CreditCard,
  trendingUp: TrendingUp,
  sparkles: Sparkles,
  dollarSign: DollarSign,
  rotateCcw: RotateCcw,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: keyof typeof ICON_MAP;
  iconColor?: string;
  iconBg?: string;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconColor = 'text-[#A855F7]',
  iconBg = 'bg-[#7C3AED]/15',
  delay = 0,
}: StatsCardProps) {
  const Icon = ICON_MAP[icon] ?? Users;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="surface-card p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="text-sm font-medium text-[#A598C7]">{title}</p>
      {subtitle && <p className="text-xs text-[#A598C7]/60 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}
