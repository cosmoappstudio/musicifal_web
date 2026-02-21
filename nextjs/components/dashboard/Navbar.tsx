'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Music2, LayoutDashboard, Sparkles, Settings, LogOut, ChevronDown, Zap, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockUser } from '@/lib/mock-data';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';

const PLAN_COLORS = {
  free: 'bg-white/10 text-white/60',
  weekly: 'bg-[#7C3AED]/20 text-[#A855F7] border border-[#7C3AED]/30',
  monthly: 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30',
  yearly: 'bg-gradient-to-r from-[#D97706]/20 to-[#F59E0B]/20 text-[#F59E0B] border border-[#D97706]/40',
};

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navLinks = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/dashboard/fortune`, label: t('fortune'), icon: Sparkles },
    { href: `/${locale}/dashboard/settings`, label: t('settings'), icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0D0B1E]/80 backdrop-blur-xl">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-[#7C3AED] rounded-lg blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative flex items-center justify-center w-8 h-8 bg-[#7C3AED] rounded-lg">
                <Music2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="font-bold text-lg tracking-tight">
              Musicifal
            </span>
          </Link>

          {/* Nav links - desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-[#A598C7] hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 rounded-lg bg-white/[0.08] -z-10"
                      transition={{ type: 'spring', duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher />

            {/* Plan badge */}
            <span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${PLAN_COLORS[mockUser.plan]}`}>
              {mockUser.plan === 'yearly' && <Zap className="w-3 h-3 mr-1" />}
              {mockUser.plan}
            </span>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-white/[0.05] transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
                    <AvatarFallback className="bg-[#7C3AED] text-white text-xs">
                      {mockUser.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-3.5 h-3.5 text-[#A598C7] hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[#1A1535] border-white/10"
              >
                <div className="px-3 py-2">
                  <p className="font-semibold text-sm">{mockUser.name}</p>
                  <p className="text-xs text-[#A598C7] truncate">{mockUser.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <DropdownMenuItem key={href} asChild className="cursor-pointer">
                    <Link href={href} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href={`/${locale}/admin`} className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#A855F7]" />
                    {t('adminPanel')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="text-red-400 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
