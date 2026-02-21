'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Menu } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import AdminFilterBar from './AdminFilterBar';
import { AdminFilterProvider } from '@/context/AdminFilterContext';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations('admin');

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-64 min-h-screen flex-col flex-shrink-0 border-r border-white/[0.06] bg-[#130F2A]">
        <AdminSidebar onNavigate={() => {}} />
      </aside>

      {/* Mobile sidebar - Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[260px] max-w-[85vw] border-white/[0.06] bg-[#130F2A] p-0"
        >
          <SheetTitle className="sr-only">{t('menuTitle')}</SheetTitle>
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
        {/* Mobile header with hamburger */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center gap-3 px-4 border-b border-white/[0.06] bg-[#0D0B1E]/95 backdrop-blur-xl">
          <SheetTrigger asChild>
            <button
              className="p-2 -ml-2 rounded-lg text-[#A598C7] hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label={t('openMenu')}
            >
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <span className="font-semibold text-white text-sm">{t('title')}</span>
        </div>
      </Sheet>

      {/* Main content - add top padding on mobile for fixed header */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl">
          <AdminFilterProvider>
            <AdminFilterBar />
            {children}
          </AdminFilterProvider>
        </div>
      </main>
    </div>
  );
}
