'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminFilters } from '@/context/AdminFilterContext';
import { filterAdminUsers } from '@/lib/admin-filters';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { mockAdminUsers } from '@/lib/mock-data';
import { MoreHorizontal, Search } from 'lucide-react';
import type { Plan } from '@/types';

const PLAN_STYLES: Record<Plan, string> = {
  free: 'bg-white/5 text-white/50 border-white/10',
  weekly: 'bg-[#7C3AED]/10 text-[#A855F7] border-[#7C3AED]/20',
  monthly: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
  yearly: 'bg-[#D97706]/10 text-[#F59E0B] border-[#D97706]/20',
};

export default function UsersTable() {
  const t = useTranslations('admin');
  const { filters } = useAdminFilters();
  const [search, setSearch] = useState('');

  const filteredByFilters = filterAdminUsers(mockAdminUsers, filters);
  const filtered = filteredByFilters.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-card overflow-hidden overflow-x-auto"
    >
      {/* Filters */}
      <div className="p-4 border-b border-white/[0.06] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A598C7]" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-[#A598C7] focus:outline-none focus:border-[#7C3AED]/40"
          />
        </div>
        <p className="text-xs text-[#A598C7] self-center">
          {filtered.length} / {mockAdminUsers.length}
        </p>
      </div>

      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="text-[#A598C7] text-xs font-medium">{t('user')}</TableHead>
            <TableHead className="text-[#A598C7] text-xs font-medium">Plan</TableHead>
            <TableHead className="text-[#A598C7] text-xs font-medium hidden sm:table-cell">{t('joinedDate')}</TableHead>
            <TableHead className="text-[#A598C7] text-xs font-medium hidden md:table-cell">{t('lastLogin')}</TableHead>
            <TableHead className="text-[#A598C7] text-xs font-medium hidden lg:table-cell">{t('source')}</TableHead>
            <TableHead className="text-[#A598C7] text-xs font-medium hidden lg:table-cell">{t('fortuneCount')}</TableHead>
            <TableHead className="text-[#A598C7] text-xs font-medium">Durum</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((user, i) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className="border-white/[0.04] hover:bg-white/[0.02] transition-colors"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-white/10 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-[#A598C7] hidden sm:block">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase border ${PLAN_STYLES[user.plan]}`}>
                  {user.plan}
                </span>
              </TableCell>
              <TableCell className="text-xs text-[#A598C7] hidden sm:table-cell">{user.joinedAt}</TableCell>
              <TableCell className="text-xs text-[#A598C7] hidden md:table-cell">{user.lastLogin}</TableCell>
              <TableCell className="text-xs text-[#A598C7] hidden lg:table-cell capitalize">{user.source}</TableCell>
              <TableCell className="text-xs text-white font-semibold hidden lg:table-cell">{user.fortuneCount}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={`text-[10px] font-medium ${
                    user.status === 'active'
                      ? 'border-green-500/30 text-green-400'
                      : 'border-red-500/30 text-red-400'
                  }`}
                >
                  {user.status === 'active' ? t('active') : t('suspended')}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-lg hover:bg-white/[0.05] text-[#A598C7] hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1A1535] border-white/10">
                    <DropdownMenuItem className="text-xs cursor-pointer">{t('changePlan')}</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer">{t('resetFortune')}</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer">{t('viewDetails')}</DropdownMenuItem>
                    <DropdownMenuItem className="text-xs cursor-pointer text-red-400">{t('suspend')}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </motion.div>
  );
}
