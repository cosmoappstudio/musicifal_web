'use client';

import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import GenreChart from './GenreChart';
import TimeOfDayGrid from './TimeOfDayGrid';
import TopArtistsGrid from './TopArtistsGrid';
import TopRepeatedSongs from './TopRepeatedSongs';
import Top50Songs from './Top50Songs';
import FortuneCard from './FortuneCard';
import UpgradeBanner from './UpgradeBanner';
import FetchDataPrompt from './FetchDataPrompt';
import DashboardHero from './DashboardHero';
import { useDashboard } from '@/context/DashboardContext';

function SectionSkeleton() {
  return (
    <div className="surface-card p-6 space-y-3">
      <Skeleton className="h-6 w-40 bg-white/[0.05]" />
      <Skeleton className="h-4 w-64 bg-white/[0.04]" />
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardContent({ locale }: { locale: string }) {
  const { analysis } = useDashboard();

  return (
    <>
      <UpgradeBanner />
      <DashboardHero locale={locale} />

      {!analysis ? (
        <FetchDataPrompt />
      ) : (
        <div className="space-y-6">
          <Suspense fallback={<SectionSkeleton />}>
            <GenreChart />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <TimeOfDayGrid />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <TopArtistsGrid />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <Top50Songs />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <TopRepeatedSongs />
          </Suspense>
          <Suspense fallback={<SectionSkeleton />}>
            <FortuneCard />
          </Suspense>
        </div>
      )}
    </>
  );
}
