import type { AdminFilters, AdminUser, AdminAnalysis, AdminFortune, Transaction } from '@/types';

/** Map user source to platform for filtering (direct = no platform filter applied) */
function userPlatform(source: AdminUser['source']): 'spotify' | null {
  if (source === 'spotify') return source;
  return null;
}

export function filterAdminUsers(users: AdminUser[], f: AdminFilters): AdminUser[] {
  return users.filter((u) => {
    if (f.plan !== 'all' && u.plan !== f.plan) return false;
    if (f.platform !== 'all') {
      const p = userPlatform(u.source);
      if (!p || p !== f.platform) return false;
    }
    if (f.gender !== 'all' && u.gender !== f.gender) return false;
    return true;
  });
}

export function filterAdminAnalyses(analyses: AdminAnalysis[], f: AdminFilters): AdminAnalysis[] {
  return analyses.filter((a) => {
    if (f.plan !== 'all' && a.plan !== f.plan) return false;
    if (f.platform !== 'all' && a.platform !== f.platform) return false;
    if (f.gender !== 'all' && a.gender !== f.gender) return false;
    if (f.genre !== 'all' && a.dominantGenre !== f.genre) return false;
    return true;
  });
}

export function filterAdminFortunes(
  fortunes: AdminFortune[],
  f: AdminFilters,
  userIds?: Set<string>
): AdminFortune[] {
  return fortunes.filter((fortune) => {
    if (f.plan !== 'all' && fortune.plan !== f.plan) return false;
    if (userIds && !userIds.has(fortune.userId)) return false;
    return true;
  });
}

export function filterTransactions(transactions: Transaction[], f: AdminFilters): Transaction[] {
  if (f.plan === 'all') return transactions;
  return transactions.filter((tx) => tx.plan === f.plan);
}
