'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Music,
  Sparkles,
  DollarSign,
  Settings,
  Music2,
  LogOut,
  PieChart,
} from 'lucide-react';
import { mockUser } from '@/lib/mock-data';

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const pathname = usePathname();

  const navItems = [
    { href: `/${locale}/admin`, icon: BarChart3, label: t('overview') },
    { href: `/${locale}/admin/users`, icon: Users, label: t('users') },
    { href: `/${locale}/admin/analytics`, icon: PieChart, label: t('analytics') },
    { href: `/${locale}/admin/analyses`, icon: Music, label: t('analyses') },
    { href: `/${locale}/admin/fortunes`, icon: Sparkles, label: t('fortunes') },
    { href: `/${locale}/admin/revenue`, icon: DollarSign, label: t('revenue') },
    { href: `/${locale}/admin/settings`, icon: Settings, label: t('appSettings') },
  ];

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-white/[0.06] bg-[#130F2A]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="w-8 h-8 bg-[#7C3AED] rounded-lg flex items-center justify-center">
          <Music2 className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm">Musicifal</p>
          <p className="text-[10px] text-[#A598C7] uppercase tracking-wider">{t('title')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== `/${locale}/admin` && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-white bg-[#7C3AED]/15 border border-[#7C3AED]/20'
                  : 'text-[#A598C7] hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#A855F7]' : ''}`} />
              {label}
              {isActive && (
                <motion.div
                  layoutId="admin-sidebar-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#7C3AED] rounded-full"
                  transition={{ type: 'spring', duration: 0.4 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mockUser.avatarUrl}
            alt={mockUser.name}
            className="w-8 h-8 rounded-full border border-white/10"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{mockUser.name}</p>
            <p className="text-[10px] text-[#A598C7]">Admin</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-[#A598C7] hover:text-white flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}
